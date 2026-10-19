/**
 * KẾT QUẢ NỘP
 *
 * Hợp nhất hai thực thể trùng nhau trước đây (`Submission` của người đăng và
 * `QAItem` của trạm duyệt nội bộ) thành một.
 *
 * Điểm quan trọng: `qaStatus` của việc đơn giản là `NOT_REQUIRED` — nghĩa là
 * màn duyệt nội bộ KHÔNG hiện "chờ thẩm định" cho việc không cần thẩm định.
 * Điều này lấy từ nghi thức trong `protocolSnapshot` của tin, không gõ cứng.
 */

import { QA_STATUS, HIRER_STATUS } from '../constants';

const unsplash = (id, w = 800) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&auto=format&fit=crop&q=80`;

export const SUBMISSIONS = [
  // ── Việc kiểm định, đang chờ duyệt nội bộ ──────────────────────────────
  {
    id: 'SUB-8801',
    listingId: 'LIST-8801',
    jobId: 'JOB-2026-01',
    lookerId: 'USR-LK-9921',
    hirerId: 'USR-CL-8802',
    answers: [
      { requirementId: 'REQ-8801-3', value: '14' },
      { requirementId: 'REQ-8801-4', value: 'Không' },
    ],
    evidence: [
      {
        requirementId: 'REQ-8801-1',
        type: 'PHOTO',
        url: unsplash('1527061011665-3652c757a4d4'),
        watermark: 'VỊ TRÍ: 10.76211, 106.70258 • 09:22:01 12/10/2026 • NGUYEN VAN THANH',
        capturedAt: '2026-10-12T09:22:01+07:00',
        gps: { lat: 10.76211, lng: 106.70258, accuracy: 4.2 },
      },
      {
        requirementId: 'REQ-8801-2',
        type: 'PHOTO',
        url: unsplash('1563245372-f21724e3856d'),
        watermark: 'VỊ TRÍ: 10.76211, 106.70258 • 09:23:14 12/10/2026 • NGUYEN VAN THANH',
        capturedAt: '2026-10-12T09:23:14+07:00',
        gps: { lat: 10.76211, lng: 106.70258, accuracy: 4.2 },
      },
    ],
    gps: { lat: 10.76211, lng: 106.70258, accuracy: 4.2, distanceToTarget: 4.2, isMockSuspected: false },
    submittedAt: '2026-10-12T09:24:15+07:00',
    qaStatus: QA_STATUS.PENDING,
    hirerStatus: HIRER_STATUS.PENDING,
    reviewNote: '',
    reward: 85000,
    payoutRef: null,
    thumbnail: unsplash('1527061011665-3652c757a4d4', 200),
  },
  {
    id: 'SUB-8802',
    listingId: 'LIST-8802',
    jobId: 'JOB-2026-01',
    lookerId: 'USR-LK-9922',
    hirerId: 'USR-CL-8802',
    answers: [
      { requirementId: 'REQ-8802-3', value: '8' },
      { requirementId: 'REQ-8802-4', value: 'Có' },
    ],
    evidence: [
      {
        requirementId: 'REQ-8802-1',
        type: 'PHOTO',
        url: unsplash('1555396273-367ea4eb4db5'),
        watermark: 'VỊ TRÍ: 10.77908, 106.70359 • 09:39:55 12/10/2026 • LE HOANG LONG',
        capturedAt: '2026-10-12T09:39:55+07:00',
        gps: { lat: 10.77908, lng: 106.70359, accuracy: 6.1 },
      },
      {
        requirementId: 'REQ-8802-2',
        type: 'PHOTO',
        url: unsplash('1548943487-a2e4e43b4853'),
        watermark: 'VỊ TRÍ: 10.77908, 106.70359 • 09:41:02 12/10/2026 • LE HOANG LONG',
        capturedAt: '2026-10-12T09:41:02+07:00',
        gps: { lat: 10.77908, lng: 106.70359, accuracy: 6.1 },
      },
    ],
    gps: { lat: 10.77908, lng: 106.70359, accuracy: 6.1, distanceToTarget: 6.1, isMockSuspected: false },
    submittedAt: '2026-10-12T09:41:20+07:00',
    qaStatus: QA_STATUS.PENDING,
    hirerStatus: HIRER_STATUS.PENDING,
    reviewNote: '',
    reward: 85000,
    payoutRef: null,
    thumbnail: unsplash('1555396273-367ea4eb4db5', 200),
  },

  // ── Việc kiểm định đã xong và được xác nhận ────────────────────────────
  {
    id: 'SUB-8785',
    listingId: 'LIST-8785',
    jobId: null,
    lookerId: 'USR-LK-9921',
    hirerId: 'USR-CL-8802',
    answers: [{ requirementId: 'REQ-8785-3', value: 'Không' }],
    evidence: [
      {
        requirementId: 'REQ-8785-1',
        type: 'PHOTO',
        url: unsplash('1560518883-ce09059eeffa'),
        watermark: 'VỊ TRÍ: 10.73850, 106.72250 • 14:32:10 10/10/2026 • NGUYEN VAN THANH',
        capturedAt: '2026-10-10T14:32:10+07:00',
        gps: { lat: 10.7385, lng: 106.7225, accuracy: 3.8 },
      },
      {
        requirementId: 'REQ-8785-2',
        type: 'PHOTO',
        url: unsplash('1580587771525-78b9dba3b914'),
        watermark: 'VỊ TRÍ: 10.73850, 106.72250 • 14:36:44 10/10/2026 • NGUYEN VAN THANH',
        capturedAt: '2026-10-10T14:36:44+07:00',
        gps: { lat: 10.7385, lng: 106.7225, accuracy: 3.8 },
      },
    ],
    gps: { lat: 10.7385, lng: 106.7225, accuracy: 3.8, distanceToTarget: 3.8, isMockSuspected: false },
    submittedAt: '2026-10-10T14:40:00+07:00',
    qaStatus: QA_STATUS.PASSED,
    hirerStatus: HIRER_STATUS.APPROVED,
    reviewNote: '',
    reward: 220000,
    payoutRef: '9PAY-INSTANT-554',
    thumbnail: unsplash('1560518883-ce09059eeffa', 200),
  },

  // ── Việc đơn giản — KHÔNG qua duyệt nội bộ ─────────────────────────────
  {
    id: 'SUB-8790',
    listingId: 'LIST-8790',
    jobId: null,
    lookerId: 'USR-LK-9921',
    hirerId: 'USR-CL-8803',
    answers: [],
    evidence: [
      {
        requirementId: 'REQ-8790-2',
        type: 'PHOTO',
        url: unsplash('1559056199-641a0ac8b55e'),
        watermark: '',
        capturedAt: '2026-10-11T07:05:00+07:00',
        gps: null,
      },
    ],
    gps: null,
    submittedAt: '2026-10-11T07:08:00+07:00',
    // Nghi thức của CAT-MARKET không bật requireAdminReview → không cần nền tảng duyệt.
    qaStatus: QA_STATUS.NOT_REQUIRED,
    hirerStatus: HIRER_STATUS.APPROVED,
    reviewNote: '',
    reward: 55000,
    payoutRef: '9PAY-INSTANT-892',
    thumbnail: unsplash('1559056199-641a0ac8b55e', 200),
  },
];

// ── Truy vấn ───────────────────────────────────────────────────────────────

export function getSubmissionById(id) {
  return SUBMISSIONS.find((s) => s.id === id) || null;
}

export function getSubmissionByListing(listingId) {
  return SUBMISSIONS.find((s) => s.listingId === listingId) || null;
}

export function getSubmissionsByLooker(lookerId) {
  return SUBMISSIONS.filter((s) => s.lookerId === lookerId);
}

export function getSubmissionsByHirer(hirerId) {
  return SUBMISSIONS.filter((s) => s.hirerId === hirerId);
}

/** Hàng đợi duyệt nội bộ — chỉ gồm việc có nghi thức yêu cầu duyệt. */
export function getQaQueue() {
  return SUBMISSIONS.filter((s) => s.qaStatus === QA_STATUS.PENDING);
}

/** Chờ người đăng xác nhận — sau khi đã qua duyệt nội bộ (hoặc không cần duyệt). */
export function getAwaitingHirerApproval() {
  return SUBMISSIONS.filter(
    (s) =>
      s.hirerStatus === HIRER_STATUS.PENDING &&
      (s.qaStatus === QA_STATUS.PASSED || s.qaStatus === QA_STATUS.NOT_REQUIRED)
  );
}
