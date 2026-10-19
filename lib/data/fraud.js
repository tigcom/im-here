/**
 * CẢNH BÁO GIAN LẬN
 *
 * Sửa hai lỗi của phiên bản trước:
 *   1. `admin/fraud/page.jsx` render `item.actionTaken` nhưng field không tồn tại
 *      → nay `actionTaken` có trong schema (mặc định `null`).
 *   2. `lookerName`/`lookerId` bị trùng lặp và có cả đối tượng không tồn tại.
 *      → nay chỉ giữ `subjectType` + `subjectId`, tên suy ra qua selector.
 */

import { FRAUD_TYPE, FRAUD_STATUS } from '../constants';

export const FRAUD_ALERTS = [
  {
    id: 'FRD-801',
    subjectType: 'USER',
    subjectId: 'USR-LK-9924',
    type: FRAUD_TYPE.MOCK_GPS,
    title: 'Phát hiện ứng dụng giả lập vị trí',
    details:
      'Thiết bị gửi toạ độ cố định liên tục trong 15 phút với sai số 0.0m — không có độ trôi cảm biến tự nhiên như GPS thật.',
    location: 'Quận Cầu Giấy, Hà Nội',
    detectedAt: '2026-10-12T09:12:00+07:00',
    confidence: 99.4,
    status: FRAUD_STATUS.LOCKED,
    actionTaken: 'Đã khoá tài khoản & tạm giữ thù lao',
    reviewedBy: 'USR-AD-001',
    reviewedAt: '2026-10-12T09:20:00+07:00',
  },
  {
    id: 'FRD-802',
    subjectType: 'SUBMISSION',
    subjectId: 'SUB-8802',
    type: FRAUD_TYPE.RE_SHOT_SCREEN,
    title: 'Nghi vấn chụp lại ảnh từ màn hình khác',
    details:
      'Phát hiện gợn sóng moiré và viền phản xạ ánh sáng của màn hình LCD trong ảnh chụp kệ hàng.',
    location: 'Quận 1, TP. Hồ Chí Minh',
    detectedAt: '2026-10-12T10:45:20+07:00',
    confidence: 87.2,
    status: FRAUD_STATUS.ACTIVE,
    actionTaken: null,
    reviewedBy: null,
    reviewedAt: null,
  },
  {
    id: 'FRD-803',
    subjectType: 'USER',
    subjectId: 'USR-LK-9923',
    type: FRAUD_TYPE.DEVICE_TAMPER,
    title: 'Can thiệp thời gian hệ thống thiết bị',
    details:
      'Dấu thời gian trong ảnh chụp sớm hơn 40 phút so với thời điểm máy chủ nhận dữ liệu.',
    location: 'Bình Thạnh, TP. Hồ Chí Minh',
    detectedAt: '2026-10-11T16:22:00+07:00',
    confidence: 72.5,
    status: FRAUD_STATUS.DISMISSED,
    actionTaken: 'Đã bỏ qua — sai lệch do múi giờ thiết bị',
    reviewedBy: 'USR-AD-001',
    reviewedAt: '2026-10-11T17:00:00+07:00',
  },
];

export function getFraudAlertById(id) {
  return FRAUD_ALERTS.find((f) => f.id === id) || null;
}

export function getActiveFraudAlerts() {
  return FRAUD_ALERTS.filter((f) => f.status === FRAUD_STATUS.ACTIVE);
}
