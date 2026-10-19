package com.imhere.backend.modules.media;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.imhere.backend.modules.user.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

@Entity
@Table(name = "media_files", indexes = {
    @Index(name = "idx_media_owner", columnList = "owner_id"),
    @Index(name = "idx_media_purpose", columnList = "purpose"),
    @Index(name = "idx_media_linked", columnList = "linkedEntityId"),
    @Index(name = "idx_media_created", columnList = "createdAt")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MediaFile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "password"})
    private User owner;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private MediaPurpose purpose;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private MediaStorageType storageType;

    @Column(nullable = false)
    private String bucketName;

    @Column(nullable = false, length = 512)
    private String objectKey;

    @Column(nullable = false)
    private String originalFileName;

    @Column(nullable = false, length = 128)
    private String contentType;

    @Column(nullable = false)
    private Long byteSize;

    @Column(length = 64)
    private String linkedEntityType; // "USER_KYC", "TASK_EVIDENCE", "TASK"

    private Long linkedEntityId; // ID của User hoặc Evidence hoặc Task

    @CreationTimestamp
    @Column(updatable = false)
    private Instant createdAt;
}
