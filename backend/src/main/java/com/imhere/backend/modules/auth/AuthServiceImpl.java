package com.imhere.backend.modules.auth;

import com.imhere.backend.common.CustomException;
import com.imhere.backend.config.security.JwtTokenProvider;
import com.imhere.backend.modules.auth.dto.AuthResponse;
import com.imhere.backend.modules.auth.dto.LoginRequest;
import com.imhere.backend.modules.auth.dto.RegisterRequest;
import com.imhere.backend.modules.user.Role;
import com.imhere.backend.modules.user.User;
import com.imhere.backend.modules.user.UserRepository;
import com.imhere.backend.modules.user.UserStatus;
import com.imhere.backend.modules.wallet.Wallet;
import com.imhere.backend.modules.wallet.WalletRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = request.getEmail() != null ? request.getEmail().trim().toLowerCase() : "";
        if (userRepository.existsByEmail(email)) {
            throw new CustomException("Email đã được sử dụng", HttpStatus.CONFLICT);
        }

        String phone = request.getPhone() != null ? request.getPhone().trim() : null;
        if (phone != null && !phone.isBlank() && userRepository.existsByPhone(phone)) {
            throw new CustomException("Số điện thoại này đã được đăng ký cho tài khoản khác", HttpStatus.CONFLICT);
        }

        User user = User.builder()
                .email(email)
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .phone(request.getPhone())
                // Vai trò được quyết định bởi quy trình nghiệp vụ, tuyệt đối không nhận từ client.
                .role(Role.ROLE_USER)
                .status(UserStatus.ACTIVE)
                .ratingScore(null)
                .completedTasksCount(0)
                .totalAssignedTasks(0)
                .badgeTitle("THÀNH VIÊN MỚI")
                .build();

        User savedUser = userRepository.save(user);

        // Khởi tạo ví điện tử cho user mới
        Wallet wallet = Wallet.builder()
                .user(savedUser)
                .balance(BigDecimal.ZERO)
                .escrowBalance(BigDecimal.ZERO)
                .build();
        walletRepository.save(wallet);

        String token = jwtTokenProvider.generateToken(
                savedUser.getId(),
                savedUser.getEmail(),
                savedUser.getRole().name()
        );

        return AuthResponse.builder()
                .token(token)
                .id(savedUser.getId())
                .email(savedUser.getEmail())
                .fullName(savedUser.getFullName())
                .role(savedUser.getRole())
                .kycStatus(savedUser.getKycStatus())
                .walletBalance(BigDecimal.ZERO)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String identifier = request.getEmail() != null ? request.getEmail().trim() : "";
        User user = userRepository.findByEmailOrPhone(identifier)
                .orElseThrow(() -> new CustomException("Email, số điện thoại hoặc mật khẩu không chính xác", HttpStatus.UNAUTHORIZED));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new CustomException("Email, số điện thoại hoặc mật khẩu không chính xác", HttpStatus.UNAUTHORIZED);
        }

        if (user.getStatus() == UserStatus.BLOCKED) {
            throw new CustomException("Tài khoản đã bị tạm khóa", HttpStatus.FORBIDDEN);
        }

        BigDecimal balance = walletRepository.findByUserId(user.getId())
                .map(Wallet::getBalance)
                .orElse(BigDecimal.ZERO);

        String token = jwtTokenProvider.generateToken(
                user.getId(),
                user.getEmail(),
                user.getRole().name()
        );

        return AuthResponse.builder()
                .token(token)
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .kycStatus(user.getKycStatus())
                .walletBalance(balance)
                .idCardFrontUrl(user.getIdCardFrontUrl())
                .idCardBackUrl(user.getIdCardBackUrl())
                .rejectionReason(user.getRejectionReason())
                .build();
    }
}
