package com.imhere.backend.modules.task;

import com.imhere.backend.common.CustomException;
import com.imhere.backend.modules.task.dto.CreateTaskRequest;
import com.imhere.backend.modules.task.dto.TaskResponse;
import com.imhere.backend.modules.user.Role;
import com.imhere.backend.modules.user.User;
import com.imhere.backend.modules.user.UserRepository;
import com.imhere.backend.modules.wallet.WalletService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskServiceImpl implements TaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final WalletService walletService;
    private final com.imhere.backend.modules.evidence.EvidenceRepository evidenceRepository;
    private final com.imhere.backend.common.RedisDistributedLock redisDistributedLock;
    private final TaskExpiryHandler taskExpiryHandler;

    private static final double EARTH_RADIUS_KM = 6371.0;

    public static double calculateHaversineDistance(double lat1, double lon1, double lat2, double lon2) {
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return EARTH_RADIUS_KM * c;
    }

    @Override
    @Transactional
    public TaskResponse createTask(Long clientId, CreateTaskRequest request) {
        User client = userRepository.findById(clientId)
                .orElseThrow(() -> new CustomException("Không tìm thấy doanh nghiệp (Client)", HttpStatus.NOT_FOUND));

        if (client.getStatus() == com.imhere.backend.modules.user.UserStatus.BLOCKED) {
            throw new CustomException("Tài khoản của bạn đã bị khóa, không thể đăng nhiệm vụ mới", HttpStatus.FORBIDDEN);
        }

        if (client.getKycStatus() != com.imhere.backend.modules.user.KycStatus.DA_DUYET) {
            String reason = "Tài khoản của bạn chưa được duyệt hồ sơ định danh (KYC).";
            if (client.getKycStatus() == com.imhere.backend.modules.user.KycStatus.CHO_DUYET) {
                reason = "Hồ sơ xác thực định danh của bạn đang chờ Admin xét duyệt. Vui lòng quay lại sau khi hồ sơ được phê duyệt.";
            } else if (client.getKycStatus() == com.imhere.backend.modules.user.KycStatus.TU_CHOI) {
                reason = "Hồ sơ định danh của bạn đã bị từ chối. Vui lòng nộp lại hồ sơ trước khi đăng nhiệm vụ.";
            } else {
                reason = "Bạn chưa nộp hồ sơ xác thực định danh (KYC). Vui lòng hoàn tất nộp hồ sơ để mở khóa quyền đăng tin.";
            }
            throw new CustomException(reason, HttpStatus.FORBIDDEN);
        }

        Task task = Task.builder()
                .client(client)
                .title(request.getTitle())
                .description(request.getDescription())
                .category(request.getCategory())
                .status(TaskStatus.CREATED)
                .address(request.getAddress())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .rewardAmount(request.getRewardAmount())
                .instructions(request.getInstructions())
                .checklistRequirementsJson(request.getChecklistRequirementsJson())
                .questionsJson(request.getQuestionsJson())
                .deadline(request.getDeadline())
                .build();

        Task savedTask = taskRepository.save(task);

        // Ký quỹ tiền thưởng từ ví của Client
        walletService.holdEscrow(clientId, request.getRewardAmount(), savedTask.getId());

        return TaskResponse.fromEntity(savedTask);
    }

    @Override
    @Transactional(readOnly = true)
    public TaskResponse getTaskById(Long taskId, Double currentLat, Double currentLng) {
        Task task = taskRepository.findByIdWithAssociations(taskId)
                .or(() -> taskRepository.findById(taskId))
                .orElseThrow(() -> new CustomException("Không tìm thấy nhiệm vụ #" + taskId, HttpStatus.NOT_FOUND));

        Double distance = null;
        if (currentLat != null && currentLng != null) {
            distance = calculateHaversineDistance(currentLat, currentLng, task.getLatitude(), task.getLongitude());
        }
        return TaskResponse.fromEntity(task, distance);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TaskResponse> getAllTasks(TaskStatus status) {
        List<Task> tasks = (status != null)
                ? taskRepository.findByStatus(status)
                : taskRepository.findAllWithAssociations();

        return tasks.stream().map(TaskResponse::fromEntity).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<TaskResponse> getNearbyTasks(Double latitude, Double longitude, Double radiusKm) {
        List<Task> openTasks = taskRepository.findByStatus(TaskStatus.CREATED);

        return openTasks.stream()
                .map(task -> {
                    double dist = calculateHaversineDistance(latitude, longitude, task.getLatitude(), task.getLongitude());
                    return TaskResponse.fromEntity(task, dist);
                })
                .filter(resp -> resp.getDistanceKm() != null && resp.getDistanceKm() <= radiusKm)
                .sorted(Comparator.comparing(TaskResponse::getDistanceKm))
                .collect(Collectors.toList());
    }

    private static final double MAX_CHECKIN_DISTANCE_METERS = 100.0;

    @Override
    @Transactional
    public TaskResponse acceptTask(Long taskId, Long shepherdId) {
        String lockKey = "lock:task:accept:" + taskId;
        String lockValue = "worker:" + shepherdId + ":" + System.currentTimeMillis();

        // 1. Tầng phòng thủ 1: Redis Distributed Lock (TTL 5 giây)
        boolean acquired = redisDistributedLock.acquireLock(lockKey, lockValue, java.time.Duration.ofSeconds(5));
        if (!acquired) {
            throw new CustomException("Nhiệm vụ đang được một người khác xử lý nhận. Vui lòng thử lại sau.", HttpStatus.CONFLICT);
        }

        try {
            // 2. Tầng phòng thủ 2: Pessimistic Write Lock trên PostgreSQL chống Race Condition
            Task task = taskRepository.findByIdWithLock(taskId)
                    .orElseThrow(() -> new CustomException("Không tìm thấy nhiệm vụ", HttpStatus.NOT_FOUND));

            if (task.getStatus() != TaskStatus.CREATED) {
                throw new CustomException("Nhiệm vụ đã được người khác nhận hoặc không ở trạng thái sẵn sàng", HttpStatus.BAD_REQUEST);
            }

            if (task.getDeadline() != null && java.time.Instant.now().isAfter(task.getDeadline())) {
                throw new CustomException("Nhiệm vụ này đã quá hạn hoàn thành, không thể nhận việc", HttpStatus.BAD_REQUEST);
            }

            User shepherd = userRepository.findById(shepherdId)
                    .orElseThrow(() -> new CustomException("Không tìm thấy thông tin CTV (Worker)", HttpStatus.NOT_FOUND));

            if (shepherd.getStatus() == com.imhere.backend.modules.user.UserStatus.BLOCKED) {
                throw new CustomException("Tài khoản của bạn đã bị khóa, không thể nhận nhiệm vụ", HttpStatus.FORBIDDEN);
            }

            // Chặn nhận quá 3 nhiệm vụ cùng lúc để chống găm giữ việc
            long activeTasks = taskRepository.countByAssignedShepherdIdAndStatusIn(
                    shepherdId,
                    List.of(TaskStatus.ASSIGNED, TaskStatus.SUBMITTED)
            );
            if (activeTasks >= 3) {
                throw new CustomException("Bạn đang có " + activeTasks + " nhiệm vụ chưa hoàn tất. Vui lòng hoàn thành trước khi nhận việc mới (Tối đa 3 việc cùng lúc).", HttpStatus.BAD_REQUEST);
            }

            // Chặn không cho tự nhận công việc do chính mình tạo
            if (task.getClient() != null && task.getClient().getId().equals(shepherdId)) {
                throw new CustomException("Bạn không thể tự nhận nhiệm vụ do chính mình đăng", HttpStatus.BAD_REQUEST);
            }

            // BẮT BUỘC 1: Chỉ người nhận việc đã được phê duyệt hồ sơ KYC mới được nhận việc
            if (shepherd.getKycStatus() != com.imhere.backend.modules.user.KycStatus.DA_DUYET) {
                String reason = "Tài khoản của bạn chưa được duyệt hồ sơ định danh (KYC).";
                if (shepherd.getKycStatus() == com.imhere.backend.modules.user.KycStatus.CHO_DUYET) {
                    reason = "Hồ sơ CCCD & sinh trắc học của bạn đang chờ Admin xét duyệt. Vui lòng quay lại sau khi hồ sơ được phê duyệt.";
                } else if (shepherd.getKycStatus() == com.imhere.backend.modules.user.KycStatus.TU_CHOI) {
                    reason = "Hồ sơ định danh của bạn đã bị từ chối. Vui lòng nộp lại hồ sơ trước khi nhận việc.";
                } else {
                    reason = "Bạn chưa nộp hồ sơ định danh CCCD và quét mặt. Vui lòng hoàn tất xác thực tài khoản để nhận việc.";
                }
                throw new CustomException(reason, HttpStatus.FORBIDDEN);
            }

            // BẮT BUỘC 2: Phải thiết lập tài khoản ngân hàng nhận tiền trước khi nhận việc
            if (shepherd.getBankAccountNumber() == null || shepherd.getBankAccountNumber().trim().isEmpty()
                    || shepherd.getBankName() == null || shepherd.getBankName().trim().isEmpty()) {
                throw new CustomException("Bạn cần thiết lập thông tin tài khoản ngân hàng nhận thù lao trước khi nhận nhiệm vụ.", HttpStatus.BAD_REQUEST);
            }

            task.setAssignedShepherd(shepherd);
            task.setStatus(TaskStatus.ASSIGNED);

            // Cập nhật tổng số nhiệm vụ đã nhận để tính tỷ lệ hoàn thành
            shepherd.setTotalAssignedTasks(
                    (shepherd.getTotalAssignedTasks() != null ? shepherd.getTotalAssignedTasks() : 0) + 1
            );
            userRepository.save(shepherd);

            Task updated = taskRepository.save(task);
            return TaskResponse.fromEntity(updated);
        } finally {
            // Luôn giải phóng Redis Lock sau khi hoàn tất giao dịch
            redisDistributedLock.releaseLock(lockKey, lockValue);
        }
    }

    @Override
    @Transactional
    public TaskResponse checkInTask(Long taskId, Long shepherdId, Double latitude, Double longitude) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new CustomException("Không tìm thấy nhiệm vụ #" + taskId, HttpStatus.NOT_FOUND));

        if (task.getAssignedShepherd() == null || !task.getAssignedShepherd().getId().equals(shepherdId)) {
            throw new CustomException("Chỉ CTV được phân công mới có quyền check-in nhiệm vụ này", HttpStatus.FORBIDDEN);
        }

        if (task.getAssignedShepherd().getStatus() == com.imhere.backend.modules.user.UserStatus.BLOCKED) {
            throw new CustomException("Tài khoản của bạn đã bị khóa, không thể điểm danh", HttpStatus.FORBIDDEN);
        }

        if (task.getDeadline() != null && java.time.Instant.now().isAfter(task.getDeadline())) {
            throw new CustomException("Nhiệm vụ này đã quá hạn hoàn thành, không thể điểm danh", HttpStatus.BAD_REQUEST);
        }

        if (task.getStatus() != TaskStatus.ASSIGNED) {
            throw new CustomException("Nhiệm vụ không ở trạng thái đang thực hiện", HttpStatus.BAD_REQUEST);
        }

        if (latitude == null || longitude == null) {
            throw new CustomException("Vui lòng cung cấp tọa độ GPS thực tế để check-in", HttpStatus.BAD_REQUEST);
        }

        // Tính khoảng cách giữa vị trí check-in và vị trí nhiệm vụ
        double distanceKm = calculateHaversineDistance(task.getLatitude(), task.getLongitude(), latitude, longitude);
        double distanceMeters = distanceKm * 1000.0;

        if (distanceMeters > MAX_CHECKIN_DISTANCE_METERS) {
            throw new CustomException(
                    String.format("Bạn đang cách địa điểm thực hiện %.1f mét (Yêu cầu trong bán kính <= 100 mét để Check-in)", distanceMeters),
                    HttpStatus.BAD_REQUEST
            );
        }

        task.setIsCheckedIn(true);
        task.setCheckedInAt(java.time.Instant.now());
        task.setCheckInLatitude(latitude);
        task.setCheckInLongitude(longitude);

        Task saved = taskRepository.save(task);
        return TaskResponse.fromEntity(saved, distanceKm);
    }

    @Override
    @Transactional
    public TaskResponse cancelTask(Long taskId, Long userId, Role userRole) {
        Task task = taskRepository.findByIdWithLock(taskId)
                .orElseThrow(() -> new CustomException("Không tìm thấy nhiệm vụ", HttpStatus.NOT_FOUND));

        boolean isClient = task.getClient() != null && task.getClient().getId().equals(userId);
        boolean isShepherd = task.getAssignedShepherd() != null && task.getAssignedShepherd().getId().equals(userId);
        boolean isAdmin = userRole == Role.ROLE_ADMIN;

        if (isClient || isAdmin) {
            if (task.getStatus() != TaskStatus.CREATED) {
                throw new CustomException("Chỉ có thể hủy nhiệm vụ khi chưa có CTV nào nhận việc", HttpStatus.BAD_REQUEST);
            }
            task.setStatus(TaskStatus.CANCELLED);
            taskRepository.save(task);
            // Hoàn lại tiền ký quỹ cho Client
            walletService.refundEscrow(task.getClient().getId(), task.getRewardAmount(), task.getId());
        } else if (isShepherd) {
            if (task.getStatus() != TaskStatus.ASSIGNED) {
                throw new CustomException("Không thể từ bỏ nhiệm vụ ở trạng thái hiện tại", HttpStatus.BAD_REQUEST);
            }
            // Trả lại trạng thái cho các Shepherd khác nhận, đồng thời reset toàn bộ trạng thái check-in cũ
            task.setAssignedShepherd(null);
            task.setStatus(TaskStatus.CREATED);
            task.setIsCheckedIn(false);
            task.setCheckedInAt(null);
            task.setCheckInLatitude(null);
            task.setCheckInLongitude(null);
            task.setRejectionReason(null);
            taskRepository.save(task);

            // Giảm tổng số task đã nhận cho Shepherd để bảo đảm tính chuẩn xác của tỷ lệ hoàn thành
            User shepherd = userRepository.findById(userId).orElse(null);
            if (shepherd != null && shepherd.getTotalAssignedTasks() != null && shepherd.getTotalAssignedTasks() > 0) {
                shepherd.setTotalAssignedTasks(shepherd.getTotalAssignedTasks() - 1);
                userRepository.save(shepherd);
            }
        } else {
            throw new CustomException("Bạn không có quyền thực hiện thao tác này", HttpStatus.FORBIDDEN);
        }

        return TaskResponse.fromEntity(task);
    }

    @Override
    @Transactional
    public TaskResponse resolveDispute(Long taskId, Long adminId, String resolution, String note) {
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new CustomException("Không tìm thấy quản trị viên", HttpStatus.NOT_FOUND));
        if (admin.getRole() != Role.ROLE_ADMIN) {
            throw new CustomException("Chỉ Quản trị viên mới có quyền can thiệp giải quyết tranh chấp", HttpStatus.FORBIDDEN);
        }

        Task task = taskRepository.findByIdWithLock(taskId)
                .orElseThrow(() -> new CustomException("Không tìm thấy nhiệm vụ #" + taskId, HttpStatus.NOT_FOUND));

        if (task.getStatus() != TaskStatus.ASSIGNED && task.getStatus() != TaskStatus.SUBMITTED) {
            throw new CustomException("Chỉ có thể can thiệp tranh chấp ở trạng thái đang thực hiện hoặc chờ nghiệm thu", HttpStatus.BAD_REQUEST);
        }

        if (note == null || note.isBlank()) {
            throw new CustomException("Bắt buộc nhập biên bản / lý do can thiệp giải quyết tranh chấp", HttpStatus.BAD_REQUEST);
        }

        if ("REFUND_CLIENT".equalsIgnoreCase(resolution)) {
            task.setStatus(TaskStatus.CANCELLED);
            task.setRejectionReason("Admin can thiệp hủy và hoàn tiền ký quỹ: " + note.trim());
            taskRepository.save(task);

            // Đồng bộ trạng thái của các evidence liên quan sang REJECTED để giao diện Client/Admin không còn hiển thị nút duyệt giải ngân
            List<com.imhere.backend.modules.evidence.Evidence> evidences = evidenceRepository.findByTaskIdOrderBySubmittedAtDesc(task.getId());
            for (com.imhere.backend.modules.evidence.Evidence ev : evidences) {
                if (ev.getStatus() == com.imhere.backend.modules.evidence.EvidenceStatus.PENDING || ev.getStatus() == com.imhere.backend.modules.evidence.EvidenceStatus.QA_PASSED) {
                    ev.setStatus(com.imhere.backend.modules.evidence.EvidenceStatus.REJECTED);
                    ev.setReviewNotes("Admin can thiệp tranh chấp: Hủy nhiệm vụ và hoàn tiền cho người đăng (" + note.trim() + ")");
                    ev.setReviewedAt(java.time.Instant.now());
                    evidenceRepository.save(ev);
                }
            }

            // Hoàn lại tiền ký quỹ cho Client
            walletService.refundEscrow(task.getClient().getId(), task.getRewardAmount(), task.getId());
        } else if ("FORCE_APPROVE".equalsIgnoreCase(resolution)) {
            if (task.getAssignedShepherd() == null) {
                throw new CustomException("Nhiệm vụ không có người nhận việc để giải ngân", HttpStatus.BAD_REQUEST);
            }
            task.setStatus(TaskStatus.APPROVED);
            task.setRejectionReason("Admin can thiệp nghiệm thu cưỡng chế: " + note.trim());
            taskRepository.save(task);

            // Đồng bộ trạng thái của evidence sang APPROVED
            List<com.imhere.backend.modules.evidence.Evidence> evidences = evidenceRepository.findByTaskIdOrderBySubmittedAtDesc(task.getId());
            for (com.imhere.backend.modules.evidence.Evidence ev : evidences) {
                if (ev.getStatus() == com.imhere.backend.modules.evidence.EvidenceStatus.PENDING || ev.getStatus() == com.imhere.backend.modules.evidence.EvidenceStatus.QA_PASSED) {
                    ev.setStatus(com.imhere.backend.modules.evidence.EvidenceStatus.APPROVED);
                    ev.setReviewNotes("Admin can thiệp tranh chấp: Nghiệm thu cưỡng chế (" + note.trim() + ")");
                    ev.setReviewedAt(java.time.Instant.now());
                    evidenceRepository.save(ev);
                }
            }

            // Giải phóng tiền cho Shepherd
            walletService.releaseEscrow(
                    task.getClient().getId(),
                    task.getAssignedShepherd().getId(),
                    task.getRewardAmount(),
                    task.getId()
            );
        } else {
            throw new CustomException("Phương thức giải quyết tranh chấp không hợp lệ (hỗ trợ: REFUND_CLIENT hoặc FORCE_APPROVE)", HttpStatus.BAD_REQUEST);
        }

        return TaskResponse.fromEntity(task);
    }

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(TaskServiceImpl.class);

    @org.springframework.scheduling.annotation.Scheduled(fixedDelayString = "${imhere.tasks.cleanup-interval-ms:60000}")
    public void autoExpireOverdueTasks() {
        java.time.Instant now = java.time.Instant.now();
        List<Task> overdueTasks = taskRepository.findByStatusInAndDeadlineBefore(
                List.of(TaskStatus.CREATED, TaskStatus.ASSIGNED),
                now
        );
        for (Task t : overdueTasks) {
            try {
                taskExpiryHandler.expireSingleTask(t.getId());
            } catch (Exception e) {
                log.error("Lỗi khi tự động xử lý hết hạn cho nhiệm vụ #{}: {}", t.getId(), e.getMessage(), e);
            }
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<TaskResponse> getTasksByClient(Long clientId) {
        return taskRepository.findByClientId(clientId).stream()
                .map(TaskResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<TaskResponse> getTasksByShepherd(Long shepherdId) {
        // Chỉ trả về các nhiệm vụ đang thực hiện hoặc đã hoàn thành của Shepherd, loại bỏ task đã bị CANCELLED
        return taskRepository.findByAssignedShepherdIdAndStatusIn(
                shepherdId,
                List.of(TaskStatus.ASSIGNED, TaskStatus.SUBMITTED, TaskStatus.APPROVED)
        ).stream()
                .map(TaskResponse::fromEntity)
                .collect(Collectors.toList());
    }
}
