/**
 * SỐ LIỆU TỔNG HỢP
 *
 * Mọi con số hiển thị trên dashboard đều SUY RA TỪ DỮ LIỆU — không gõ cứng.
 * Đây là chỗ sửa lỗi cũ: trước đây dashboard hiển thị "8.420 người dùng",
 * "hàng đợi QA: 12" nhưng dữ liệu thật chỉ có vài bản ghi, khiến các màn hình
 * mâu thuẫn nhau.
 *
 * Đây là view-model dẫn xuất, KHÔNG phải thực thể lưu trữ.
 */

import { USERS } from './users';
import { LISTINGS } from './listings';
import { SUBMISSIONS } from './submissions';
import { JOBS } from './jobs';
import { FRAUD_ALERTS } from './fraud';
import { WITHDRAWALS, getFinanceSummary } from './finance';
import { ROLE, KYC_STATUS, LISTING_STATUS, QA_STATUS, FRAUD_STATUS, WITHDRAWAL_STATUS } from '../constants';

/** Bảng điều hành nền tảng (admin). */
export function getAdminOverview() {
  const lookers = USERS.filter((u) => u.role === ROLE.LOOKER);
  return {
    totalUsers: USERS.length,
    totalLookers: lookers.length,
    activeLookers: lookers.filter((u) => !u.isLocked && u.kyc.status === KYC_STATUS.VERIFIED).length,
    pendingKyc: USERS.filter((u) => u.kyc.status === KYC_STATUS.PENDING_REVIEW).length,
    openListings: LISTINGS.filter((l) => l.status === LISTING_STATUS.OPEN).length,
    inProgressListings: LISTINGS.filter(
      (l) => l.status === LISTING_STATUS.ASSIGNED || l.status === LISTING_STATUS.IN_PROGRESS
    ).length,
    qaQueue: SUBMISSIONS.filter((s) => s.qaStatus === QA_STATUS.PENDING).length,
    activeFraudAlerts: FRAUD_ALERTS.filter((f) => f.status === FRAUD_STATUS.ACTIVE).length,
    pendingWithdrawals: WITHDRAWALS.filter((w) => w.status === WITHDRAWAL_STATUS.PENDING).length,
    ...getFinanceSummary(),
  };
}

/** Phân bố theo tỉnh/thành — suy ra từ địa điểm tin đăng. */
export function getProvinceDistribution() {
  const map = new Map();
  for (const l of LISTINGS) {
    const p = l.location.province;
    if (!map.has(p)) map.set(p, { province: p, listings: 0, completed: 0 });
    const row = map.get(p);
    row.listings += 1;
    if (l.status === LISTING_STATUS.COMPLETED) row.completed += 1;
  }
  return Array.from(map.values()).sort((a, b) => b.listings - a.listings);
}

/**
 * Phân bố theo nhóm danh mục — cho thấy nền tảng không chỉ có kiểm định.
 * Dùng ở dashboard để trả lời câu hỏi "chợ này có những loại việc gì".
 */
export function getCategoryGroupDistribution(categories) {
  const byId = new Map(categories.map((c) => [c.id, c]));
  const map = new Map();
  for (const l of LISTINGS) {
    const group = byId.get(l.categoryId)?.group || 'KHAC';
    map.set(group, (map.get(group) || 0) + 1);
  }
  return Array.from(map.entries()).map(([group, count]) => ({ group, count }));
}

/** Tổng quan phía người đăng tin. */
export function getClientOverview(hirerId) {
  const listings = LISTINGS.filter((l) => l.hirerId === hirerId);
  const jobs = JOBS.filter((j) => j.hirerId === hirerId);
  const listingIds = new Set(listings.map((l) => l.id));
  const subs = SUBMISSIONS.filter((s) => listingIds.has(s.listingId));

  return {
    activeListings: listings.filter(
      (l) => l.status === LISTING_STATUS.OPEN || l.status === LISTING_STATUS.ASSIGNED
    ).length,
    totalListings: listings.length,
    completed: listings.filter((l) => l.status === LISTING_STATUS.COMPLETED).length,
    awaitingApproval: subs.filter((s) => s.hirerStatus === 'PENDING').length,
    inQaReview: subs.filter((s) => s.qaStatus === QA_STATUS.PENDING).length,
    totalSpent: subs
      .filter((s) => s.hirerStatus === 'APPROVED')
      .reduce((sum, s) => sum + s.reward, 0),
    activeJobs: jobs.filter((j) => j.status === 'ACTIVE').length,
  };
}

/** Tóm tắt phía người nhận việc. */
export function getLookerSummary(lookerId) {
  const user = USERS.find((u) => u.id === lookerId);
  const subs = SUBMISSIONS.filter((s) => s.lookerId === lookerId);
  const activeListings = LISTINGS.filter(
    (l) => l.assignedTo === lookerId && l.status !== LISTING_STATUS.COMPLETED
  );

  return {
    user,
    activeCount: activeListings.length,
    completedCount: subs.filter((s) => s.hirerStatus === 'APPROVED').length,
    pendingCount: subs.filter((s) => s.hirerStatus === 'PENDING').length,
    todayEarnings: subs
      .filter((s) => s.hirerStatus === 'APPROVED' && s.submittedAt?.startsWith('2026-10-11'))
      .reduce((sum, s) => sum + s.reward, 0),
    ...user?.stats,
  };
}
