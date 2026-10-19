/**
 * THÔNG BÁO — một shape duy nhất cho mọi vai trò.
 *
 * Trước đây có hai shape khác nhau (thông báo của người đăng không có `read`,
 * người nhận việc có). Nay hợp nhất.
 */

import { NOTIF_TYPE, ROLE } from '../constants';

export const NOTIFICATIONS = [
  // ── Cho người nhận việc ────────────────────────────────────────────────
  {
    id: 'NOT-1101',
    userId: 'USR-LK-9921',
    role: ROLE.LOOKER,
    type: NOTIF_TYPE.PAYMENT,
    title: 'Tiền thù lao đã vào ví',
    body: '+110.000đ từ việc "Mua đồ ăn sáng ở chợ Bà Chiểu" đã cộng vào ví của bạn.',
    read: false,
    link: '/looker/wallet',
    createdAt: '2026-10-11T11:42:00+07:00',
  },
  {
    id: 'NOT-1102',
    userId: 'USR-LK-9921',
    role: ROLE.LOOKER,
    type: NOTIF_TYPE.LISTING_NEW,
    title: 'Có việc mới gần bạn',
    body: 'Một việc "Đi chợ dùm" cách bạn 0.4 km, thù lao 60.000đ đang chờ nhận.',
    read: false,
    link: '/looker',
    createdAt: '2026-10-12T08:40:00+07:00',
  },
  {
    id: 'NOT-1103',
    userId: 'USR-LK-9921',
    role: ROLE.LOOKER,
    type: NOTIF_TYPE.SUBMISSION_REVIEW,
    title: 'Kết quả đã được xác nhận',
    body: 'Người đăng đã xác nhận kết quả việc "Xác minh nhà phố thế chấp tại Quận 7".',
    read: true,
    link: '/looker/history',
    createdAt: '2026-10-10T16:35:00+07:00',
  },
  {
    id: 'NOT-1104',
    userId: 'USR-LK-9921',
    role: ROLE.LOOKER,
    type: NOTIF_TYPE.KYC,
    title: 'Hồ sơ định danh đã được duyệt',
    body: 'Bạn có thể nhận mọi loại việc trên nền tảng.',
    read: true,
    link: '/looker/profile',
    createdAt: '2026-08-10T09:20:00+07:00',
  },

  // ── Cho người đăng tin ─────────────────────────────────────────────────
  {
    id: 'NOT-2201',
    userId: 'USR-CL-8803',
    role: ROLE.CLIENT,
    type: NOTIF_TYPE.SUBMISSION_REVIEW,
    title: 'Có người nhận việc của bạn',
    body: 'Nguyễn Văn Thành đã nhận việc "Mua 2 ly cà phê sữa đá ở Landmark 81" và đang thực hiện.',
    read: false,
    link: '/client/listings',
    createdAt: '2026-10-12T11:10:00+07:00',
  },
  {
    id: 'NOT-2202',
    userId: 'USR-CL-8803',
    role: ROLE.CLIENT,
    type: NOTIF_TYPE.SUBMISSION_REVIEW,
    title: 'Kết quả chờ bạn xác nhận',
    body: 'Một việc đã nộp kết quả và đang chờ bạn xác nhận hoàn thành.',
    read: false,
    link: '/client/listings',
    createdAt: '2026-10-12T09:30:00+07:00',
  },
  {
    id: 'NOT-2203',
    userId: 'USR-CL-8803',
    role: ROLE.CLIENT,
    type: NOTIF_TYPE.BILLING,
    title: 'Số dư ví đã thay đổi',
    body: 'Bạn đã chi 55.000đ cho việc "Mua đồ ăn sáng ở chợ Bà Chiểu".',
    read: true,
    link: '/client/billing',
    createdAt: '2026-10-11T11:42:00+07:00',
  },
  {
    id: 'NOT-2204',
    userId: 'USR-CL-8802',
    role: ROLE.CLIENT,
    type: NOTIF_TYPE.SUBMISSION_QA,
    title: 'Kết quả kiểm định đang được duyệt',
    body: '2 kết quả thuộc đơn gom "Kiểm toán trưng bày TP.HCM" đang qua trạm duyệt nội bộ.',
    read: false,
    link: '/client/listings',
    createdAt: '2026-10-12T09:45:00+07:00',
  },
  {
    id: 'NOT-2205',
    userId: 'USR-CL-8802',
    role: ROLE.CLIENT,
    type: NOTIF_TYPE.JOB,
    title: 'Đơn gom đạt 90% tiến độ',
    body: '108/120 điểm đã hoàn thành trong đơn "Kiểm toán trưng bày TP.HCM".',
    read: true,
    link: '/client/jobs/JOB-2026-01',
    createdAt: '2026-10-12T07:00:00+07:00',
  },

  // ── Cho admin ──────────────────────────────────────────────────────────
  {
    id: 'NOT-3301',
    userId: 'USR-AD-001',
    role: ROLE.ADMIN,
    type: NOTIF_TYPE.SUBMISSION_QA,
    title: '2 kết quả đang chờ duyệt',
    body: 'Hàng đợi duyệt nội bộ có 2 kết quả mới cần xử lý.',
    read: false,
    link: '/admin/qa',
    createdAt: '2026-10-12T09:45:00+07:00',
  },
  {
    id: 'NOT-3302',
    userId: 'USR-AD-001',
    role: ROLE.ADMIN,
    type: NOTIF_TYPE.KYC,
    title: '1 hồ sơ định danh mới',
    body: 'Đặng Tuấn Anh vừa gửi hồ sơ định danh, đang chờ duyệt.',
    read: false,
    link: '/admin/workforce',
    createdAt: '2026-10-12T08:05:00+07:00',
  },
  {
    id: 'NOT-3303',
    userId: 'USR-AD-001',
    role: ROLE.ADMIN,
    type: NOTIF_TYPE.SYSTEM,
    title: '1 cảnh báo gian lận đang mở',
    body: 'Cảnh báo "chụp lại ảnh từ màn hình khác" cần xác minh.',
    read: false,
    link: '/admin/fraud',
    createdAt: '2026-10-12T10:45:00+07:00',
  },
];

export function getNotificationsByUser(userId) {
  return NOTIFICATIONS.filter((n) => n.userId === userId).sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
}

export function getUnreadCount(userId) {
  return NOTIFICATIONS.filter((n) => n.userId === userId && !n.read).length;
}
