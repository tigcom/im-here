package com.imhere.backend.modules.user;

public enum KycStatus {
    CHUA_NOP,       // Chưa nộp hồ sơ CCCD
    CHO_DUYET,      // Đã nộp, đang chờ Admin duyệt
    DA_DUYET,       // Đã duyệt, đủ điều kiện nhận việc
    TU_CHOI         // Bị từ chối (có lý do)
}
