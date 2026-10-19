/**
 * NGƯỜI DÙNG — NGUỒN PHÁN QUYẾT DUY NHẤT
 *
 * Trước đây có hai nguồn lệch nhau: `MOCK_USERS` (3 tài khoản cho login) và
 * một mảng riêng trong `app/admin/workforce` (4 looker). File này hợp nhất lại.
 *
 * Phân biệt rõ:
 *   • `USERS`         — toàn bộ người dùng thật của hệ thống (workforce, QA, review đọc từ đây)
 *   • `DEMO_ACCOUNTS` — 3 tài khoản để đăng nhập nhanh khi demo, trỏ tới id trong USERS
 *
 * KHÔNG có cấp bậc, chứng chỉ, hay tier. Cổng duy nhất để nhận việc là KYC.
 */

import { ROLE, HIRER_TYPE, KYC_STATUS } from '../constants';

const avatar = (id) =>
  `https://images.unsplash.com/photo-${id}?w=150&auto=format&fit=crop&q=80`;

const kycVerified = (idCardNumber) => ({
  status: KYC_STATUS.VERIFIED,
  idCardNumber,
  idCardFrontUrl: null,
  idCardBackUrl: null,
  selfieUrl: null,
  faceMatchScore: 99.2,
  submittedAt: '2026-08-10T09:00:00+07:00',
  verifiedAt: '2026-08-10T09:20:00+07:00',
  reviewedBy: 'USR-AD-001',
  rejectReason: '',
});

export const USERS = [
  // ═══════════════════════════════════════════════════════════════════════
  // NGƯỜI NHẬN VIỆC (LOOKER)
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: 'USR-LK-9921',
    role: ROLE.LOOKER,
    name: 'Nguyễn Văn Thành',
    phone: '0908 123 456',
    email: 'thanh.nguyen@imhere.vn',
    avatar: avatar('1534528741775-53994a69daeb'),
    kyc: kycVerified('079094001234'),
    isLocked: false,
    rating: 4.96,
    stats: { completedCount: 84, approvalRate: 99.3, onTimeRate: 96.4, cancelledCount: 2 },
    province: 'TP. Hồ Chí Minh',
    serviceAreas: ['Quận 1', 'Quận 3', 'Quận 4', 'Quận 7', 'Bình Thạnh'],
    interestCategoryIds: ['CAT-MARKET', 'CAT-RETAIL-AUDIT', 'CAT-PICKUP'],
    bankAccount: { bank: 'Vietcombank', accountNumber: '998812345678', holder: 'NGUYEN VAN THANH' },
    createdAt: '2026-03-14T08:00:00+07:00',
  },
  {
    id: 'USR-LK-9922',
    role: ROLE.LOOKER,
    name: 'Lê Hoàng Long',
    phone: '0918 888 999',
    email: 'long.le@imhere.vn',
    avatar: avatar('1500648767791-00dcc994a43e'),
    kyc: kycVerified('079095002345'),
    isLocked: false,
    rating: 4.92,
    stats: { completedCount: 42, approvalRate: 97.6, onTimeRate: 94.1, cancelledCount: 1 },
    province: 'TP. Hồ Chí Minh',
    serviceAreas: ['Quận 1', 'Quận 3'],
    interestCategoryIds: ['CAT-ASSET-CHECK', 'CAT-MOVE'],
    bankAccount: { bank: 'Techcombank', accountNumber: '19001234567', holder: 'LE HOANG LONG' },
    createdAt: '2026-05-02T08:00:00+07:00',
  },
  {
    id: 'USR-LK-9923',
    role: ROLE.LOOKER,
    name: 'Phạm Minh Trí',
    phone: '0933 111 222',
    email: 'tri.pham@imhere.vn',
    avatar: avatar('1506794778202-cad84cf45f1d'),
    kyc: kycVerified('079096003456'),
    isLocked: false,
    rating: 4.88,
    stats: { completedCount: 31, approvalRate: 96.8, onTimeRate: 92.0, cancelledCount: 3 },
    province: 'TP. Hồ Chí Minh',
    serviceAreas: ['Bình Thạnh', 'Phú Nhuận'],
    interestCategoryIds: ['CAT-MARKET', 'CAT-FOOD', 'CAT-QUEUE'],
    bankAccount: { bank: 'MB Bank', accountNumber: '9704221234567890', holder: 'PHAM MINH TRI' },
    createdAt: '2026-06-20T08:00:00+07:00',
  },
  {
    id: 'USR-LK-9924',
    role: ROLE.LOOKER,
    name: 'Vũ Quốc Bảo',
    phone: '0977 444 555',
    email: 'bao.vu@imhere.vn',
    avatar: avatar('1519085360753-af0119f7cbe7'),
    kyc: kycVerified('079097004567'),
    isLocked: true,
    lockReason: 'Nghi vấn gian lận vị trí — đang chờ đối soát',
    rating: 4.10,
    stats: { completedCount: 8, approvalRate: 71.4, onTimeRate: 60.0, cancelledCount: 5 },
    province: 'TP. Hồ Chí Minh',
    serviceAreas: ['Cầu Giấy', 'Thanh Xuân'],
    interestCategoryIds: ['CAT-RETAIL-AUDIT'],
    bankAccount: { bank: 'VietinBank', accountNumber: '100998877665', holder: 'VU QUOC BAO' },
    createdAt: '2026-09-18T08:00:00+07:00',
  },
  {
    id: 'USR-LK-9925',
    role: ROLE.LOOKER,
    name: 'Đặng Tuấn Anh',
    phone: '0966 777 888',
    email: 'anh.dang@imhere.vn',
    avatar: avatar('1472099645785-5658abf4ff4e'),
    kyc: {
      status: KYC_STATUS.PENDING_REVIEW,
      idCardNumber: '079099005678',
      idCardFrontUrl: null,
      idCardBackUrl: null,
      selfieUrl: null,
      faceMatchScore: null,
      submittedAt: '2026-10-12T08:05:00+07:00',
      verifiedAt: null,
      reviewedBy: null,
      rejectReason: '',
    },
    isLocked: false,
    rating: 0,
    stats: { completedCount: 0, approvalRate: 0, onTimeRate: 0, cancelledCount: 0 },
    province: 'TP. Hồ Chí Minh',
    serviceAreas: ['Quận 5', 'Quận 10'],
    interestCategoryIds: ['CAT-MARKET'],
    bankAccount: { bank: 'ACB', accountNumber: '123456789', holder: 'DANG TUAN ANH' },
    createdAt: '2026-10-12T08:00:00+07:00',
  },

  // ═══════════════════════════════════════════════════════════════════════
  // NGƯỜI ĐĂNG TIN (CLIENT)
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: 'USR-CL-8802',
    role: ROLE.CLIENT,
    name: 'Trần Minh Quân',
    phone: '0912 345 678',
    email: 'quan.tran@heineken.com.vn',
    avatar: avatar('1507003211169-0a1dd7228f2d'),
    kyc: kycVerified('079088001122'),
    isLocked: false,
    rating: 4.90,
    stats: { completedCount: 0, approvalRate: 0, onTimeRate: 0, cancelledCount: 0 },
    hirerType: HIRER_TYPE.ORGANIZATION,
    organization: {
      name: 'Heineken Vietnam — Kiểm toán thương mại',
      taxId: '0300823584',
      address: '16 Lý Thường Kiệt, Quận Hoàn Kiếm, Hà Nội',
      representative: 'Trần Minh Quân',
      webhookUrl: 'https://api.heineken.com.vn/hooks/imhere',
    },
    createdAt: '2026-02-01T08:00:00+07:00',
  },
  {
    id: 'USR-CL-8803',
    role: ROLE.CLIENT,
    name: 'Nguyễn Thị Lan',
    phone: '0903 222 111',
    email: 'lan.nguyen@gmail.com',
    avatar: avatar('1487412720507-e7ab37603c6f'),
    kyc: kycVerified('079090003344'),
    isLocked: false,
    rating: 4.85,
    stats: { completedCount: 0, approvalRate: 0, onTimeRate: 0, cancelledCount: 0 },
    hirerType: HIRER_TYPE.INDIVIDUAL,
    organization: null,
    createdAt: '2026-09-05T08:00:00+07:00',
  },

  // ═══════════════════════════════════════════════════════════════════════
  // QUẢN TRỊ
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: 'USR-AD-001',
    role: ROLE.ADMIN,
    name: 'Phạm Thu Trang',
    phone: '0938 789 999',
    email: 'trang.pham@imhere.vn',
    avatar: avatar('1573496359142-b8d87734a5a2'),
    kyc: kycVerified('001188002233'),
    isLocked: false,
    rating: 0,
    stats: { completedCount: 0, approvalRate: 0, onTimeRate: 0, cancelledCount: 0 },
    title: 'Trưởng ban Vận hành & Chất lượng',
    permissions: ['QA_REVIEW', 'KYC_REVIEW', 'FRAUD_REVIEW', 'FINANCE', 'CMS'],
    createdAt: '2026-01-05T08:00:00+07:00',
  },
];

