package com.imhere.backend.modules.evidence.dto;

import com.imhere.backend.modules.evidence.Evidence;
import com.imhere.backend.modules.evidence.EvidenceStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EvidenceResponse {
    private Long id;
    private Long taskId;
    private String taskTitle;
    private Long shepherdId;
    private String shepherdName;
    private Double actualLatitude;
    private Double actualLongitude;
    private Double distanceFromTaskMeters;
    private Boolean isGpsVerified;
    private String note;
    private String photosJson;
    private String checklistResponsesJson;
    private EvidenceStatus status;
    private String reviewNotes;
    private String reviewerName;
    private Instant submittedAt;
    private Instant reviewedAt;

    public static EvidenceResponse fromEntity(Evidence evidence) {
        return EvidenceResponse.builder()
                .id(evidence.getId())
                .taskId(evidence.getTask() != null ? evidence.getTask().getId() : null)
                .taskTitle(evidence.getTask() != null ? evidence.getTask().getTitle() : null)
                .shepherdId(evidence.getShepherd() != null ? evidence.getShepherd().getId() : null)
                .shepherdName(evidence.getShepherd() != null ? evidence.getShepherd().getFullName() : null)
                .actualLatitude(evidence.getActualLatitude())
                .actualLongitude(evidence.getActualLongitude())
                .distanceFromTaskMeters(evidence.getDistanceFromTaskMeters() != null
                        ? Math.round(evidence.getDistanceFromTaskMeters() * 10.0) / 10.0 : null)
                .isGpsVerified(evidence.getIsGpsVerified())
                .note(evidence.getNote())
                .photosJson(evidence.getPhotosJson())
                .checklistResponsesJson(evidence.getChecklistResponsesJson())
                .status(evidence.getStatus())
                .reviewNotes(evidence.getReviewNotes())
                .reviewerName(evidence.getReviewedBy() != null ? evidence.getReviewedBy().getFullName() : null)
                .submittedAt(evidence.getSubmittedAt())
                .reviewedAt(evidence.getReviewedAt())
                .build();
    }
}
