package com.imhere.backend.modules.user;

import com.imhere.backend.common.ApiResponse;
import com.imhere.backend.common.CustomException;
import com.imhere.backend.config.security.CustomUserDetails;
import com.imhere.backend.modules.user.dto.UserProfileResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@Tag(name = "09 — User Profile & Reputation", description = "Hồ sơ người dùng, tỷ lệ hoàn thành, huy hiệu và uy tín")
public class UserController {

    private final UserRepository userRepository;

    @GetMapping("/profile/me")
    @Operation(summary = "Xem hồ sơ cá nhân của người dùng hiện tại")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getMyProfile(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new CustomException("Không tìm thấy người dùng"));
        return ResponseEntity.ok(ApiResponse.success(UserProfileResponse.fromEntity(user)));
    }

    @GetMapping("/profile/{id}")
    @Operation(summary = "Xem hồ sơ công khai của một người dùng bất kỳ")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getUserProfile(
            @PathVariable Long id
    ) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new CustomException("Không tìm thấy người dùng #" + id));
        return ResponseEntity.ok(ApiResponse.success(UserProfileResponse.fromEntity(user)));
    }

    @PutMapping("/profile/me")
    @Operation(summary = "Cập nhật thông tin cá nhân (Khu vực hoạt động, giới thiệu bản thân)")
    public ResponseEntity<ApiResponse<UserProfileResponse>> updateMyProfile(
            @RequestBody UpdateProfileRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new CustomException("Không tìm thấy người dùng"));

        if (request.getFullName() != null && !request.getFullName().isBlank()) {
            user.setFullName(request.getFullName());
        }
        if (request.getWorkingArea() != null) {
            user.setWorkingArea(request.getWorkingArea());
        }
        if (request.getBio() != null) {
            user.setBio(request.getBio());
        }
        if (request.getAvatarUrl() != null) {
            user.setAvatarUrl(request.getAvatarUrl());
        }
        if (request.getBankName() != null) {
            user.setBankName(request.getBankName());
        }
        if (request.getBankAccountNumber() != null) {
            user.setBankAccountNumber(request.getBankAccountNumber());
        }
        if (request.getBankAccountHolder() != null) {
            user.setBankAccountHolder(request.getBankAccountHolder());
        }

        User saved = userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật hồ sơ thành công", UserProfileResponse.fromEntity(saved)));
    }

    @PostMapping("/kyc/submit")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Người dùng nộp hồ sơ CCCD để xác thực danh tính")
    public ResponseEntity<ApiResponse<User>> submitKyc(
            @RequestParam String frontUrl,
            @RequestParam String backUrl,
            @RequestParam(required = false) String faceUrl,
            @RequestParam(required = false) String idCardNumber,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        if (frontUrl.isBlank() || backUrl.isBlank()) {
            throw new CustomException("Bắt buộc tải đủ ảnh mặt trước và mặt sau CCCD");
        }
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new CustomException("Không tìm thấy người dùng"));

        if (user.getKycStatus() == KycStatus.CHO_DUYET) {
            throw new CustomException("Hồ sơ CCCD của bạn đang trong hàng đợi chờ duyệt. Vui lòng không nộp đè hồ sơ.", HttpStatus.BAD_REQUEST);
        }
        if (user.getKycStatus() == KycStatus.DA_DUYET) {
            throw new CustomException("Tài khoản của bạn đã được phê duyệt KYC thành công. Không cần nộp lại.", HttpStatus.BAD_REQUEST);
        }

        if (idCardNumber != null && !idCardNumber.isBlank()) {
            String trimmedId = idCardNumber.trim();
            userRepository.findByIdCardNumber(trimmedId).ifPresent(existing -> {
                if (!existing.getId().equals(user.getId())) {
                    throw new CustomException("Số CCCD này đã được sử dụng bởi một tài khoản khác", HttpStatus.CONFLICT);
                }
            });
            user.setIdCardNumber(trimmedId);
        }

        user.setIdCardFrontUrl(frontUrl);
        user.setIdCardBackUrl(backUrl);
        if (faceUrl != null) user.setFaceUrl(faceUrl);
        user.setKycStatus(KycStatus.CHO_DUYET);
        user.setRejectionReason(null);

        User saved = userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.success("Nộp hồ sơ CCCD thành công, đang chờ Admin duyệt", saved));
    }

    @Data
    public static class UpdateProfileRequest {
        private String fullName;
        private String workingArea;
        private String bio;
        private String avatarUrl;
        private String bankName;
        private String bankAccountNumber;
        private String bankAccountHolder;
    }
}
