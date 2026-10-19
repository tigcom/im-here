package com.imhere.backend.modules.evidence;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.imhere.backend.modules.task.Task;
import com.imhere.backend.modules.user.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

@Entity
@Table(name = "evidences", indexes = {
    @Index(name = "idx_evidence_task", columnList = "task_id"),
    @Index(name = "idx_evidence_shepherd", columnList = "shepherd_id"),
    @Index(name = "idx_evidence_status", columnList = "status"),
    @Index(name = "idx_evidence_submitted", columnList = "submittedAt")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Evidence {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Task task;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shepherd_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "password"})
    private User shepherd;

    @Column(columnDefinition = "TEXT")
    private String note;

    @Column(nullable = false)
    private Double actualLatitude;

    @Column(nullable = false)
    private Double actualLongitude;

    @Column
    private Double distanceFromTaskMeters; // Sai số khoảng cách thực tế (mét)

    @Column(nullable = false)
    @Builder.Default
    private Boolean isGpsVerified = true;

    @Column(columnDefinition = "TEXT")
    private String photosJson; // Danh sách link ảnh có watermark toạ độ + giờ

    @Column(columnDefinition = "TEXT")
    private String checklistResponsesJson;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private EvidenceStatus status = EvidenceStatus.PENDING;

    @Column(columnDefinition = "TEXT")
    private String reviewNotes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "password"})
    private User reviewedBy;

    @CreationTimestamp
    @Column(updatable = false)
    private Instant submittedAt;

    private Instant reviewedAt;
}
