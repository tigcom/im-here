package com.imhere.backend.modules.chat.dto;

import com.imhere.backend.modules.chat.Message;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessageResponse {
    private Long id;
    private Long taskId;
    private Long senderId;
    private String senderName;
    private String senderAvatar;
    private String content;
    private String mediaUrl;
    private Instant createdAt;

    public static MessageResponse fromEntity(Message msg) {
        return MessageResponse.builder()
                .id(msg.getId())
                .taskId(msg.getTask() != null ? msg.getTask().getId() : null)
                .senderId(msg.getSender() != null ? msg.getSender().getId() : null)
                .senderName(msg.getSender() != null ? msg.getSender().getFullName() : null)
                .senderAvatar(msg.getSender() != null ? msg.getSender().getAvatarUrl() : null)
                .content(msg.getContent())
                .mediaUrl(msg.getMediaUrl())
                .createdAt(msg.getCreatedAt())
                .build();
    }
}
