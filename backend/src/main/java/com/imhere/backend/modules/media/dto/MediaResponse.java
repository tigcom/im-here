package com.imhere.backend.modules.media.dto;

import com.imhere.backend.modules.media.MediaFile;
import com.imhere.backend.modules.media.MediaPurpose;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MediaResponse {
    private Long id;
    private Long ownerId;
    private MediaPurpose purpose;
    private String originalFileName;
    private String contentType;
    private Long byteSize;
    private String accessUrl; // Signed URL ngắn hạn hoặc API proxy link
    private Instant createdAt;

    public static MediaResponse fromEntity(MediaFile media, String accessUrl) {
        return MediaResponse.builder()
                .id(media.getId())
                .ownerId(media.getOwner() != null ? media.getOwner().getId() : null)
                .purpose(media.getPurpose())
                .originalFileName(media.getOriginalFileName())
                .contentType(media.getContentType())
                .byteSize(media.getByteSize())
                .accessUrl(accessUrl)
                .createdAt(media.getCreatedAt())
                .build();
    }
}
