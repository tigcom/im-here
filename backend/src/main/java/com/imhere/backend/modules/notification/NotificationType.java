package com.imhere.backend.modules.notification;

public enum NotificationType {
    TASK_NEW_NEARBY,       // Có nhiệm vụ mới quanh bạn
    TASK_ASSIGNED,         // Có người nhận nhiệm vụ
    TASK_CHECKED_IN,       // Người nhận đã check-in tại địa điểm
    TASK_SUBMITTED,        // Người nhận đã nộp báo cáo hoàn thành
    TASK_APPROVED,         // Nhiệm vụ đã được duyệt hoàn tất
    WALLET_DEPOSIT,        // Nạp tiền ví thành công
    WALLET_REWARD,         // Nhận thù lao về ví
    NEW_REVIEW,            // Nhận được đánh giá mới
    NEW_MESSAGE            // Có tin nhắn mới
}
