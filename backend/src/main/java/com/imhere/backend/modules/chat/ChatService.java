package com.imhere.backend.modules.chat;

import com.imhere.backend.modules.chat.dto.MessageResponse;
import com.imhere.backend.modules.chat.dto.SendMessageRequest;

import java.util.List;

public interface ChatService {
    MessageResponse sendMessage(Long taskId, Long senderId, SendMessageRequest request);
    List<MessageResponse> getMessagesByTaskId(Long taskId, Long currentUserId);
}
