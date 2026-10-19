/**
 * TÀI CHÍNH — ví, sổ cái giao dịch, lệnh rút tiền
 *
 * Hợp nhất hai hệ giao dịch vốn không tương thích trước đây:
 *   • Looker:  `type: 'INCOME' | 'WITHDRAW'`
 *   • Client:  `type: 'PAYMENT' | 'DEPOSIT'`
 *
 * Nay dùng một sổ cái duy nhất: `direction` (IN/OUT) + `type` (nghiệp vụ).
 */

import { TXN_DIRECTION, TXN_TYPE, TXN_STATUS, WITHDRAWAL_STATUS, ROLE } from '../constants';

// ═══════════════════════════════════════════════════════════════════════════
// VÍ
// ═══════════════════════════════════════════════════════════════════════════

export const WALLETS = [
  {
    id: 'WAL-LK-9921',
    ownerId: 'USR-LK-9921',
    role: ROLE.LOOKER,
    available: 1450000,
    pending: 380000,
    escrow: 0,
    currency: 'VND',
  },
  {
    id: 'WAL-CL-8802',
    ownerId: 'USR-CL-8802',
    role: ROLE.CLIENT,
    available: 45000000,
    pending: 0,
    escrow: 1020000,
    currency: 'VND',
  },
  {
    id: 'WAL-CL-8803',
    ownerId: 'USR-CL-8803',
    role: ROLE.CLIENT,
    available: 3200000,
    pending: 0,
    escrow: 455000,
    currency: 'VND',
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// SỔ CÁI GIAO DỊCH
// ═══════════════════════════════════════════════════════════════════════════

export const TRANSACTIONS = [
  // Người nhận việc
  {
    id: 'TXN-9021',
    walletId: 'WAL-LK-9921',
    ownerId: 'USR-LK-9921',
    role: ROLE.LOOKER,
    direction: TXN_DIRECTION.IN,
    type: TXN_TYPE.PAYOUT,
    amount: 110000,
    fee: 11000,
    balanceAfter: 1450000,
    status: TXN_STATUS.SUCCESS,
    refType: 'SUBMISSION',
    refId: 'SUB-8790',
    bankRef: '9PAY-INSTANT-892',
    description: 'Thù lao việc "Mua đồ ăn sáng ở chợ Bà Chiểu"',
    createdAt: '2026-10-11T11:42:00+07:00',
  },
  {
    id: 'TXN-9020',
    walletId: 'WAL-LK-9921',
    ownerId: 'USR-LK-9921',
    role: ROLE.LOOKER,
    direction: TXN_DIRECTION.OUT,
    type: TXN_TYPE.WITHDRAWAL,
    amount: 500000,
    fee: 0,
    balanceAfter: 1340000,
    status: TXN_STATUS.SUCCESS,
    refType: 'WITHDRAWAL',
    refId: 'WDR-901',
    bankRef: '9PAY-VCB-7741',
    description: 'Rút về Vietcombank (*8832)',
    createdAt: '2026-10-11T09:15:00+07:00',
  },
  {
    id: 'TXN-9019',
    walletId: 'WAL-LK-9921',
    ownerId: 'USR-LK-9921',
    role: ROLE.LOOKER,
    direction: TXN_DIRECTION.IN,
    type: TXN_TYPE.PAYOUT,
    amount: 220000,
    fee: 22000,
    balanceAfter: 1840000,
    status: TXN_STATUS.SUCCESS,
    refType: 'SUBMISSION',
    refId: 'SUB-8785',
    bankRef: '9PAY-INSTANT-554',
    description: 'Thù lao việc "Xác minh nhà phố thế chấp tại Quận 7"',
    createdAt: '2026-10-10T16:30:00+07:00',
  },
  {
    id: 'TXN-9018',
    walletId: 'WAL-LK-9921',
    ownerId: 'USR-LK-9921',
    role: ROLE.LOOKER,
    direction: TXN_DIRECTION.IN,
    type: TXN_TYPE.PAYOUT,
    amount: 60000,
    fee: 6000,
    balanceAfter: 1620000,
    status: TXN_STATUS.SUCCESS,
    refType: 'SUBMISSION',
    refId: 'SUB-8760',
    bankRef: '9PAY-INSTANT-441',
    description: 'Thù lao việc "Đi chợ dùm ở chợ Thị Nghè"',
    createdAt: '2026-10-10T08:20:00+07:00',
  },

  // Người đăng tin
  {
    id: 'TXN-8801',
    walletId: 'WAL-CL-8802',
    ownerId: 'USR-CL-8802',
    role: ROLE.CLIENT,
    direction: TXN_DIRECTION.OUT,
    type: TXN_TYPE.ESCROW_RELEASE,
    amount: 220000,
    fee: 22000,
    balanceAfter: 45000000,
    status: TXN_STATUS.SUCCESS,
    refType: 'SUBMISSION',
    refId: 'SUB-8785',
    bankRef: '9PAY-ESCROW-208',
    description: 'Chi trả cho việc "Xác minh nhà phố thế chấp tại Quận 7"',
    createdAt: '2026-10-10T16:35:00+07:00',
  },
  {
    id: 'TXN-8800',
    walletId: 'WAL-CL-8802',
    ownerId: 'USR-CL-8802',
    role: ROLE.CLIENT,
    direction: TXN_DIRECTION.IN,
    type: TXN_TYPE.TOPUP,
    amount: 20000000,
    fee: 0,
    balanceAfter: 45000000,
    status: TXN_STATUS.SUCCESS,
    refType: null,
    refId: null,
    bankRef: '9PAY-TOPUP-771',
    description: 'Nạp quỹ qua cổng 9Pay',
    createdAt: '2026-10-08T13:30:00+07:00',
  },
  {
    id: 'TXN-8802',
    walletId: 'WAL-CL-8802',
    ownerId: 'USR-CL-8802',
    role: ROLE.CLIENT,
    direction: TXN_DIRECTION.OUT,
    type: TXN_TYPE.ESCROW_HOLD,
    amount: 10200000,
    fee: 0,
    balanceAfter: 34800000,
    status: TXN_STATUS.SUCCESS,
    refType: 'JOB',
    refId: 'JOB-2026-01',
    bankRef: '9PAY-ESCROW-201',
    description: 'Giữ tiền cho đơn gom "Kiểm toán trưng bày TP.HCM"',
    createdAt: '2026-10-08T14:00:00+07:00',
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// LỆNH RÚT TIỀN
// ═══════════════════════════════════════════════════════════════════════════

export const WITHDRAWALS = [
  {
    id: 'WDR-901',
    lookerId: 'USR-LK-9921',
    amount: 500000,
    bankName: 'Vietcombank',
    accountNumber: '998812345678',
    status: WITHDRAWAL_STATUS.APPROVED,
    requestedAt: '2026-10-11T09:10:00+07:00',
    processedAt: '2026-10-11T09:15:00+07:00',
    transactionId: 'TXN-9020',
    rejectReason: '',
  },
  {
    id: 'WDR-902',
    lookerId: 'USR-LK-9922',
    amount: 450000,
    bankName: 'Techcombank',
    accountNumber: '19001234567',
    status: WITHDRAWAL_STATUS.PENDING,
    requestedAt: '2026-10-12T08:30:00+07:00',
    processedAt: null,
    transactionId: null,
    rejectReason: '',
  },
  {
    id: 'WDR-903',
    lookerId: 'USR-LK-9923',
    amount: 275000,
    bankName: 'MB Bank',
    accountNumber: '9704221234567890',
    status: WITHDRAWAL_STATUS.PENDING,
    requestedAt: '2026-10-12T10:05:00+07:00',
    processedAt: null,
    transactionId: null,
    rejectReason: '',
  },
];

// ── Truy vấn ───────────────────────────────────────────────────────────────

export function getWalletByOwner(ownerId) {
  return WALLETS.find((w) => w.ownerId === ownerId) || null;
}

export function getTransactionsByOwner(ownerId) {
  return TRANSACTIONS.filter((t) => t.ownerId === ownerId).sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
}

export function getPendingWithdrawals() {
  return WITHDRAWALS.filter((w) => w.status === WITHDRAWAL_STATUS.PENDING);
}

/**
 * Tổng hợp tài chính toàn nền tảng — dùng cho màn đối soát của admin.
 * Mọi con số ở đây SUY RA TỪ DỮ LIỆU, không gõ cứng.
 */
export function getFinanceSummary() {
  const escrowHeld = WALLETS.reduce((sum, w) => sum + w.escrow, 0);
  const paidOut = TRANSACTIONS.filter(
    (t) => t.type === TXN_TYPE.PAYOUT && t.status === TXN_STATUS.SUCCESS
  ).reduce((sum, t) => sum + t.amount, 0);
  const feesCollected = TRANSACTIONS.filter(
    (t) => t.status === TXN_STATUS.SUCCESS
  ).reduce((sum, t) => sum + t.fee, 0);
  const topUps = TRANSACTIONS.filter(
    (t) => t.type === TXN_TYPE.TOPUP && t.status === TXN_STATUS.SUCCESS
  ).reduce((sum, t) => sum + t.amount, 0);
  const pendingWithdrawals = getPendingWithdrawals().reduce((sum, w) => sum + w.amount, 0);

  return { escrowHeld, paidOut, feesCollected, topUps, pendingWithdrawals };
}
