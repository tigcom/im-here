/**
 * SELECTORS — ghép dữ liệu giữa các thực thể.
 *
 * Màn hình KHÔNG nên tự viết `LISTINGS.find(...)?.hirerId` rồi tra tiếp.
 * Mọi phép ghép nằm ở đây để chỉ có một cách hiểu dữ liệu.
 */

import {
  USERS,
  getUserById,
  CATEGORIES,
  getCategoryById,
  getProtocolForCategory,
  JOBS,
  getJobById,
  LISTINGS,
  getListingById,
  SUBMISSIONS,
  getSubmissionByListing,
  getWalletByOwner,
} from './data';

import { LISTING_STATUS, QA_STATUS, HIRER_STATUS, ROLE, KYC_STATUS } from './constants';
import { haversineKm } from './format';

/**
 * Tin đăng kèm thông tin người đăng, danh mục và nghi thức.
 * Đây là dạng dùng cho hầu hết màn hình hiển thị tin.
 */
export function getListingDetail(listingId) {
  const listing = getListingById(listingId);
  if (!listing) return null;

  const category = getCategoryById(listing.categoryId);
  const hirer = getUserById(listing.hirerId);
  const looker = listing.assignedTo ? getUserById(listing.assignedTo) : null;
  const job = listing.jobId ? getJobById(listing.jobId) : null;

  // Nghi thức: ưu tiên bản đóng băng trong tin; nếu thiếu thì lấy từ danh mục.
  const protocol = listing.protocolSnapshot || getProtocolForCategory(listing.categoryId);

  return { ...listing, category, hirer, looker, job, protocol };
}

/** Tất cả tin đang mở, kèm chi tiết, sắp theo mức khẩn rồi thời điểm đăng. */
export function getOpenListingDetails() {
  return LISTINGS.filter((l) => l.status === LISTING_STATUS.OPEN)
    .map((l) => getListingDetail(l.id))
    .sort((a, b) => {
      if (a.urgent !== b.urgent) return a.urgent ? -1 : 1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
}

/** Tin đã giao cho một người nhận việc, kèm chi tiết. */
export function getListingDetailsByLooker(lookerId) {
  return LISTINGS.filter((l) => l.assignedTo === lookerId).map((l) => getListingDetail(l.id));
}

/** Tin do một người đăng tạo, kèm chi tiết và trạng thái nộp. */
export function getListingDetailsByHirer(hirerId) {
  return LISTINGS.filter((l) => l.hirerId === hirerId)
    .map((l) => {
      const detail = getListingDetail(l.id);
      return { ...detail, submission: getSubmissionByListing(l.id) };
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

/** Kết quả nộp kèm tin, người nhận việc, người đăng. */
export function getSubmissionDetail(submissionId) {
  const sub = SUBMISSIONS.find((s) => s.id === submissionId);
  if (!sub) return null;

  const listing = getListingDetail(sub.listingId);
  const looker = getUserById(sub.lookerId);
  const hirer = getUserById(sub.hirerId);

  return { ...sub, listing, looker, hirer, protocol: listing?.protocol };
}

/** Hàng đợi duyệt nội bộ, kèm chi tiết — sắp cũ nhất trước. */
export function getQaQueueDetails() {
  return SUBMISSIONS.filter((s) => s.qaStatus === QA_STATUS.PENDING)
    .map((s) => getSubmissionDetail(s.id))
    .sort((a, b) => new Date(a.submittedAt) - new Date(b.submittedAt));
}

/** Kết quả chờ người đăng xác nhận. */
export function getAwaitingHirerDetails(hirerId = null) {
  return SUBMISSIONS.filter(
    (s) =>
      s.hirerStatus === HIRER_STATUS.PENDING &&
      (s.qaStatus === QA_STATUS.PASSED || s.qaStatus === QA_STATUS.NOT_REQUIRED) &&
      (!hirerId || s.hirerId === hirerId)
  )
    .map((s) => getSubmissionDetail(s.id))
    .sort((a, b) => new Date(a.submittedAt) - new Date(b.submittedAt));
}

/**
 * Tin thuộc một đơn gom, kèm trạng thái từng tin.
 * Dùng cho màn chi tiết đơn gom của người đăng.
 */
export function getJobDetail(jobId) {
  const job = getJobById(jobId);
  if (!job) return null;

  const listings = LISTINGS.filter((l) => l.jobId === jobId).map((l) => ({
    ...getListingDetail(l.id),
    submission: getSubmissionByListing(l.id),
  }));

  return {
    ...job,
    listings,
    category: getCategoryById(job.categoryId),
    hirer: getUserById(job.hirerId),
    progress: job.listingCount ? Math.round((job.completedCount / job.listingCount) * 100) : 0,
  };
}

/** Ví kèm chủ sở hữu. */
export function getWalletDetail(ownerId) {
  const wallet = getWalletByOwner(ownerId);
  return wallet ? { ...wallet, owner: getUserById(ownerId) } : null;
}

/**
 * Khoảng cách từ một mốc tới địa điểm tin, đơn vị km.
 * `origin` mặc định là vị trí demo ở trung tâm TP.HCM.
 */
export const DEMO_ORIGIN = { lat: 10.7769, lng: 106.7009 };

export function getListingDistance(listing, origin = DEMO_ORIGIN) {
  if (!listing?.location?.lat || !listing?.location?.lng) return null;
  return haversineKm(origin, { lat: listing.location.lat, lng: listing.location.lng });
}

/** Tin đang mở kèm khoảng cách tới người xem. */
export function getOpenListingsWithDistance(origin = DEMO_ORIGIN) {
  return getOpenListingDetails()
    .map((l) => ({ ...l, distanceKm: getListingDistance(l, origin) }))
    .sort((a, b) => (a.distanceKm ?? 1e9) - (b.distanceKm ?? 1e9));
}

/** Người nhận việc đang chờ duyệt hồ sơ định danh. */
export function getPendingKycLookers() {
  return USERS.filter(
    (u) => u.role === ROLE.LOOKER && u.kyc.status === KYC_STATUS.PENDING_REVIEW
  );
}

/** Danh mục kèm nghi thức — dùng cho màn CMS và màn đăng tin. */
export function getCategoryWithProtocol(categoryId) {
  const category = getCategoryById(categoryId);
  if (!category) return null;
  return { ...category, protocol: getProtocolForCategory(categoryId) };
}

export { CATEGORIES, USERS };
