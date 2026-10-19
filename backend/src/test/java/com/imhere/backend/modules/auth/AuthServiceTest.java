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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private WalletRepository walletRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @InjectMocks
    private AuthServiceImpl authService;

    private RegisterRequest registerRequest;
    private LoginRequest loginRequest;
    private User activeUser;

    @BeforeEach
    void setUp() {
        registerRequest = RegisterRequest.builder()
                .email("test@imhere.vn")
                .password("Password123")
                .fullName("Nguyễn Văn A")
                .phone("0987654321")
                .build();

        loginRequest = LoginRequest.builder()
                .email("test@imhere.vn")
                .password("Password123")
                .build();

        activeUser = User.builder()
                .id(1L)
                .email("test@imhere.vn")
                .password("$2a$10$encodedPassword")
                .fullName("Nguyễn Văn A")
                .role(Role.ROLE_SHEPHERD)
                .status(UserStatus.ACTIVE)
                .ratingScore(5.0)
                .build();
    }

    @Test
    @DisplayName("TDD [Register - Thành công]: Đăng ký tài khoản hợp lệ tạo User, khởi tạo Wallet rỗng và cấp JWT token")
    void register_WhenValidRequest_ShouldCreateUserAndWalletAndReturnToken() {
        when(userRepository.existsByEmail("test@imhere.vn")).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("$2a$10$encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(activeUser);
        when(walletRepository.save(any(Wallet.class))).thenReturn(
                Wallet.builder().id(10L).user(activeUser).balance(BigDecimal.ZERO).build()
        );
        when(jwtTokenProvider.generateToken(any(), any(), any())).thenReturn("mocked.jwt.token");

        AuthResponse response = authService.register(registerRequest);

        assertThat(response).isNotNull();
        assertThat(response.getToken()).isEqualTo("mocked.jwt.token");
        assertThat(response.getEmail()).isEqualTo("test@imhere.vn");
        assertThat(response.getRole()).isEqualTo(Role.ROLE_SHEPHERD);
        verify(userRepository).save(any(User.class));
        verify(walletRepository).save(any(Wallet.class));
    }

    @Test
    @DisplayName("TDD [Register - Thất bại]: Trùng email phải ném ra CustomException")
    void register_WhenEmailAlreadyExists_ShouldThrowCustomException() {
        when(userRepository.existsByEmail("test@imhere.vn")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(registerRequest))
                .isInstanceOf(CustomException.class)
                .hasMessageContaining("Email đã được sử dụng");

        verify(userRepository, never()).save(any(User.class));
        verify(walletRepository, never()).save(any(Wallet.class));
    }

    @Test
    @DisplayName("TDD [Login - Thành công]: Đăng nhập đúng email & mật khẩu phải trả về Token và số dư ví")
    void login_WhenValidCredentials_ShouldReturnAuthResponse() {
        when(userRepository.findByEmailOrPhone("test@imhere.vn")).thenReturn(Optional.of(activeUser));
        when(passwordEncoder.matches("Password123", activeUser.getPassword())).thenReturn(true);
        when(walletRepository.findByUserId(1L)).thenReturn(Optional.of(
                Wallet.builder().user(activeUser).balance(BigDecimal.valueOf(500000)).build()
        ));
        when(jwtTokenProvider.generateToken(1L, "test@imhere.vn", "ROLE_SHEPHERD")).thenReturn("mocked.jwt.token");

        AuthResponse response = authService.login(loginRequest);

        assertThat(response).isNotNull();
        assertThat(response.getToken()).isEqualTo("mocked.jwt.token");
        assertThat(response.getWalletBalance()).isEqualByComparingTo(BigDecimal.valueOf(500000));
    }

    @Test
    @DisplayName("TDD [Login - Thành công bằng Số điện thoại]: Đăng nhập bằng SĐT hợp lệ")
    void login_WhenValidPhone_ShouldReturnAuthResponse() {
        LoginRequest phoneReq = LoginRequest.builder().email("0987654321").password("Password123").build();
        when(userRepository.findByEmailOrPhone("0987654321")).thenReturn(Optional.of(activeUser));
        when(passwordEncoder.matches("Password123", activeUser.getPassword())).thenReturn(true);
        when(walletRepository.findByUserId(1L)).thenReturn(Optional.of(
                Wallet.builder().user(activeUser).balance(BigDecimal.valueOf(500000)).build()
        ));
        when(jwtTokenProvider.generateToken(1L, "test@imhere.vn", "ROLE_SHEPHERD")).thenReturn("mocked.jwt.token");

        AuthResponse response = authService.login(phoneReq);

        assertThat(response).isNotNull();
        assertThat(response.getToken()).isEqualTo("mocked.jwt.token");
    }

    @Test
    @DisplayName("TDD [Login - Thất bại]: Sai mật khẩu phải ném ra CustomException")
    void login_WhenWrongPassword_ShouldThrowCustomException() {
        when(userRepository.findByEmailOrPhone("test@imhere.vn")).thenReturn(Optional.of(activeUser));
        when(passwordEncoder.matches("Password123", activeUser.getPassword())).thenReturn(false);

        assertThatThrownBy(() -> authService.login(loginRequest))
                .isInstanceOf(CustomException.class)
                .hasMessageContaining("chính xác");
    }

    @Test
    @DisplayName("TDD [Login - Thất bại]: Tài khoản bị khóa (BLOCKED) phải ném ra CustomException")
    void login_WhenAccountBlocked_ShouldThrowCustomException() {
        User blockedUser = User.builder()
                .id(2L)
                .email("blocked@imhere.vn")
                .password("$2a$10$encoded")
                .status(UserStatus.BLOCKED)
                .build();
        when(userRepository.findByEmailOrPhone("blocked@imhere.vn")).thenReturn(Optional.of(blockedUser));
        when(passwordEncoder.matches("pwd", "$2a$10$encoded")).thenReturn(true);

        LoginRequest req = LoginRequest.builder().email("blocked@imhere.vn").password("pwd").build();

        assertThatThrownBy(() -> authService.login(req))
                .isInstanceOf(CustomException.class)
                .hasMessageContaining("Tài khoản đã bị tạm khóa");
    }
}
