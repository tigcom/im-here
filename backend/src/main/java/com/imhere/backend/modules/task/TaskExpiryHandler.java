package com.imhere.backend.modules.task;

import com.imhere.backend.modules.user.User;
import com.imhere.backend.modules.user.UserRepository;
import com.imhere.backend.modules.wallet.WalletService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
public class TaskExpiryHandler {

    private static final Logger log = LoggerFactory.getLogger(TaskExpiryHandler.class);

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final WalletService walletService;

    /**
     * Xử lý hết hạn cho 1 task trong transaction độc lập (REQUIRES_NEW).
     * Bắt buộc hoàn tiền thành công TRƯỚC rồi mới đổi và lưu trạng thái CANCELLED,
     * đồng thời gỡ assignedShepherd để task không còn xuất hiện trong danh sách nhận việc của Worker.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void expireSingleTask(Long taskId) {
        Task task = taskRepository.findByIdWithLock(taskId).orElse(null);
        if (task == null) return;

        if (task.getStatus() == TaskStatus.CREATED) {
            // Hoàn lại tiền ký quỹ cho Client trước
            walletService.refundEscrow(task.getClient().getId(), task.getRewardAmount(), task.getId());

            task.setStatus(TaskStatus.CANCELLED);
            task.setRejectionReason("Nhiệm vụ tự động hủy do hết thời hạn tìm người nhận việc");
            taskRepository.save(task);
            log.info("Đã tự động hủy và hoàn tiền thành công cho task CREATED quá hạn #{}", taskId);

        } else if (task.getStatus() == TaskStatus.ASSIGNED) {
            // Task đã được nhận nhưng quá deadline mà Worker không nộp bằng chứng:
            // 1. Hoàn lại 100% tiền ký quỹ cho Client trước
            walletService.refundEscrow(task.getClient().getId(), task.getRewardAmount(), task.getId());

            // 2. Gỡ bỏ assignedShepherd, reset check-in và đổi trạng thái sang CANCELLED
            User worker = task.getAssignedShepherd();
            Long workerId = worker != null ? worker.getId() : null;

            task.setAssignedShepherd(null);
            task.setStatus(TaskStatus.CANCELLED);
            task.setIsCheckedIn(false);
            task.setCheckedInAt(null);
            task.setCheckInLatitude(null);
            task.setCheckInLongitude(null);
            task.setRejectionReason("Nhiệm vụ tự động hủy và hoàn tiền cho người đăng do CTV không hoàn thành trước thời hạn");
            taskRepository.save(task);

            // 3. Giảm totalAssignedTasks của Worker nếu có
            if (workerId != null) {
                User shepherd = userRepository.findById(workerId).orElse(null);
                if (shepherd != null && shepherd.getTotalAssignedTasks() != null && shepherd.getTotalAssignedTasks() > 0) {
                    shepherd.setTotalAssignedTasks(shepherd.getTotalAssignedTasks() - 1);
                    userRepository.save(shepherd);
                }
            }

            log.info("Đã tự động hủy, hoàn tiền và gỡ Worker cho task ASSIGNED quá hạn #{} (Worker: {})", taskId, workerId);
        }
    }
}
