package com.imhere.backend.modules.user.dto;

import com.imhere.backend.modules.user.KycStatus;
import com.imhere.backend.modules.user.Role;
import com.imhere.backend.modules.user.User;
import com.imhere.backend.modules.user.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponse {
    private Long id;
    private String email;
    private String fullName;
    private String phone;
    private Role role;
    private UserStatus status;
    private KycStatus kycStatus;
    private String avatarUrl;
    private String workingArea;
    private String bio;
    private Double ratingScore;
    private Integer completedTasksCount;
    private Integer totalAssignedTasks;
    private Double completionRate; // Tỷ lệ hoàn thành %
    private String badgeTitle;     // Huy hiệu danh dự
    private String idCardFrontUrl;
    private String idCardBackUrl;
    private String faceUrl;
    private String bankName;
    private String bankAccountNumber;
    private String bankAccountHolder;
    private String rejectionReason;
    private Instant createdAt;

    public static UserProfileResponse fromEntity(User user) {
        int total = user.getTotalAssignedTasks() != null ? user.getTotalAssignedTasks() : 0;
        int completed = user.getCompletedTasksCount() != null ? user.getCompletedTasksCount() : 0;
        Double rate = total > 0 ? Math.round(((double) completed / total) * 1000.0) / 10.0 : null;

        // Tự động tính huy hiệu dựa trên số lượng task và điểm rating nếu chưa gán cứng
        String badge = user.getBadgeTitle();
        if (badge == null || badge.isBlank()) {
            if (completed >= 50 && (user.getRatingScore() != null && user.getRatingScore() >= 4.8)) {
                badge = "CHIẾN THẦN THỰC ĐỊA";
            } else if (completed >= 20) {
                badge = "TOP AUDITOR";
            } else if (completed >= 5) {
                badge = "CỘNG TÁC VIÊN TÍCH CỰC";
            } else {
                badge = "THÀNH VIÊN MỚI";
            }
        }

        return UserProfileResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .role(user.getRole())
                .status(user.getStatus())
                .kycStatus(user.getKycStatus())
                .avatarUrl(user.getAvatarUrl())
                .workingArea(user.getWorkingArea() != null ? user.getWorkingArea() : "Toàn quốc")
                .bio(user.getBio() != null ? user.getBio() : "Thành viên tích cực của mạng lưới Tôi Đây.")
                .ratingScore(user.getRatingScore())
                .completedTasksCount(completed)
                .totalAssignedTasks(total)
                .completionRate(rate)
                .badgeTitle(badge)
                .idCardFrontUrl(user.getIdCardFrontUrl())
                .idCardBackUrl(user.getIdCardBackUrl())
                .faceUrl(user.getFaceUrl())
                .bankName(user.getBankName())
                .bankAccountNumber(user.getBankAccountNumber())
                .bankAccountHolder(user.getBankAccountHolder())
                .rejectionReason(user.getRejectionReason())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
