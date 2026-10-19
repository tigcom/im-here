package com.imhere.backend.modules.wallet;

import com.imhere.backend.common.CustomException;
import com.imhere.backend.modules.user.User;
import com.imhere.backend.modules.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class WalletServiceImpl implements WalletService {

    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public Wallet getWalletByUserId(Long userId) {
        return walletRepository.findByUserId(userId)
                .orElseThrow(() -> new CustomException("Không tìm thấy ví của người dùng", HttpStatus.NOT_FOUND));
    }

    private Wallet getWalletByUserIdForUpdate(Long userId) {
        return walletRepository.findByUserIdForUpdate(userId)
                .orElseThrow(() -> new CustomException("Không tìm thấy ví của người dùng", HttpStatus.NOT_FOUND));
    }

    @Override
    @Transactional(readOnly = true)
    public List<Transaction> getTransactionsByUserId(Long userId) {
        Wallet wallet = getWalletByUserId(userId);
        return transactionRepository.findByWalletIdOrderByCreatedAtDesc(wallet.getId());
    }

    @Override
    @Transactional
    public Wallet deposit(Long userId, BigDecimal amount, String description) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new CustomException("Số tiền nạp phải lớn hơn 0");
        }
        if (amount.compareTo(new BigDecimal("50000000")) > 0) {
            throw new CustomException("Hạn mức nạp thử nghiệm tối đa là 50,000,000 VNĐ / lần", HttpStatus.BAD_REQUEST);
        }
        Wallet wallet = getWalletByUserIdForUpdate(userId);
        wallet.setBalance(wallet.getBalance().add(amount));
        Wallet savedWallet = walletRepository.save(wallet);

        Transaction transaction = Transaction.builder()
                .wallet(savedWallet)
                .amount(amount)
                .type(TransactionType.DEPOSIT)
                .status(TransactionStatus.SUCCESS)
                .description(description != null ? description : "Nạp tiền vào ví (Sandbox)")
                .build();
        transactionRepository.save(transaction);

        return savedWallet;
    }

    @Override
    @Transactional
    public void holdEscrow(Long clientId, BigDecimal amount, Long taskId) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new CustomException("Số tiền ký quỹ phải lớn hơn 0");
        }
        Wallet wallet = getWalletByUserIdForUpdate(clientId);
        String referenceId = "TASK-" + taskId;
        if (transactionRepository.existsByWalletIdAndTypeAndReferenceId(wallet.getId(), TransactionType.ESCROW_HOLD, referenceId)) {
            throw new CustomException("Nhiệm vụ này đã được ký quỹ", HttpStatus.CONFLICT);
        }
        if (wallet.getBalance().compareTo(amount) < 0) {
            throw new CustomException("Số dư không đủ để ký quỹ thực hiện nhiệm vụ", HttpStatus.BAD_REQUEST);
        }

        wallet.setBalance(wallet.getBalance().subtract(amount));
        wallet.setEscrowBalance(wallet.getEscrowBalance().add(amount));
        walletRepository.save(wallet);

        Transaction transaction = Transaction.builder()
                .wallet(wallet)
                .amount(amount)
                .type(TransactionType.ESCROW_HOLD)
                .status(TransactionStatus.SUCCESS)
                .referenceId(referenceId)
                .description("Ký quỹ nhiệm vụ #" + taskId)
                .build();
        transactionRepository.save(transaction);
    }

    @Override
    @Transactional
    public void releaseEscrow(Long clientId, Long shepherdId, BigDecimal amount, Long taskId) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new CustomException("Số tiền giải phóng ký quỹ không hợp lệ");
        }
        Wallet first = getWalletByUserIdForUpdate(Math.min(clientId, shepherdId));
        Wallet second = getWalletByUserIdForUpdate(Math.max(clientId, shepherdId));
        Wallet clientWallet = clientId.equals(first.getUser().getId()) ? first : second;
        Wallet shepherdWallet = shepherdId.equals(first.getUser().getId()) ? first : second;
        String referenceId = "TASK-" + taskId;
        if (transactionRepository.existsByWalletIdAndTypeAndReferenceId(clientWallet.getId(), TransactionType.ESCROW_RELEASE, referenceId)) {
            throw new CustomException("Khoản ký quỹ của nhiệm vụ này đã được giải phóng", HttpStatus.CONFLICT);
        }
        if (clientWallet.getEscrowBalance().compareTo(amount) < 0) {
            throw new CustomException("Số dư ký quỹ không đủ để thanh toán nhiệm vụ", HttpStatus.CONFLICT);
        }

        // Khấu trừ escrow từ Client
        clientWallet.setEscrowBalance(clientWallet.getEscrowBalance().subtract(amount));
        walletRepository.save(clientWallet);

        // Cộng balance cho Shepherd
        shepherdWallet.setBalance(shepherdWallet.getBalance().add(amount));
        walletRepository.save(shepherdWallet);

        // Tăng completedTasksCount cho Shepherd
        User shepherd = shepherdWallet.getUser();
        if (shepherd != null) {
            shepherd.setCompletedTasksCount(
                    (shepherd.getCompletedTasksCount() != null ? shepherd.getCompletedTasksCount() : 0) + 1
            );
            userRepository.save(shepherd);
        }

        // Lưu log giao dịch giải phóng ký quỹ của Client
        Transaction clientTx = Transaction.builder()
                .wallet(clientWallet)
                .amount(amount.negate())
                .type(TransactionType.ESCROW_RELEASE)
                .status(TransactionStatus.SUCCESS)
                .referenceId(referenceId)
                .description("Giải phóng ký quỹ trả thù lao nhiệm vụ #" + taskId)
                .build();
        transactionRepository.save(clientTx);

        // Lưu log nhận thù lao của Shepherd
        Transaction shepherdTx = Transaction.builder()
                .wallet(shepherdWallet)
                .amount(amount)
                .type(TransactionType.REWARD)
                .status(TransactionStatus.SUCCESS)
                .referenceId(referenceId)
                .description("Nhận thù lao hoàn thành nhiệm vụ #" + taskId)
                .build();
        transactionRepository.save(shepherdTx);
    }

    @Override
    @Transactional
    public void refundEscrow(Long clientId, BigDecimal amount, Long taskId) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new CustomException("Số tiền hoàn ký quỹ không hợp lệ");
        }
        Wallet clientWallet = getWalletByUserIdForUpdate(clientId);
        String referenceId = "TASK-" + taskId;
        if (transactionRepository.existsByWalletIdAndTypeAndReferenceId(clientWallet.getId(), TransactionType.REFUND, referenceId)) {
            throw new CustomException("Khoản ký quỹ của nhiệm vụ này đã được hoàn", HttpStatus.CONFLICT);
        }
        if (clientWallet.getEscrowBalance().compareTo(amount) < 0) {
            throw new CustomException("Số dư ký quỹ không đủ để hoàn tiền", HttpStatus.CONFLICT);
        }
        clientWallet.setEscrowBalance(clientWallet.getEscrowBalance().subtract(amount));
        clientWallet.setBalance(clientWallet.getBalance().add(amount));
        walletRepository.save(clientWallet);

        Transaction refundTx = Transaction.builder()
                .wallet(clientWallet)
                .amount(amount)
                .type(TransactionType.REFUND)
                .status(TransactionStatus.SUCCESS)
                .referenceId(referenceId)
                .description("Hoàn tiền ký quỹ do hủy nhiệm vụ #" + taskId)
                .build();
        transactionRepository.save(refundTx);
    }

    @Override
    @Transactional
    public Transaction withdraw(Long userId, BigDecimal amount, String bankInfo) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new CustomException("Số tiền rút phải lớn hơn 0");
        }
        if (amount.compareTo(new BigDecimal("50000")) < 0) {
            throw new CustomException("Số tiền rút tối thiểu là 50,000 VNĐ", HttpStatus.BAD_REQUEST);
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException("Không tìm thấy người dùng", HttpStatus.NOT_FOUND));

        if (user.getStatus() == com.imhere.backend.modules.user.UserStatus.BLOCKED) {
            throw new CustomException("Tài khoản của bạn đã bị khóa, không thể thực hiện giao dịch", HttpStatus.FORBIDDEN);
        }

        if (user.getKycStatus() != com.imhere.backend.modules.user.KycStatus.DA_DUYET) {
            throw new CustomException("Chỉ tài khoản đã được phê duyệt hồ sơ định danh (KYC) mới được thực hiện rút tiền", HttpStatus.FORBIDDEN);
        }

        Wallet wallet = getWalletByUserIdForUpdate(userId);
        if (wallet.getBalance().compareTo(amount) < 0) {
            throw new CustomException("Số dư khả dụng không đủ để thực hiện lệnh rút tiền", HttpStatus.BAD_REQUEST);
        }

        wallet.setBalance(wallet.getBalance().subtract(amount));
        walletRepository.save(wallet);

        Transaction tx = Transaction.builder()
                .wallet(wallet)
                .amount(amount.negate())
                .type(TransactionType.WITHDRAWAL)
                .status(TransactionStatus.PENDING)
                .description("Rút tiền về tài khoản: " + bankInfo)
                .build();
        return transactionRepository.save(tx);
    }

    @Override
    @Transactional
    public Transaction reviewWithdrawal(Long transactionId, boolean approved, String reviewNote) {
        Transaction tx = transactionRepository.findByIdForUpdate(transactionId)
                .orElseThrow(() -> new CustomException("Không tìm thấy yêu cầu rút tiền", HttpStatus.NOT_FOUND));
        if (tx.getType() != TransactionType.WITHDRAWAL || tx.getStatus() != TransactionStatus.PENDING) {
            throw new CustomException("Yêu cầu rút tiền này đã được xử lý hoặc không hợp lệ", HttpStatus.CONFLICT);
        }
        if (approved) {
            tx.setStatus(TransactionStatus.SUCCESS);
            tx.setDescription(tx.getDescription() + (reviewNote == null || reviewNote.isBlank() ? "" : " | Admin: " + reviewNote.trim()));
        } else {
            if (reviewNote == null || reviewNote.isBlank()) {
                throw new CustomException("Bắt buộc nhập lý do từ chối yêu cầu rút tiền", HttpStatus.BAD_REQUEST);
            }
            Wallet wallet = getWalletByUserIdForUpdate(tx.getWallet().getUser().getId());
            wallet.setBalance(wallet.getBalance().add(tx.getAmount().abs()));
            walletRepository.save(wallet);

            tx.setStatus(TransactionStatus.FAILED);
            tx.setDescription(tx.getDescription() + " | Bị từ chối: " + reviewNote.trim());

            // Lưu vết giao dịch hoàn tiền vào sổ cái giao dịch
            Transaction refundTx = Transaction.builder()
                    .wallet(wallet)
                    .amount(tx.getAmount().abs())
                    .type(TransactionType.REFUND)
                    .status(TransactionStatus.SUCCESS)
                    .referenceId("WD-" + tx.getId())
                    .description("Hoàn tiền yêu cầu rút #" + tx.getId() + " bị từ chối: " + reviewNote.trim())
                    .build();
            transactionRepository.save(refundTx);
        }
        return transactionRepository.save(tx);
    }
}
