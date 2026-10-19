package com.imhere.backend.modules.task;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.imhere.backend.modules.user.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "tasks", indexes = {
    @Index(name = "idx_task_status", columnList = "status"),
    @Index(name = "idx_task_client", columnList = "client_id"),
    @Index(name = "idx_task_shepherd", columnList = "assigned_shepherd_id"),
    @Index(name = "idx_task_geo", columnList = "latitude, longitude"),
    @Index(name = "idx_task_status_geo", columnList = "status, latitude, longitude")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "password"})
    private User client;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_shepherd_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "password"})
    private User assignedShepherd;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TaskCategory category;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private TaskStatus status = TaskStatus.CREATED;

    @Column(nullable = false)
    private String address;

    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal rewardAmount;

    @Column(columnDefinition = "TEXT")
    private String instructions;

    @Column(columnDefinition = "TEXT")
    private String checklistRequirementsJson; // JSON schema checklist

    @Column(columnDefinition = "TEXT")
    private String questionsJson; // JSON schema bộ câu hỏi khảo sát (option không bắt buộc)

    private Instant deadline;

    @Builder.Default
    @Column(nullable = false)
    private Boolean isCheckedIn = false;

    private Instant checkedInAt;

    private Double checkInLatitude;

    private Double checkInLongitude;

    @Column(columnDefinition = "TEXT")
    private String rejectionReason;

    @CreationTimestamp
    @Column(updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    private Instant updatedAt;
}
