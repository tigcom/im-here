package com.imhere.backend.modules.task.dto;

import com.imhere.backend.modules.task.Task;
import com.imhere.backend.modules.task.TaskCategory;
import com.imhere.backend.modules.task.TaskStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskResponse {
    private Long id;
    private String title;
    private String description;
    private TaskCategory category;
    private TaskStatus status;
    private String address;
    private Double latitude;
    private Double longitude;
    private BigDecimal rewardAmount;
    private String instructions;
    private String checklistRequirementsJson;
    private String questionsJson;
    private Instant deadline;
    private Long clientId;
    private String clientName;
    private Long assignedShepherdId;
    private String assignedShepherdName;
    private Double distanceKm; // Khoảng cách từ vị trí người xem (nếu có)
    private Boolean isCheckedIn;
    private Instant checkedInAt;
    private String rejectionReason;
    private Instant createdAt;

    public static TaskResponse fromEntity(Task task, Double distanceKm) {
        return TaskResponse.builder()
                .id(task.getId())
                .title(task.getTitle())
                .description(task.getDescription())
                .category(task.getCategory())
                .status(task.getStatus())
                .address(task.getAddress())
                .latitude(task.getLatitude())
                .longitude(task.getLongitude())
                .rewardAmount(task.getRewardAmount())
                .instructions(task.getInstructions())
                .checklistRequirementsJson(task.getChecklistRequirementsJson())
                .questionsJson(task.getQuestionsJson())
                .deadline(task.getDeadline())
                .clientId(task.getClient() != null ? task.getClient().getId() : null)
                .clientName(task.getClient() != null ? task.getClient().getFullName() : null)
                .assignedShepherdId(task.getAssignedShepherd() != null ? task.getAssignedShepherd().getId() : null)
                .assignedShepherdName(task.getAssignedShepherd() != null ? task.getAssignedShepherd().getFullName() : null)
                .distanceKm(distanceKm != null ? Math.round(distanceKm * 100.0) / 100.0 : null)
                .isCheckedIn(task.getIsCheckedIn())
                .checkedInAt(task.getCheckedInAt())
                .rejectionReason(task.getRejectionReason())
                .createdAt(task.getCreatedAt())
                .build();
    }

    public static TaskResponse fromEntity(Task task) {
        return fromEntity(task, null);
    }
}
