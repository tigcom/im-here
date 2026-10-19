package com.imhere.backend.modules.notification;

import com.imhere.backend.common.CustomException;
import com.imhere.backend.modules.notification.dto.NotificationResponse;
import com.imhere.backend.modules.user.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    @Transactional
    public NotificationResponse sendNotification(User targetUser, String title, String content, NotificationType type, String linkUrl) {
        Notification notification = Notification.builder()
                .user(targetUser)
                .title(title)
                .content(content)
                .type(type)
                .linkUrl(linkUrl)
                .isRead(false)
                .build();

        Notification saved = notificationRepository.save(notification);
        NotificationResponse response = NotificationResponse.fromEntity(saved);

        // Bắn Socket Real-time qua kênh cá nhân của user: /topic/notifications/{userId}
        try {
            messagingTemplate.convertAndSend("/topic/notifications/" + targetUser.getId(), response);
        } catch (Exception e) {
            log.warn("Không thể gửi thông báo qua WebSocket tới user #{}: {}", targetUser.getId(), e.getMessage());
        }

        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponse> getMyNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(NotificationResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void markAsRead(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new CustomException("Không tìm thấy thông báo #" + notificationId, HttpStatus.NOT_FOUND));

        if (!notification.getUser().getId().equals(userId)) {
            throw new CustomException("Bạn không có quyền thao tác trên thông báo này", HttpStatus.FORBIDDEN);
        }

        notification.setIsRead(true);
        notificationRepository.save(notification);
    }

    @Override
    @Transactional
    public void markAllAsRead(Long userId) {
        List<Notification> list = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        for (Notification n : list) {
            n.setIsRead(true);
        }
        notificationRepository.saveAll(list);
    }
}
