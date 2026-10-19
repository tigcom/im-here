package com.imhere.backend.modules.notification;

import com.imhere.backend.modules.notification.dto.NotificationResponse;
import com.imhere.backend.modules.user.User;

import java.util.List;

public interface NotificationService {
    NotificationResponse sendNotification(User targetUser, String title, String content, NotificationType type, String linkUrl);
    List<NotificationResponse> getMyNotifications(Long userId);
    void markAsRead(Long notificationId, Long userId);
    void markAllAsRead(Long userId);
}
