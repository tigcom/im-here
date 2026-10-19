package com.imhere.backend.modules.chat;

import com.imhere.backend.common.ApiResponse;
import com.imhere.backend.config.security.CustomUserDetails;
import com.imhere.backend.modules.chat.dto.MessageResponse;
import com.imhere.backend.modules.chat.dto.SendMessageRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tasks/{taskId}/messages")
@RequiredArgsConstructor
@Tag(name = "06 — Task Real-time Chat", description = "Nhắn tin trao đổi trực tiếp trong phạm vi nhiệm vụ")
public class ChatController {

    private final ChatService chatService;

    @GetMapping
    @Operation(summary = "Lấy toàn bộ tin nhắn trong nhiệm vụ")
    public ResponseEntity<ApiResponse<List<MessageResponse>>> getMessages(
            @PathVariable Long taskId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        List<MessageResponse> messages = chatService.getMessagesByTaskId(taskId, userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success(messages));
    }

    @PostMapping
    @Operation(summary = "Gửi tin nhắn trong nhiệm vụ")
    public ResponseEntity<ApiResponse<MessageResponse>> sendMessage(
            @PathVariable Long taskId,
            @Valid @RequestBody SendMessageRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        MessageResponse response = chatService.sendMessage(taskId, userDetails.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Gửi tin nhắn thành công", response));
    }
}
