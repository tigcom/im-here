package com.imhere.backend.modules.auth.dto;

import com.imhere.backend.modules.user.KycStatus;
import com.imhere.backend.modules.user.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private Long id;
    private String email;
    private String fullName;
    private Role role;
    private KycStatus kycStatus;
    private BigDecimal walletBalance;
    private String idCardFrontUrl;
    private String idCardBackUrl;
    private String rejectionReason;
    private String bankName;
    private String bankAccountNumber;
    private String bankAccountHolder;
}
