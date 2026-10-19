package com.imhere.backend.modules.auth;

import com.imhere.backend.common.ApiResponse;
import com.imhere.backend.config.security.CustomUserDetails;
import com.imhere.backend.modules.auth.dto.AuthResponse;
import com.imhere.backend.modules.auth.dto.LoginRequest;
import com.imhere.backend.modules.auth.dto.RegisterRequest;
import com.imhere.backend.modules.user.User;
import com.imhere.backend.modules.wallet.Wallet;
import com.imhere.backend.modules.wallet.WalletRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Tag(name = "01 — Authentication", description = "Xác thực và phân quyền (Client & Shepherd)")
public class AuthController {

    private final AuthService authService;
    private final WalletRepository walletRepository;
    private final com.imhere.backend.modules.user.UserRepository userRepository;

    @PostMapping("/register")
    @Operation(summary = "Đăng ký tài khoản mới (Doanh nghiệp Client hoặc CTV Shepherd)")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Đăng ký tài khoản thành công", response));
    }

    @PostMapping("/login")
    @Operation(summary = "Đăng nhập hệ thống (nhận JWT Token)")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Đăng nhập thành công", response));
    }

    @GetMapping("/me")
    @Operation(summary = "Lấy thông tin tài khoản hiện tại kèm số dư ví")
    public ResponseEntity<ApiResponse<AuthResponse>> getCurrentUser(@AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Chưa đăng nhập"));
        }
        User user = userRepository.findById(userDetails.getId()).orElse(userDetails.getUser());
        BigDecimal balance = walletRepository.findByUserId(user.getId())
                .map(Wallet::getBalance)
                .orElse(BigDecimal.ZERO);

        AuthResponse response = AuthResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .kycStatus(user.getKycStatus())
                .walletBalance(balance)
                .idCardFrontUrl(user.getIdCardFrontUrl())
                .idCardBackUrl(user.getIdCardBackUrl())
                .rejectionReason(user.getRejectionReason())
                .bankName(user.getBankName())
                .bankAccountNumber(user.getBankAccountNumber())
                .bankAccountHolder(user.getBankAccountHolder())
                .build();

        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
