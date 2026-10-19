package com.imhere.backend.modules.notification.dto;

import com.imhere.backend.modules.notification.Notification;
import com.imhere.backend.modules.notification.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {
    private Long id;
    private String title;
    private String content;
    private NotificationType type;
    private String linkUrl;
    private Boolean isRead;
    private Instant createdAt;

    public static NotificationResponse fromEntity(Notification notif) {
        return NotificationResponse.builder()
                .id(notif.getId())
                .title(notif.getTitle())
                .content(notif.getContent())
                .type(notif.getType())
                .linkUrl(notif.getLinkUrl())
                .isRead(notif.getIsRead())
                .createdAt(notif.getCreatedAt())
                .build();
    }
}
