package com.imhere.backend.modules.wallet;

import java.math.BigDecimal;
import java.util.List;

public interface WalletService {
    Wallet getWalletByUserId(Long userId);
    List<Transaction> getTransactionsByUserId(Long userId);
    Wallet deposit(Long userId, BigDecimal amount, String description);
    void holdEscrow(Long clientId, BigDecimal amount, Long taskId);
    void releaseEscrow(Long clientId, Long shepherdId, BigDecimal amount, Long taskId);
    void refundEscrow(Long clientId, BigDecimal amount, Long taskId);
    Transaction withdraw(Long userId, BigDecimal amount, String bankInfo);
    Transaction reviewWithdrawal(Long transactionId, boolean approved, String reviewNote);
}
