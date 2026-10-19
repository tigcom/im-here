/**
 * NGUỒN ENUM DUY NHẤT CỦA NỀN TẢNG
 *
 * Mọi so sánh trạng thái trong app PHẢI dùng hằng số ở đây.
 * Không viết chuỗi trực tiếp (`status === 'PASSED'`) rải rác trong component —
 * đó chính là cách lỗi `PASSED` vs `QA_PASSED` đã phát sinh trước đây.
 */

// ── Vai trò (Chỉ có 2 Role chính thức: Người dùng & Quản trị viên) ───────────
export const ROLE = {
  USER: 'user',       // Người dùng nền tảng (vừa đăng việc vừa nhận việc)
  LOOKER: 'looker',   // Alias tương thích
  CLIENT: 'client',   // Alias tương thích
  ADMIN: 'admin',     // Quản trị viên vận hành nền tảng
};

export const ROLE_LABEL = {
  [ROLE.USER]: 'Người dùng nền tảng',
  [ROLE.LOOKER]: 'Người nhận việc',
  [ROLE.CLIENT]: 'Người đăng tin',
  [ROLE.ADMIN]: 'Quản trị viên',
};

// ── Chế độ sử dụng của cùng 1 Tài khoản ────────────────────────────────────
export const APP_MODE = {
  DOER: 'doer',     // Chế độ làm việc / nhận việc (Looker thực địa)
  HIRER: 'hirer',   // Chế độ thuê việc / đăng tin (Client)
};

export const APP_MODE_LABEL = {
  [APP_MODE.DOER]: 'Kiếm việc quanh đây',
  [APP_MODE.HIRER]: 'Đăng việc & Thuê người',
};

// ── Loại người đăng ────────────────────────────────────────────────────────
export const HIRER_TYPE = {
  INDIVIDUAL: 'INDIVIDUAL',     // cá nhân
  ORGANIZATION: 'ORGANIZATION', // doanh nghiệp / hộ kinh doanh
};

export const HIRER_TYPE_LABEL = {
  [HIRER_TYPE.INDIVIDUAL]: 'Cá nhân',
  [HIRER_TYPE.ORGANIZATION]: 'Doanh nghiệp / Hộ kinh doanh',
};

// ── Nhóm danh mục việc ─────────────────────────────────────────────────────
export const CATEGORY_GROUP = {
  ERRAND: 'ERRAND',         // việc vặt: đi chợ, xếp hàng, mua hộ
  DELIVERY: 'DELIVERY',     // giao nhận: chở đồ, ship
  ASSIST: 'ASSIST',         // phụ việc: trông coi, bưng bê, dọn dẹp
  VERIFICATION: 'VERIFICATION', // kiểm định: quầy kệ, tài sản, KYC
};

export const CATEGORY_GROUP_LABEL = {
  [CATEGORY_GROUP.ERRAND]: 'Việc vặt',
  [CATEGORY_GROUP.DELIVERY]: 'Giao nhận',
  [CATEGORY_GROUP.ASSIST]: 'Phụ việc',
  [CATEGORY_GROUP.VERIFICATION]: 'Kiểm định',
};

// ── Trạng thái tin đăng ────────────────────────────────────────────────────
export const LISTING_STATUS = {
  DRAFT: 'DRAFT',             // nháp, chưa công khai
  OPEN: 'OPEN',               // đang mở, ai cũng nhận được
  ASSIGNED: 'ASSIGNED',       // đã có người nhận, chưa bắt đầu
  IN_PROGRESS: 'IN_PROGRESS', // người nhận đang làm
  SUBMITTED: 'SUBMITTED',     // đã nộp kết quả, chờ xác nhận
  COMPLETED: 'COMPLETED',     // hoàn tất
  EXPIRED: 'EXPIRED',         // quá hạn
  CANCELLED: 'CANCELLED',     // người đăng huỷ
};

export const LISTING_STATUS_LABEL = {
  [LISTING_STATUS.DRAFT]: 'Nháp',
  [LISTING_STATUS.OPEN]: 'Đang mở',
  [LISTING_STATUS.ASSIGNED]: 'Đã có người nhận',
  [LISTING_STATUS.IN_PROGRESS]: 'Đang thực hiện',
  [LISTING_STATUS.SUBMITTED]: 'Chờ xác nhận',
  [LISTING_STATUS.COMPLETED]: 'Hoàn thành',
  [LISTING_STATUS.EXPIRED]: 'Hết hạn',
  [LISTING_STATUS.CANCELLED]: 'Đã huỷ',
};

// ── Trạng thái đơn gom ─────────────────────────────────────────────────────
export const JOB_STATUS = {
  DRAFT: 'DRAFT',
  ACTIVE: 'ACTIVE',
  PAUSED: 'PAUSED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
};

// ── Loại yêu cầu trong một tin (gộp câu hỏi + bước chụp) ───────────────────
// Câu hỏi khảo sát của người đăng = các item TEXT/NUMBER/CHOICE/CHECKBOX.
// Bước chụp của việc kiểm định = item PHOTO/VIDEO.
export const REQ_TYPE = {
  PHOTO: 'PHOTO',
  VIDEO: 'VIDEO',
  TEXT: 'TEXT',
  NUMBER: 'NUMBER',
  CHOICE: 'CHOICE',
  CHECKBOX: 'CHECKBOX',
  SIGNATURE: 'SIGNATURE',
  RECEIPT: 'RECEIPT',
  NOTE: 'NOTE',
};

