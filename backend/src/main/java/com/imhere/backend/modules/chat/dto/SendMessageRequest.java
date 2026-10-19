package com.imhere.backend.modules.chat.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SendMessageRequest {
    @NotBlank(message = "Nội dung tin nhắn không được để trống")
    private String content;

    private String mediaUrl;
}
