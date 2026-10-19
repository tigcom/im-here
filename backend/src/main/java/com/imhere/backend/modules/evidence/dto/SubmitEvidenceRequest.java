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
public class SubmitEvidenceRequest {
    @NotNull(message = "Vĩ độ thực tế (actualLatitude) là bắt buộc")
    private Double actualLatitude;

    @NotNull(message = "Kinh độ thực tế (actualLongitude) là bắt buộc")
    private Double actualLongitude;

    private String note;
    private String photosJson;
    private String checklistResponsesJson;
}
