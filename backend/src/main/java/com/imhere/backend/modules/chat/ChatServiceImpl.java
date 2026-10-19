package com.imhere.backend.modules.chat;

import com.imhere.backend.common.CustomException;
import com.imhere.backend.modules.chat.dto.MessageResponse;
import com.imhere.backend.modules.chat.dto.SendMessageRequest;
import com.imhere.backend.modules.task.Task;
import com.imhere.backend.modules.task.TaskRepository;
import com.imhere.backend.modules.user.Role;
import com.imhere.backend.modules.user.User;
import com.imhere.backend.modules.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import com.imhere.backend.modules.notification.NotificationService;
import com.imhere.backend.modules.notification.NotificationType;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatServiceImpl implements ChatService {

    private final MessageRepository messageRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final NotificationService notificationService;

    @Override
    @Transactional
    public MessageResponse sendMessage(Long taskId, Long senderId, SendMessageRequest request) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new CustomException("Không tìm thấy nhiệm vụ #" + taskId, HttpStatus.NOT_FOUND));

        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new CustomException("Không tìm thấy người dùng", HttpStatus.NOT_FOUND));

        if (task.getStatus() == com.imhere.backend.modules.task.TaskStatus.CANCELLED) {
            throw new CustomException("Nhiệm vụ đã bị hủy, không thể tiếp tục gửi tin nhắn", HttpStatus.BAD_REQUEST);
        }
        if (task.getStatus() == com.imhere.backend.modules.task.TaskStatus.APPROVED) {
            throw new CustomException("Nhiệm vụ đã hoàn thành và nghiệm thu xong, cuộc trò chuyện đã đóng", HttpStatus.BAD_REQUEST);
        }

        // Kiểm tra quyền: Chỉ Client của task, Shepherd được giao việc, hoặc Admin mới có quyền chat
        boolean isClient = task.getClient() != null && task.getClient().getId().equals(senderId);
        boolean isShepherd = task.getAssignedShepherd() != null && task.getAssignedShepherd().getId().equals(senderId);
        boolean isAdmin = sender.getRole() == Role.ROLE_ADMIN;

        if (!isClient && !isShepherd && !isAdmin) {
            throw new CustomException("Bạn không có quyền tham gia phòng chat của nhiệm vụ này", HttpStatus.FORBIDDEN);
        }

        Message message = Message.builder()
                .task(task)
                .sender(sender)
                .content(request.getContent())
                .mediaUrl(request.getMediaUrl())
                .build();

        Message saved = messageRepository.save(message);
        MessageResponse response = MessageResponse.fromEntity(saved);
        messagingTemplate.convertAndSend("/topic/tasks/" + taskId, response);

        User recipient = null;
        if (isClient) recipient = task.getAssignedShepherd();
        else if (isShepherd) recipient = task.getClient();
        else {
            if (task.getClient() != null) notifyMessageRecipient(task.getClient(), sender, task);
            if (task.getAssignedShepherd() != null) notifyMessageRecipient(task.getAssignedShepherd(), sender, task);
        }
        if (recipient != null) notifyMessageRecipient(recipient, sender, task);
        return response;
    }

    private void notifyMessageRecipient(User recipient, User sender, Task task) {
        if (recipient.getId().equals(sender.getId())) return;
        String route = recipient.getRole() == Role.ROLE_SHEPHERD
                ? "/looker/listing/" + task.getId() + "/execute"
                : recipient.getRole() == Role.ROLE_ADMIN ? "/admin/qa" : "/client/campaigns/" + task.getId() + "/review";
        notificationService.sendNotification(recipient, "Tin nhắn mới", sender.getFullName()
                + " vừa gửi tin nhắn trong nhiệm vụ #" + task.getId() + " “" + task.getTitle() + "”.",
                NotificationType.NEW_MESSAGE, route);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MessageResponse> getMessagesByTaskId(Long taskId, Long currentUserId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new CustomException("Không tìm thấy nhiệm vụ #" + taskId, HttpStatus.NOT_FOUND));

        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new CustomException("Không tìm thấy người dùng", HttpStatus.NOT_FOUND));

        boolean isClient = task.getClient() != null && task.getClient().getId().equals(currentUserId);
        boolean isShepherd = task.getAssignedShepherd() != null && task.getAssignedShepherd().getId().equals(currentUserId);
        boolean isAdmin = currentUser.getRole() == Role.ROLE_ADMIN;

        if (!isClient && !isShepherd && !isAdmin) {
            throw new CustomException("Bạn không có quyền xem tin nhắn của nhiệm vụ này", HttpStatus.FORBIDDEN);
        }

        return messageRepository.findByTaskIdOrderByCreatedAtAsc(taskId).stream()
                .map(MessageResponse::fromEntity)
                .collect(Collectors.toList());
    }
}
