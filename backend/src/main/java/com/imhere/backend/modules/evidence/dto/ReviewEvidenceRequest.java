package com.imhere.backend.modules.evidence.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewEvidenceRequest {
    @NotNull(message = "Kết quả phê duyệt (approved: true/false) là bắt buộc")
    private Boolean approved;

    private String reviewNotes;
}
