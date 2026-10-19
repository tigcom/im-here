package com.imhere.backend.modules.wallet;

import com.imhere.backend.common.CustomException;
import com.imhere.backend.modules.user.Role;
import com.imhere.backend.modules.user.User;
import com.imhere.backend.modules.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WalletServiceTest {

    @Mock
    private WalletRepository walletRepository;

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private WalletServiceImpl walletService;

    private User clientUser;
    private User shepherdUser;
    private Wallet clientWallet;
    private Wallet shepherdWallet;

    @BeforeEach
    void setUp() {
        clientUser = User.builder().id(1L).email("client@vinmart.vn").role(Role.ROLE_CLIENT).build();
        shepherdUser = User.builder()
                .id(2L)
                .email("shepherd@imhere.vn")
                .role(Role.ROLE_SHEPHERD)
                .kycStatus(com.imhere.backend.modules.user.KycStatus.DA_DUYET)
                .completedTasksCount(5)
                .build();

        clientWallet = Wallet.builder()
                .id(10L)
                .user(clientUser)
                .balance(BigDecimal.valueOf(1000000))
                .escrowBalance(BigDecimal.ZERO)
                .build();

        shepherdWallet = Wallet.builder()
                .id(20L)
                .user(shepherdUser)
                .balance(BigDecimal.valueOf(200000))
                .escrowBalance(BigDecimal.ZERO)
                .build();
    }

    @Test
    @DisplayName("TDD [Deposit]: Nạp tiền tăng số dư khả dụng và ghi log giao dịch")
    void deposit_WhenValidAmount_ShouldIncreaseBalanceAndSaveTransaction() {
        when(walletRepository.findByUserIdForUpdate(1L)).thenReturn(Optional.of(clientWallet));
        when(walletRepository.save(any(Wallet.class))).thenAnswer(i -> i.getArgument(0));

        Wallet result = walletService.deposit(1L, BigDecimal.valueOf(500000), "Nạp tiền qua VietQR");

        assertThat(result.getBalance()).isEqualByComparingTo(BigDecimal.valueOf(1500000));
        verify(transactionRepository).save(argThat(tx ->
                tx.getAmount().compareTo(BigDecimal.valueOf(500000)) == 0 &&
                tx.getType() == TransactionType.DEPOSIT
        ));
    }

    @Test
    @DisplayName("TDD [Hold Escrow]: Ký quỹ khi Client tạo Task -> chuyển tiền từ balance sang escrowBalance")
    void holdEscrow_WhenSufficientBalance_ShouldMoveBalanceToEscrow() {
        when(walletRepository.findByUserIdForUpdate(1L)).thenReturn(Optional.of(clientWallet));

        walletService.holdEscrow(1L, BigDecimal.valueOf(300000), 101L);

        assertThat(clientWallet.getBalance()).isEqualByComparingTo(BigDecimal.valueOf(700000));
        assertThat(clientWallet.getEscrowBalance()).isEqualByComparingTo(BigDecimal.valueOf(300000));
        verify(walletRepository).save(clientWallet);
        verify(transactionRepository).save(argThat(tx ->
                tx.getType() == TransactionType.ESCROW_HOLD &&
                tx.getAmount().compareTo(BigDecimal.valueOf(300000)) == 0
        ));
    }

    @Test
    @DisplayName("TDD [Hold Escrow - Lỗi]: Số dư khả dụng không đủ phải ném CustomException")
    void holdEscrow_WhenInsufficientBalance_ShouldThrowCustomException() {
        when(walletRepository.findByUserIdForUpdate(1L)).thenReturn(Optional.of(clientWallet));

        assertThatThrownBy(() -> walletService.holdEscrow(1L, BigDecimal.valueOf(2000000), 101L))
                .isInstanceOf(CustomException.class)
                .hasMessageContaining("Số dư không đủ");
    }

    @Test
    @DisplayName("TDD [Release Escrow]: Nghiệm thu task -> trừ escrow Client, cộng balance Shepherd, tăng hoàn thành")
    void releaseEscrow_ShouldDeductEscrowFromClientAndAddRewardToShepherd() {
        clientWallet.setBalance(BigDecimal.valueOf(700000));
        clientWallet.setEscrowBalance(BigDecimal.valueOf(300000));

        when(walletRepository.findByUserIdForUpdate(1L)).thenReturn(Optional.of(clientWallet));
        when(walletRepository.findByUserIdForUpdate(2L)).thenReturn(Optional.of(shepherdWallet));

        walletService.releaseEscrow(1L, 2L, BigDecimal.valueOf(300000), 101L);

        // Client escrow bị trừ
        assertThat(clientWallet.getEscrowBalance()).isEqualByComparingTo(BigDecimal.ZERO);
        // Shepherd được cộng tiền
        assertThat(shepherdWallet.getBalance()).isEqualByComparingTo(BigDecimal.valueOf(500000));
        // Shepherd tăng số lượng hoàn thành
        assertThat(shepherdUser.getCompletedTasksCount()).isEqualTo(6);

        verify(walletRepository).save(clientWallet);
        verify(walletRepository).save(shepherdWallet);
        verify(userRepository).save(shepherdUser);
        verify(transactionRepository, times(2)).save(any(Transaction.class));
    }

    @Test
    @DisplayName("TDD [Refund Escrow]: Hủy task -> hoàn tiền từ escrowBalance về balance của Client")
    void refundEscrow_ShouldMoveEscrowBackToBalance() {
        clientWallet.setBalance(BigDecimal.valueOf(700000));
        clientWallet.setEscrowBalance(BigDecimal.valueOf(300000));
        when(walletRepository.findByUserIdForUpdate(1L)).thenReturn(Optional.of(clientWallet));

        walletService.refundEscrow(1L, BigDecimal.valueOf(300000), 101L);

        assertThat(clientWallet.getEscrowBalance()).isEqualByComparingTo(BigDecimal.ZERO);
        assertThat(clientWallet.getBalance()).isEqualByComparingTo(BigDecimal.valueOf(1000000));
        verify(transactionRepository).save(argThat(tx -> tx.getType() == TransactionType.REFUND));
    }

    @Test
    @DisplayName("TDD [Withdrawal]: Rút tiền thành công trừ balance và ghi nhận giao dịch")
    void withdraw_WhenValid_ShouldDeductBalanceAndCreateWithdrawalTransaction() {
        when(userRepository.findById(2L)).thenReturn(Optional.of(shepherdUser));
        when(walletRepository.findByUserIdForUpdate(2L)).thenReturn(Optional.of(shepherdWallet));

        Transaction tx = walletService.withdraw(2L, BigDecimal.valueOf(100000), "Rút về Techcombank 1903...");

        assertThat(shepherdWallet.getBalance()).isEqualByComparingTo(BigDecimal.valueOf(100000));
        verify(transactionRepository).save(any(Transaction.class));
    }

    @Test
    @DisplayName("TDD [Withdrawal - Lỗi]: Rút vượt quá số dư bị từ chối")
    void withdraw_WhenInsufficientBalance_ShouldThrowCustomException() {
        when(userRepository.findById(2L)).thenReturn(Optional.of(shepherdUser));
        when(walletRepository.findByUserIdForUpdate(2L)).thenReturn(Optional.of(shepherdWallet));

        assertThatThrownBy(() -> walletService.withdraw(2L, BigDecimal.valueOf(500000), "Rút về Vietcombank"))
                .isInstanceOf(CustomException.class)
                .hasMessageContaining("Số dư khả dụng không đủ");
    }
}
