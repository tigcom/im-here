/**
 * TIN ĐĂNG — đơn vị công việc của nền tảng.
 *
 * Mỗi tin ứng với MỘT địa điểm. Việc ở nhiều điểm thì gom nhiều tin vào một Đơn gom.
 *
 * Mỗi tin mang theo `protocolSnapshot` — bản sao nghi thức tại thời điểm đăng.
 * Nhờ vậy admin sửa định nghĩa danh mục về sau KHÔNG làm đổi nghĩa các tin đã đăng.
 *
 * Chú ý sự khác biệt giữa hai loại tin trong file này:
 *   • Việc đơn giản (LIST-9001…) — `requirements` chỉ là vài câu hỏi của người đăng,
 *     không GPS, không bước chụp, không duyệt nội bộ.
 *   • Việc kiểm định (LIST-8801…) — `requirements` là danh sách bước chụp + câu hỏi,
 *     nghi thức bật GPS và duyệt nội bộ.
 */

import { LISTING_STATUS, REQ_TYPE } from '../constants';
import { getProtocolForCategory } from './categories';

/** Lấy bản sao nghi thức của danh mục để nhúng vào tin lúc đăng. */
const snap = (categoryId) => ({ ...getProtocolForCategory(categoryId) });

export const LISTINGS = [
  // ═══════════════════════════════════════════════════════════════════════
  // VIỆC ĐƠN GIẢN — do cá nhân đăng (Nguyễn Thị Lan)
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: 'LIST-9001',
    jobId: null,
    hirerId: 'USR-CL-8803',
    categoryId: 'CAT-MARKET',
    protocolSnapshot: snap('CAT-MARKET'),
    title: 'Mua 2kg thịt heo và rau củ ở chợ Bến Thành',
    description:
      'Nhờ mua giúp 2kg thịt heo xay và 1 bó rau muống ở chợ Bến Thành. Tôi gửi tiền hàng trước qua ví, bạn chỉ cần mua và mang tới nhà giúp tôi ở đường Nguyễn Thông, Quận 3. Nhớ lấy hoá đơn hoặc chụp ảnh cân thịt.',
    location: {
      address: 'Chợ Bến Thành, Lê Lợi, Phường Bến Thành, Quận 1, TP.HCM',
      province: 'TP. Hồ Chí Minh',
      district: 'Quận 1',
      ward: 'Bến Thành',
      lat: 10.7725,
      lng: 106.698,
      note: 'Cổng số 3 hướng đường Lê Thợ Nhuộm',
    },
    reward: 60000,
    requirements: [
      { id: 'REQ-9001-1', order: 1, type: REQ_TYPE.CHECKBOX, title: 'Bạn đã hiểu đúng loại thịt cần mua chưa?', required: true },
      { id: 'REQ-9001-2', order: 2, type: REQ_TYPE.PHOTO, title: 'Chụp ảnh cân thịt hoặc hoá đơn', required: false },
    ],
    status: LISTING_STATUS.OPEN,
    assignedTo: null,
    claimedAt: null,
    deadlineAt: '2026-10-12T18:00:00+07:00',
    expiresAt: '2026-10-12T15:00:00+07:00',
    urgent: false,
    createdAt: '2026-10-12T08:40:00+07:00',
  },
  {
    id: 'LIST-9002',
    jobId: null,
    hirerId: 'USR-CL-8803',
    categoryId: 'CAT-QUEUE',
    protocolSnapshot: snap('CAT-QUEUE'),
    title: 'Xếp hàng mua 2 vé xem phim ở CGV Vincom Đồng Khởi',
    description:
      'Suất chiếu 19:30 tối nay. Nhờ bạn tới sớm xếp hàng mua 2 vé ghế giữa. Tôi sẽ chuyển tiền vé trước. Bạn chỉ cần xếp hàng và nhận vé.',
    location: {
      address: 'CGV Vincom Đồng Khởi, 72 Lê Thánh Tôn, Quận 1, TP.HCM',
      province: 'TP. Hồ Chí Minh',
      district: 'Quận 1',
      ward: 'Bến Nghé',
      lat: 10.7781,
      lng: 106.7043,
      note: 'Quầy vé tầng 4',
    },
    reward: 50000,
    requirements: [
      { id: 'REQ-9002-1', order: 1, type: REQ_TYPE.CHOICE, title: 'Bạn có thể tới trước 19:00 không?', options: ['Có', 'Không'], required: true },
      { id: 'REQ-9002-2', order: 2, type: REQ_TYPE.PHOTO, title: 'Chụp ảnh vé sau khi mua', required: false },
    ],
    status: LISTING_STATUS.OPEN,
    assignedTo: null,
    claimedAt: null,
    deadlineAt: '2026-10-12T19:30:00+07:00',
    expiresAt: '2026-10-12T18:30:00+07:00',
    urgent: true,
    createdAt: '2026-10-12T10:05:00+07:00',
  },
  {
    id: 'LIST-9003',
    jobId: null,
    hirerId: 'USR-CL-8803',
    categoryId: 'CAT-WATCH',
    protocolSnapshot: snap('CAT-WATCH'),
    title: 'Trông mèo 2 ngày khi tôi đi công tác',
    description:
      'Tôi đi công tác 2 ngày, nhờ bạn tới cho mèo ăn sáng và tối, thay nước và dọn khay cát. Nhà ở chung cư, có khoá cửa giao lại. Bé mèo tên Miu, khá nhát nhưng không cắn.',
    location: {
      address: 'Chung cư Sunrise City, Nguyễn Hữu Thọ, Quận 7, TP.HCM',
      province: 'TP. Hồ Chí Minh',
      district: 'Quận 7',
      ward: 'Tân Hưng',
      lat: 10.7295,
      lng: 106.7215,
      note: 'Toà B, tầng 12',
    },
    reward: 300000,
    requirements: [
      { id: 'REQ-9003-1', order: 1, type: REQ_TYPE.CHECKBOX, title: 'Bạn đã từng chăm thú cưng chưa?', required: true },
      { id: 'REQ-9003-2', order: 2, type: REQ_TYPE.PHOTO, title: 'Chụp ảnh mèo mỗi lần cho ăn', required: false },
    ],
    status: LISTING_STATUS.OPEN,
    assignedTo: null,
    claimedAt: null,
    deadlineAt: '2026-10-14T20:00:00+07:00',
    expiresAt: '2026-10-13T08:00:00+07:00',
    urgent: false,
    createdAt: '2026-10-11T16:30:00+07:00',
  },
  {
    id: 'LIST-9004',
    jobId: null,
    hirerId: 'USR-CL-8803',
    categoryId: 'CAT-FOOD',
    protocolSnapshot: snap('CAT-FOOD'),
    title: 'Mua 2 ly cà phê sữa đá ở Landmark 81',
    description: 'Nhờ mua 2 ly cà phê sữa đá ở quán tầng trệt Landmark 81, mang lên tầng 20 toà nhà bên cạnh.',
    location: {
      address: 'Landmark 81, Vinhomes Central Park, Bình Thạnh, TP.HCM',
      province: 'TP. Hồ Chí Minh',
      district: 'Bình Thạnh',
      ward: '22',
      lat: 10.7951,
      lng: 106.7218,
      note: '',
    },
    reward: 40000,
    requirements: [
      { id: 'REQ-9004-1', order: 1, type: REQ_TYPE.TEXT, title: 'Bạn đang ở gần khu vực này chứ?', required: true },
    ],
    status: LISTING_STATUS.ASSIGNED,
    assignedTo: 'USR-LK-9921',
    claimedAt: '2026-10-12T11:10:00+07:00',
    deadlineAt: '2026-10-12T12:15:00+07:00',
    expiresAt: '2026-10-12T11:45:00+07:00',
    urgent: true,
    createdAt: '2026-10-12T11:00:00+07:00',
  },
  {
    id: 'LIST-9005',
    jobId: null,
    hirerId: 'USR-CL-8803',
    categoryId: 'CAT-PICKUP',
    protocolSnapshot: snap('CAT-PICKUP'),
    title: 'Nhận bưu kiện ở bưu cục Giao Hàng Tiết Kiệm Quận 1',
    description:
      'Có một bưu kiện nhỏ đang giữ ở bưu cục. Nhờ bạn tới nhận giúp với mã vận đơn tôi sẽ gửi, rồi mang lại nhà tôi ở Quận 3.',
    location: {
      address: 'Bưu cục GHTK, 45 Nguyễn Thị Minh Khai, Quận 1, TP.HCM',
      province: 'TP. Hồ Chí Minh',
      district: 'Quận 1',
      ward: 'Đa Kao',
      lat: 10.7832,
      lng: 106.6965,
      note: 'Giờ mở cửa 8:00–18:00',
    },
    reward: 45000,
    requirements: [
      { id: 'REQ-9005-1', order: 1, type: REQ_TYPE.TEXT, title: 'Bạn có CMND/CCCD để nhận hàng không?', required: true },
    ],
    status: LISTING_STATUS.OPEN,
    assignedTo: null,
    claimedAt: null,
    deadlineAt: '2026-10-12T17:00:00+07:00',
    expiresAt: '2026-10-12T15:30:00+07:00',
    urgent: false,
    createdAt: '2026-10-12T09:20:00+07:00',
  },

  // ═══════════════════════════════════════════════════════════════════════
  // VIỆC KIỂM ĐỊNH — do doanh nghiệp đăng (Heineken)
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: 'LIST-8801',
    jobId: 'JOB-2026-01',
    hirerId: 'USR-CL-8802',
    categoryId: 'CAT-RETAIL-AUDIT',
    protocolSnapshot: snap('CAT-RETAIL-AUDIT'),
    title: 'Kiểm toán trưng bày tại WinMart+ Hoàng Diệu',
    description:
      'Ghi nhận tình trạng trưng bày sản phẩm tại kệ nước giải khát. Chụp đủ ảnh theo yêu cầu và trả lời bảng câu hỏi.',
    location: {
      address: '142 Hoàng Diệu, Phường 9, Quận 4, TP.HCM',
      province: 'TP. Hồ Chí Minh',
      district: 'Quận 4',
      ward: '9',
      lat: 10.76211,
      lng: 106.70258,
      note: 'Kệ nước giải khát dãy giữa, gần quầy thu ngân',
    },
    reward: 85000,
    requirements: [
      { id: 'REQ-8801-1', order: 1, type: REQ_TYPE.PHOTO, title: 'Chụp góc rộng toàn cảnh kệ nước giải khát (chính diện)', required: true },
      { id: 'REQ-8801-2', order: 2, type: REQ_TYPE.PHOTO, title: 'Chụp cận cảnh biển giá khuyến mãi & hạn sử dụng lốc 6 lon', required: true },
      { id: 'REQ-8801-3', order: 3, type: REQ_TYPE.NUMBER, title: 'Đếm và nhập số lượng sản phẩm đang trưng bày', required: true },
      { id: 'REQ-8801-4', order: 4, type: REQ_TYPE.CHOICE, title: 'Có tình trạng hết hàng trên kệ không?', options: ['Có', 'Không'], required: true },
    ],
    status: LISTING_STATUS.SUBMITTED,
    assignedTo: 'USR-LK-9921',
    claimedAt: '2026-10-12T08:50:00+07:00',
    deadlineAt: '2026-10-12T13:00:00+07:00',
    expiresAt: '2026-10-12T12:00:00+07:00',
    urgent: true,
    createdAt: '2026-10-10T09:00:00+07:00',
  },
  {
    id: 'LIST-8802',
    jobId: 'JOB-2026-01',
    hirerId: 'USR-CL-8802',
    categoryId: 'CAT-RETAIL-AUDIT',
    protocolSnapshot: snap('CAT-RETAIL-AUDIT'),
    title: 'Kiểm toán trưng bày tại WinMart+ Lê Thánh Tôn',
    description: 'Cùng quy trình kiểm toán trưng bày, điểm bán thứ hai trong đợt khảo sát.',
    location: {
      address: '22 Lê Thánh Tôn, Bến Nghé, Quận 1, TP.HCM',
      province: 'TP. Hồ Chí Minh',
      district: 'Quận 1',
      ward: 'Bến Nghé',
      lat: 10.77908,
      lng: 106.70359,
      note: '',
    },
    reward: 85000,
    requirements: [
      { id: 'REQ-8802-1', order: 1, type: REQ_TYPE.PHOTO, title: 'Chụp góc rộng toàn cảnh kệ nước giải khát', required: true },
      { id: 'REQ-8802-2', order: 2, type: REQ_TYPE.PHOTO, title: 'Chụp cận cảnh biển giá khuyến mãi', required: true },
      { id: 'REQ-8802-3', order: 3, type: REQ_TYPE.NUMBER, title: 'Số lượng sản phẩm trưng bày', required: true },
      { id: 'REQ-8802-4', order: 4, type: REQ_TYPE.CHOICE, title: 'Có tình trạng hết hàng không?', options: ['Có', 'Không'], required: true },
    ],
    status: LISTING_STATUS.SUBMITTED,
    assignedTo: 'USR-LK-9922',
    claimedAt: '2026-10-12T09:35:00+07:00',
    deadlineAt: '2026-10-12T14:00:00+07:00',
    expiresAt: '2026-10-12T13:00:00+07:00',
    urgent: false,
    createdAt: '2026-10-10T09:05:00+07:00',
  },
  {
    id: 'LIST-8803',
    jobId: 'JOB-2026-02',
    hirerId: 'USR-CL-8802',
    categoryId: 'CAT-ADDRESS-VERIFY',
    protocolSnapshot: snap('CAT-ADDRESS-VERIFY'),
    title: 'Xác minh địa chỉ cư trú tại 58/12 Nguyễn Thông',
    description:
      'Xác nhận người vay có thường trú tại địa chỉ khai báo. Chụp biển số nhà, mặt tiền và không gian bên trong.',
    location: {
      address: '58/12 Nguyễn Thông, Phường Võ Thị Sáu, Quận 3, TP.HCM',
      province: 'TP. Hồ Chí Minh',
      district: 'Quận 3',
      ward: 'Võ Thị Sáu',
      lat: 10.782,
      lng: 106.685,
      note: 'Hẻm 58, đi thẳng vào khoảng 50m',
    },
    reward: 120000,
    requirements: [
      { id: 'REQ-8803-1', order: 1, type: REQ_TYPE.PHOTO, title: 'Chụp biển số nhà & bảng hiệu cửa hàng mặt tiền', required: true },
      { id: 'REQ-8803-2', order: 2, type: REQ_TYPE.PHOTO, title: 'Chụp không gian bên trong nhà', required: true },
      { id: 'REQ-8803-3', order: 3, type: REQ_TYPE.CHOICE, title: 'Người vay có đang thường trú tại đây?', options: ['Có', 'Không', 'Không liên hệ được'], required: true },
    ],
    status: LISTING_STATUS.OPEN,
    assignedTo: null,
    claimedAt: null,
    deadlineAt: '2026-10-13T17:00:00+07:00',
    expiresAt: '2026-10-13T12:00:00+07:00',
    urgent: false,
    createdAt: '2026-10-11T14:00:00+07:00',
  },
  {
    id: 'LIST-8804',
    jobId: null,
    hirerId: 'USR-CL-8802',
    categoryId: 'CAT-ASSET-CHECK',
    protocolSnapshot: snap('CAT-ASSET-CHECK'),
    title: 'Xác minh hiện trạng xe VinFast VF8 thế chấp',
    description:
      'Xe đang để tại hầm toà nhà. Cần xác minh xe còn nguyên hiện trạng, chụp số khung, số máy và đồng hồ ODO.',
    location: {
      address: 'Hầm B2 Tòa Lancaster, 22 Lê Thánh Tôn, Bến Nghé, Quận 1',
      province: 'TP. Hồ Chí Minh',
      district: 'Quận 1',
      ward: 'Bến Nghé',
      lat: 10.77908,
      lng: 106.70359,
      note: 'Liên hệ bảo vệ hầm để được vào',
    },
    reward: 180000,
    requirements: [
      { id: 'REQ-8804-1', order: 1, type: REQ_TYPE.PHOTO, title: 'Chụp biển số xe + tem kiểm định kính chắn gió', required: true },
      { id: 'REQ-8804-2', order: 2, type: REQ_TYPE.PHOTO, title: 'Chụp đồng hồ ODO hiển thị số km', required: true },
      { id: 'REQ-8804-3', order: 3, type: REQ_TYPE.PHOTO, title: 'Chụp 4 góc thân xe', required: true },
      { id: 'REQ-8804-4', order: 4, type: REQ_TYPE.NUMBER, title: 'Số km trên đồng hồ ODO', required: true },
      { id: 'REQ-8804-5', order: 5, type: REQ_TYPE.CHOICE, title: 'Xe có hư hỏng, trầy xước gì không?', options: ['Không', 'Có (ghi chú bên dưới)'], required: true },
    ],
    status: LISTING_STATUS.OPEN,
    assignedTo: null,
    claimedAt: null,
    deadlineAt: '2026-10-13T18:00:00+07:00',
    expiresAt: '2026-10-13T12:00:00+07:00',
    urgent: true,
    createdAt: '2026-10-11T15:30:00+07:00',
  },

  // ═══════════════════════════════════════════════════════════════════════
  // ĐÃ HOÀN THÀNH — dùng cho màn "Tin đã làm" của người nhận việc
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: 'LIST-8790',
    jobId: null,
    hirerId: 'USR-CL-8803',
    categoryId: 'CAT-MARKET',
    protocolSnapshot: snap('CAT-MARKET'),
    title: 'Mua đồ ăn sáng ở chợ Bà Chiểu',
    description: 'Mua giúp bánh mì và xôi cho 4 người, giao tới văn phòng ở Quận 1.',
    location: {
      address: 'Chợ Bà Chiểu, Bình Thạnh, TP.HCM',
      province: 'TP. Hồ Chí Minh',
      district: 'Bình Thạnh',
      ward: '1',
      lat: 10.8035,
      lng: 106.6987,
      note: '',
    },
    reward: 55000,
    requirements: [
      { id: 'REQ-8790-1', order: 1, type: REQ_TYPE.CHECKBOX, title: 'Bạn đã nắm danh sách món cần mua?', required: true },
      { id: 'REQ-8790-2', order: 2, type: REQ_TYPE.PHOTO, title: 'Chụp ảnh hoá đơn', required: false },
    ],
    status: LISTING_STATUS.COMPLETED,
    assignedTo: 'USR-LK-9921',
    claimedAt: '2026-10-11T06:30:00+07:00',
    deadlineAt: '2026-10-11T08:00:00+07:00',
    expiresAt: '2026-10-11T07:30:00+07:00',
    urgent: false,
    createdAt: '2026-10-11T06:00:00+07:00',
  },
  {
    id: 'LIST-8785',
    jobId: null,
    hirerId: 'USR-CL-8802',
    categoryId: 'CAT-ASSET-CHECK',
    protocolSnapshot: snap('CAT-ASSET-CHECK'),
    title: 'Xác minh hiện trạng nhà phố thế chấp tại Quận 7',
    description: 'Xác minh nhà phố 4 tầng còn nguyên hiện trạng, chụp mặt tiền và tình trạng bên trong.',
    location: {
      address: '215 Nguyễn Thị Thập, Tân Phú, Quận 7, TP.HCM',
      province: 'TP. Hồ Chí Minh',
      district: 'Quận 7',
      ward: 'Tân Phú',
      lat: 10.7385,
      lng: 106.7225,
      note: '',
    },
    reward: 220000,
    requirements: [
      { id: 'REQ-8785-1', order: 1, type: REQ_TYPE.PHOTO, title: 'Chụp mặt tiền căn nhà', required: true },
      { id: 'REQ-8785-2', order: 2, type: REQ_TYPE.PHOTO, title: 'Chụp từng tầng bên trong', required: true },
      { id: 'REQ-8785-3', order: 3, type: REQ_TYPE.CHOICE, title: 'Nhà có dấu hiệu bỏ trống không?', options: ['Không', 'Có'], required: true },
    ],
    status: LISTING_STATUS.COMPLETED,
    assignedTo: 'USR-LK-9921',
    claimedAt: '2026-10-10T14:00:00+07:00',
    deadlineAt: '2026-10-10T17:00:00+07:00',
    expiresAt: '2026-10-10T16:00:00+07:00',
    urgent: false,
    createdAt: '2026-10-10T13:00:00+07:00',
  },
];

// ── Truy vấn ───────────────────────────────────────────────────────────────

export function getListingById(id) {
  return LISTINGS.find((l) => l.id === id) || null;
}

/** Tin đang mở cho người nhận việc — ai cũng nhận được. */
export function getOpenListings() {
  return LISTINGS.filter((l) => l.status === LISTING_STATUS.OPEN);
}

export function getListingsByHirer(hirerId) {
  return LISTINGS.filter((l) => l.hirerId === hirerId);
}

export function getListingsByLooker(lookerId) {
  return LISTINGS.filter((l) => l.assignedTo === lookerId);
}

export function getListingsByJob(jobId) {
  return LISTINGS.filter((l) => l.jobId === jobId);
}

/** Tin chờ người đăng xác nhận. */
export function getListingsAwaitingHirer() {
  return LISTINGS.filter((l) => l.status === LISTING_STATUS.SUBMITTED);
}
