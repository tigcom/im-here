package com.imhere.backend.modules.user;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @JsonIgnore
    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String fullName;

    @Column
    private String phone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private UserStatus status = UserStatus.ACTIVE;

    @Column
    private String avatarUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private KycStatus kycStatus = KycStatus.CHUA_NOP;

    @Column
    private String idCardFrontUrl;

    @Column
    private String idCardBackUrl;

    @Column
    private String faceUrl;

    @Column
    private String idCardNumber;

    @Column
    private String rejectionReason;

    @Column
    private String workingArea; // Khu vực hoạt động (VD: Đống Đa, Hà Nội)

    @Column
    private String bio; // Giới thiệu bản thân

    @Column
    private String bankName; // Tên ngân hàng nhận tiền (VD: Vietcombank, Techcombank, MB Bank,...)

    @Column
    private String bankAccountNumber; // Số tài khoản ngân hàng

    @Column
    private String bankAccountHolder; // Tên chủ tài khoản

    @Column
    private Double ratingScore;

    @Builder.Default
    @Column(nullable = false)
    private Integer completedTasksCount = 0;

    @Builder.Default
    @Column(nullable = false)
    private Integer totalAssignedTasks = 0;

    @Column
    private String badgeTitle; // Huy hiệu: "TÂN BINH", "CHIẾN THẦN THỰC ĐỊA", "TOP AUDITOR"

    @CreationTimestamp
    @Column(updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    private Instant updatedAt;
}