export const REQ_TYPE_LABEL = {
  [REQ_TYPE.PHOTO]: 'Chụp ảnh',
  [REQ_TYPE.VIDEO]: 'Quay video',
  [REQ_TYPE.TEXT]: 'Trả lời ngắn',
  [REQ_TYPE.NUMBER]: 'Nhập số',
  [REQ_TYPE.CHOICE]: 'Chọn một',
  [REQ_TYPE.CHECKBOX]: 'Đánh dấu',
  [REQ_TYPE.SIGNATURE]: 'Chữ ký',
  [REQ_TYPE.RECEIPT]: 'Ảnh hoá đơn',
  [REQ_TYPE.NOTE]: 'Ghi chú',
};

// ── Trạng thái duyệt nộp kết quả ───────────────────────────────────────────
// `NOT_REQUIRED` dùng khi nghi thức của loại việc không yêu cầu nền tảng duyệt.
export const QA_STATUS = {
  NOT_REQUIRED: 'NOT_REQUIRED',
  PENDING: 'PENDING',
  PASSED: 'PASSED',
  REJECTED: 'REJECTED',
  FRAUD_FLAGGED: 'FRAUD_FLAGGED',
};

export const HIRER_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
};

// ── Trạng thái hồ sơ định danh (KYC) ───────────────────────────────────────
// Đây là CỔNG DUY NHẤT để được nhận việc — không có cấp bậc, không chứng chỉ.
export const KYC_STATUS = {
  UNVERIFIED: 'UNVERIFIED',
  PENDING_REVIEW: 'PENDING_REVIEW',
  VERIFIED: 'VERIFIED',
  REJECTED: 'REJECTED',
};

export const KYC_STATUS_LABEL = {
  [KYC_STATUS.UNVERIFIED]: 'Chưa gửi hồ sơ',
  [KYC_STATUS.PENDING_REVIEW]: 'Chờ duyệt',
  [KYC_STATUS.VERIFIED]: 'Đã duyệt',
  [KYC_STATUS.REJECTED]: 'Bị từ chối',
};

// ── Sổ cái giao dịch ───────────────────────────────────────────────────────
export const TXN_DIRECTION = {
  IN: 'IN',
  OUT: 'OUT',
};

export const TXN_TYPE = {
  TOPUP: 'TOPUP',                   // nạp tiền vào ví / quỹ
  ESCROW_HOLD: 'ESCROW_HOLD',       // giữ tiền khi đăng tin
  ESCROW_RELEASE: 'ESCROW_RELEASE', // giải phóng khi hoàn thành
  PAYOUT: 'PAYOUT',                 // trả thù lao cho người nhận việc
  WITHDRAWAL: 'WITHDRAWAL',         // rút tiền về ngân hàng
  FEE: 'FEE',                       // phí nền tảng
  REFUND: 'REFUND',                 // hoàn tiền
};

export const TXN_TYPE_LABEL = {
  [TXN_TYPE.TOPUP]: 'Nạp tiền',
  [TXN_TYPE.ESCROW_HOLD]: 'Giữ tiền đăng tin',
  [TXN_TYPE.ESCROW_RELEASE]: 'Giải phóng tiền',
  [TXN_TYPE.PAYOUT]: 'Nhận thù lao',
  [TXN_TYPE.WITHDRAWAL]: 'Rút tiền',
  [TXN_TYPE.FEE]: 'Phí nền tảng',
  [TXN_TYPE.REFUND]: 'Hoàn tiền',
};

export const TXN_STATUS = {
  PENDING: 'PENDING',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
};

// ── Trạng thái lệnh rút tiền ───────────────────────────────────────────────
export const WITHDRAWAL_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
};

// ── Loại thông báo ─────────────────────────────────────────────────────────
export const NOTIF_TYPE = {
  LISTING_NEW: 'LISTING_NEW',           // có tin mới gần bạn
  LISTING_UPDATE: 'LISTING_UPDATE',     // tin bạn quan tâm thay đổi
  SUBMISSION_QA: 'SUBMISSION_QA',       // kết quả duyệt nội bộ
  SUBMISSION_REVIEW: 'SUBMISSION_REVIEW', // người đăng xác nhận/từ chối
  PAYMENT: 'PAYMENT',                   // tiền vào ví
  WITHDRAWAL: 'WITHDRAWAL',             // lệnh rút được xử lý
  KYC: 'KYC',                           // hồ sơ định danh
  JOB: 'JOB',                           // đơn gom
  BILLING: 'BILLING',                   // quỹ / hoá đơn
  SYSTEM: 'SYSTEM',
};

// ── Cảnh báo gian lận ──────────────────────────────────────────────────────
export const FRAUD_TYPE = {
  MOCK_GPS: 'MOCK_GPS',               // giả lập vị trí
  RE_SHOT_SCREEN: 'RE_SHOT_SCREEN',   // chụp lại từ màn hình khác
  DEVICE_TAMPER: 'DEVICE_TAMPER',     // can thiệp thiết bị
};

export const FRAUD_STATUS = {
  ACTIVE: 'ACTIVE',
  DISMISSED: 'DISMISSED',
  LOCKED: 'LOCKED',
};