// ── Truy vấn ───────────────────────────────────────────────────────────────

export function getUserById(id) {
  return USERS.find((u) => u.id === id) || null;
}

export function getUsersByRole(role) {
  return USERS.filter((u) => u.role === role);
}

export function getLookers() {
  return getUsersByRole(ROLE.LOOKER);
}

/** Người dùng đang chờ duyệt hồ sơ (dùng cho badge ở admin). */
export function getPendingKycUsers() {
  return USERS.filter((u) => u.kyc.status === KYC_STATUS.PENDING_REVIEW);
}

// ── Tài khoản demo cho màn đăng nhập ───────────────────────────────────────
// Trỏ tới id trong USERS — không tự chứa dữ liệu, để không bao giờ lệch.

export const DEMO_ACCOUNTS = {
  [ROLE.LOOKER]: {
    userId: 'USR-LK-9921',
    badge: 'NGƯỜI NHẬN VIỆC',
    title: 'Người nhận việc',
    subtitle: 'Nhận việc gần bạn và nhận tiền ngay khi hoàn thành',
    redirect: '/looker',
  },
  [ROLE.CLIENT]: {
    userId: 'USR-CL-8803',
    badge: 'NGƯỜI ĐĂNG TIN',
    title: 'Người đăng tin',
    subtitle: 'Đăng việc bạn cần giúp, chọn người và xác nhận khi xong',
    redirect: '/client/dashboard',
  },
  [ROLE.ADMIN]: {
    userId: 'USR-AD-001',
    badge: 'QUẢN TRỊ',
    title: 'Quản trị viên',
    subtitle: 'Duyệt hồ sơ, xử lý tranh chấp và vận hành nền tảng',
    redirect: '/admin/dashboard',
  },
};
