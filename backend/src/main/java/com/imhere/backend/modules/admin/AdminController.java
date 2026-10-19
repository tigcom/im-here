package com.imhere.backend.modules.admin;

import com.imhere.backend.common.ApiResponse;
import com.imhere.backend.common.CustomException;
import com.imhere.backend.modules.task.Task;
import com.imhere.backend.modules.task.TaskRepository;
import com.imhere.backend.modules.task.TaskStatus;
import com.imhere.backend.modules.user.Role;
import com.imhere.backend.modules.user.User;
import com.imhere.backend.modules.user.UserRepository;
import com.imhere.backend.modules.user.UserStatus;
import com.imhere.backend.modules.wallet.Transaction;
import com.imhere.backend.modules.wallet.TransactionRepository;
import com.imhere.backend.modules.wallet.TransactionStatus;
import com.imhere.backend.modules.wallet.TransactionType;
import com.imhere.backend.modules.wallet.WalletService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "05 — Super Admin & System Stats", description = "Quản trị lực lượng CTV, đối soát và số liệu toàn hệ thống")
public class AdminController {

    private final UserRepository userRepository;
    private final TaskRepository taskRepository;
    private final TransactionRepository transactionRepository;
    private final WalletService walletService;

    @GetMapping("/stats")
    @Operation(summary = "Xem thống kê tổng quan hệ thống")
    public ResponseEntity<ApiResponse<SystemStatsResponse>> getSystemStats() {
        long totalUsers = userRepository.count();
        long totalClients = userRepository.countByRole(Role.ROLE_CLIENT) + userRepository.countByRole(Role.ROLE_USER);
        long totalShepherds = userRepository.countByRole(Role.ROLE_SHEPHERD) + userRepository.countByRole(Role.ROLE_USER);
        long totalTasks = taskRepository.count();
        long completedTasks = taskRepository.countByStatus(TaskStatus.APPROVED);
        long openTasks = taskRepository.countByStatus(TaskStatus.CREATED);

        SystemStatsResponse stats = SystemStatsResponse.builder()
                .totalUsers(totalUsers)
                .totalClients(totalClients)
                .totalShepherds(totalShepherds)
                .totalTasks(totalTasks)
                .completedTasks(completedTasks)
                .openTasks(openTasks)
                .completionRate(totalTasks > 0 ? ((double) completedTasks / totalTasks) * 100.0 : 0.0)
                .build();

        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    @GetMapping("/users")
    @Operation(summary = "Lấy danh sách người dùng trong hệ thống")
    public ResponseEntity<ApiResponse<List<User>>> getAllUsers() {
        List<User> users = userRepository.findAll();
        return ResponseEntity.ok(ApiResponse.success(users));
    }

    @PatchMapping("/users/{id}/status")
    @Operation(summary = "Cập nhật trạng thái người dùng (ACTIVE / BLOCKED)")
    public ResponseEntity<ApiResponse<User>> updateUserStatus(
            @PathVariable Long id,
            @RequestParam UserStatus status
    ) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new CustomException("Không tìm thấy người dùng #" + id));
        user.setStatus(status);
        User saved = userRepository.save(user);

        // Nếu chặn tài khoản Worker (BLOCKED), tự động giải phóng các task đang ASSIGNED của người này để tránh kẹt escrow
        if (status == UserStatus.BLOCKED) {
            List<Task> activeTasks = taskRepository.findByAssignedShepherdId(id);
            for (Task t : activeTasks) {
                if (t.getStatus() == TaskStatus.ASSIGNED) {
                    t.setAssignedShepherd(null);
                    t.setStatus(TaskStatus.CREATED);
                    t.setIsCheckedIn(false);
                    t.setCheckedInAt(null);
                    t.setCheckInLatitude(null);
                    t.setCheckInLongitude(null);
                    t.setRejectionReason("Người nhận việc trước đó đã bị Quản trị viên khóa tài khoản. Nhiệm vụ được mở lại cho cộng đồng.");
                    taskRepository.save(t);
                }
            }
        }

        return ResponseEntity.ok(ApiResponse.success("Cập nhật trạng thái thành công", saved));
    }

    @GetMapping("/withdrawals/pending")
    @Operation(summary = "Danh sách yêu cầu rút tiền đang chờ đối soát")
    public ResponseEntity<ApiResponse<List<Transaction>>> getPendingWithdrawals() {
        return ResponseEntity.ok(ApiResponse.success(
                transactionRepository.findByTypeAndStatusOrderByCreatedAtAsc(TransactionType.WITHDRAWAL, TransactionStatus.PENDING)));
    }

    @PostMapping("/withdrawals/{id}/review")
    @Operation(summary = "Phê duyệt hoặc từ chối yêu cầu rút tiền")
    public ResponseEntity<ApiResponse<Transaction>> reviewWithdrawal(
            @PathVariable Long id,
            @RequestParam boolean approved,
            @RequestParam(required = false) String note
    ) {
        return ResponseEntity.ok(ApiResponse.success("Đã xử lý yêu cầu rút tiền", walletService.reviewWithdrawal(id, approved, note)));
    }

    @PostMapping("/users/{id}/kyc/review")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Module 2: Phê duyệt hoặc từ chối hồ sơ CCCD của Worker")
    public ResponseEntity<ApiResponse<User>> reviewWorkerKyc(
            @PathVariable Long id,
            @RequestParam com.imhere.backend.modules.user.KycStatus status,
            @RequestParam(required = false) String rejectionReason
    ) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new CustomException("Không tìm thấy người dùng #" + id));

        if (user.getKycStatus() != com.imhere.backend.modules.user.KycStatus.CHO_DUYET) {
            throw new CustomException("Chỉ hồ sơ đang chờ duyệt mới có thể được xử lý");
        }
        if (status != com.imhere.backend.modules.user.KycStatus.DA_DUYET
                && status != com.imhere.backend.modules.user.KycStatus.TU_CHOI) {
            throw new CustomException("Trạng thái duyệt KYC không hợp lệ");
        }
        if (status == com.imhere.backend.modules.user.KycStatus.TU_CHOI
                && (rejectionReason == null || rejectionReason.isBlank())) {
            throw new CustomException("Bắt buộc nhập lý do từ chối KYC");
        }
        user.setKycStatus(status);
        if (status == com.imhere.backend.modules.user.KycStatus.TU_CHOI) {
            user.setRejectionReason(rejectionReason != null ? rejectionReason : "Thông tin CCCD không rõ ràng hoặc không hợp lệ");
        } else if (status == com.imhere.backend.modules.user.KycStatus.DA_DUYET) {
            user.setRejectionReason(null);
        }

        User saved = userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.success("Đã cập nhật trạng thái KYC thành công", saved));
    }

    @Data
    @Builder
    public static class SystemStatsResponse {
        private long totalUsers;
        private long totalClients;
        private long totalShepherds;
        private long totalTasks;
        private long completedTasks;
        private long openTasks;
        private double completionRate;
    }
}
