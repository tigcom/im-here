package com.imhere.backend.modules.wallet;

import com.imhere.backend.common.ApiResponse;
import com.imhere.backend.config.security.CustomUserDetails;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/wallet")
@RequiredArgsConstructor
@Tag(name = "02 — Wallet & Payment", description = "Quản lý ví điện tử, nạp rút tiền, lịch sử giao dịch (9Pay style)")
public class WalletController {

    private final WalletService walletService;

    @GetMapping("/my-wallet")
    @Operation(summary = "Xem số dư khả dụng và số dư ký quỹ")
    public ResponseEntity<ApiResponse<Wallet>> getMyWallet(@AuthenticationPrincipal CustomUserDetails userDetails) {
        Wallet wallet = walletService.getWalletByUserId(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success(wallet));
    }

    @GetMapping("/transactions")
    @Operation(summary = "Xem lịch sử giao dịch dòng tiền")
    public ResponseEntity<ApiResponse<List<Transaction>>> getTransactions(@AuthenticationPrincipal CustomUserDetails userDetails) {
        List<Transaction> transactions = walletService.getTransactionsByUserId(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success(transactions));
    }

    @PostMapping("/deposit")
    @Operation(summary = "Nạp tiền vào ví (Client nạp ngân sách chạy chiến dịch)")
    public ResponseEntity<ApiResponse<Wallet>> deposit(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody DepositRequest request
    ) {
        Wallet wallet = walletService.deposit(userDetails.getId(), request.getAmount(), request.getDescription());
        return ResponseEntity.ok(ApiResponse.success("Nạp tiền thành công", wallet));
    }

    @PostMapping("/withdraw")
    @Operation(summary = "Rút tiền về tài khoản ngân hàng (CTV Shepherd rút thu nhập)")
    public ResponseEntity<ApiResponse<Transaction>> withdraw(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody WithdrawRequest request
    ) {
        String bankInfo = request.getBankInfo();
        if (bankInfo == null || bankInfo.isBlank()) {
            if (request.getBankName() == null || request.getBankName().isBlank()
                    || request.getAccountNumber() == null || request.getAccountNumber().isBlank()
                    || request.getAccountHolder() == null || request.getAccountHolder().isBlank()) {
                throw new com.imhere.backend.common.CustomException("Bắt buộc cung cấp đầy đủ thông tin tài khoản nhận tiền");
            }
            bankInfo = request.getBankName().trim() + " | " + request.getAccountNumber().trim() + " | " + request.getAccountHolder().trim();
        }
        Transaction tx = walletService.withdraw(userDetails.getId(), request.getAmount(), bankInfo);
        return ResponseEntity.ok(ApiResponse.success("Yêu cầu rút tiền thành công", tx));
    }

    @Data
    public static class DepositRequest {
        private BigDecimal amount;
        private String description;
    }

    @Data
    public static class WithdrawRequest {
        private BigDecimal amount;
        private String bankInfo;
        private String bankName;
        private String accountNumber;
        private String accountHolder;
    }
}
