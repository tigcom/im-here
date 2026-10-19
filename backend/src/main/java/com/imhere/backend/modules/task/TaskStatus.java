package com.imhere.backend.modules.task;

public enum TaskStatus {
    CREATED,      // Đang mở chờ CTV nhận việc
    ASSIGNED,     // CTV đã nhận việc đang tiến hành
    SUBMITTED,    // CTV đã nộp báo cáo thực địa (ảnh/checklist)
    APPROVED,     // Client hoặc Admin đã nghiệm thu thành công
    REJECTED,     // Bị từ chối chất lượng, yêu cầu làm lại
    CANCELLED     // Bị hủy
}
