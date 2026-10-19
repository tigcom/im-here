/**
 * DANH MỤC VIỆC + NGHI THỨC
 *
 * Đây là trái tim của nền tảng. Trong vận hành thật, admin tạo và sửa hai
 * thực thể này qua CMS (`/admin/categories`). File này là dữ liệu khởi tạo.
 *
 * NGHI THỨC quyết định một loại việc cần gì. Mọi cờ mặc định `false` —
 * nghĩa là việc đơn giản nhất (đi chợ dùm) không bắt GPS, không bắt bước chụp,
 * không qua duyệt nội bộ. Đó là cách "việc đơn giản thì đơn giản".
 */

import { CATEGORY_GROUP } from '../constants';

// ═══════════════════════════════════════════════════════════════════════════
// NGHI THỨC
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Nền tảng của mọi nghi thức — tắt hết.
 * Mọi nghi thức khác được dựng bằng cách bật thêm cờ.
 */
const PROTOCOL_BASE = {
  requireGps: false,
  gpsRadiusMeters: 200,
  requirePhoto: false,
  photoMinCount: 0,
  requireStepPhotos: false,
  requireAnswers: false,
  evidenceTypes: [],
  requireAdminReview: false,
  requireHirerApproval: true,
  minReward: 20000,
  maxReward: 500000,
  platformFeeRate: 0.1,
  slaMinutes: 240,
  allowMultiplePoints: false,
  version: 1,
  isActive: true,
};

export const PROTOCOLS = [
  {
    ...PROTOCOL_BASE,
    id: 'PRT-SIMPLE',
    name: 'Việc đơn giản',
    // Không bắt gì ngoài việc người đăng xác nhận đã xong.
    // Ảnh, nếu có, chỉ là biên nhận báo cáo kết quả.
    evidenceTypes: ['PHOTO', 'RECEIPT'],
    minReward: 20000,
    maxReward: 300000,
    slaMinutes: 180,
  },
  {
    ...PROTOCOL_BASE,
    id: 'PRT-DELIVERY',
    name: 'Giao nhận',
    requirePhoto: true,
    photoMinCount: 1,
    evidenceTypes: ['PHOTO', 'RECEIPT', 'SIGNATURE'],
    requireHirerApproval: true,
    minReward: 25000,
    maxReward: 400000,
    slaMinutes: 120,
  },
  {
    ...PROTOCOL_BASE,
    id: 'PRT-ASSIST',
    name: 'Phụ việc theo giờ',
    requireGps: true,
    gpsRadiusMeters: 300,
    evidenceTypes: ['NOTE'],
    minReward: 40000,
    maxReward: 500000,
    slaMinutes: 480,
  },
  {
    ...PROTOCOL_BASE,
    id: 'PRT-VERIFY',
    name: 'Kiểm định thực địa',
    // Đây là nghi thức "nặng" — ảnh LÀ sản phẩm, không phải biên nhận.
    requireGps: true,
    gpsRadiusMeters: 50,
    requirePhoto: true,
    photoMinCount: 2,
    requireStepPhotos: true,
    requireAnswers: true,
    evidenceTypes: ['PHOTO', 'VIDEO'],
    requireAdminReview: true,
    requireHirerApproval: true,
    minReward: 60000,
    maxReward: 500000,
    slaMinutes: 240,
    allowMultiplePoints: true,
    version: 4,
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// DANH MỤC
// ═══════════════════════════════════════════════════════════════════════════

export const CATEGORIES = [
  // ── Việc vặt ─────────────────────────────────────────────────────────────
  {
    id: 'CAT-MARKET',
    slug: 'di-cho-dum',
    name: 'Đi chợ dùm',
    group: CATEGORY_GROUP.ERRAND,
    icon: 'ShoppingBasket',
    description: 'Mua hộ thực phẩm, đồ dùng theo danh sách bạn gửi.',
    protocolId: 'PRT-SIMPLE',
    examples: ['Mua 2kg thịt heo ở chợ Bến Thành', 'Mua rau củ ở siêu thị gần nhà'],
    isActive: true,
    sortOrder: 10,
  },
  {
    id: 'CAT-QUEUE',
    slug: 'xep-hang',
    name: 'Xếp hàng mua hộ',
    group: CATEGORY_GROUP.ERRAND,
    icon: 'Users',
    description: 'Xếp hàng thay bạn — mua vé, làm thủ tục, lấy số thứ tự.',
    protocolId: 'PRT-SIMPLE',
    examples: ['Xếp hàng mua vé xem phim', 'Lấy số thứ tự ngân hàng'],
    isActive: true,
    sortOrder: 20,
  },
  {
    id: 'CAT-PICKUP',
    slug: 'nhan-gui-ho',
    name: 'Nhận / gửi hàng hộ',
    group: CATEGORY_GROUP.ERRAND,
    icon: 'Package',
    description: 'Nhận hộ bưu kiện, gửi đồ tại bưu cục hoặc điểm hẹn.',
    protocolId: 'PRT-SIMPLE',
    examples: ['Nhận bưu kiện ở bưu cục Quận 1', 'Gửi đồ cho người thân'],
    isActive: true,
    sortOrder: 30,
  },
  {
    id: 'CAT-FOOD',
    slug: 'mua-do-an',
    name: 'Mua hộ đồ ăn, thức uống',
    group: CATEGORY_GROUP.ERRAND,
    icon: 'Coffee',
    description: 'Mua và mang tới tận nơi đồ ăn, cà phê, trà sữa.',
    protocolId: 'PRT-SIMPLE',
    examples: ['Mua 2 ly cà phê sữa đá gần đó'],
    isActive: true,
    sortOrder: 40,
  },

  // ── Giao nhận ────────────────────────────────────────────────────────────
  {
    id: 'CAT-MOVE',
    slug: 'cho-do',
    name: 'Chở đồ / vận chuyển nhỏ',
    group: CATEGORY_GROUP.DELIVERY,
    icon: 'Truck',
    description: 'Chở đồ cồng kềnh trong nội thành bằng xe máy hoặc xe tải nhỏ.',
    protocolId: 'PRT-DELIVERY',
    examples: ['Chở tủ lạnh từ Quận 4 sang Quận 7'],
    isActive: true,
    sortOrder: 50,
  },
  {
    id: 'CAT-SHIP',
    slug: 'giao-hang',
    name: 'Giao hàng nội thành',
    group: CATEGORY_GROUP.DELIVERY,
    icon: 'Bike',
    description: 'Nhận hàng và giao tới địa chỉ trong cùng thành phố.',
    protocolId: 'PRT-DELIVERY',
    examples: ['Giao 5 đơn hàng ở Quận 3'],
    isActive: true,
    sortOrder: 60,
  },

  // ── Phụ việc ─────────────────────────────────────────────────────────────
  {
    id: 'CAT-WATCH',
    slug: 'trong-coi',
    name: 'Trông coi nhà / thú cưng',
    group: CATEGORY_GROUP.ASSIST,
    icon: 'Home',
    description: 'Trông nhà, cho thú cưng ăn, tưới cây khi bạn vắng.',
    protocolId: 'PRT-ASSIST',
    examples: ['Trông mèo 2 ngày khi tôi đi công tác'],
    isActive: true,
    sortOrder: 70,
  },
  {
    id: 'CAT-EVENT',
    slug: 'phu-su-kien',
    name: 'Phụ bưng bê / sự kiện',
    group: CATEGORY_GROUP.ASSIST,
    icon: 'UsersRound',
    description: 'Phụ bưng bê, dọn bàn, hỗ trợ sự kiện theo giờ.',
    protocolId: 'PRT-ASSIST',
    examples: ['Phụ bưng bê tiệc cưới 4 giờ'],
    isActive: true,
    sortOrder: 80,
  },
  {
    id: 'CAT-CLEAN',
    slug: 'don-dep',
    name: 'Dọn dẹp nhà cửa',
    group: CATEGORY_GROUP.ASSIST,
    icon: 'Sparkles',
    description: 'Dọn dẹp, lau chùi nhà cửa, văn phòng nhỏ.',
    protocolId: 'PRT-ASSIST',
    examples: ['Dọn dẹp căn hộ 60m²'],
    isActive: true,
    sortOrder: 90,
  },

  // ── Kiểm định ────────────────────────────────────────────────────────────
  {
    id: 'CAT-RETAIL-AUDIT',
    slug: 'kiem-toan-quay-ke',
    name: 'Kiểm toán quầy kệ',
    group: CATEGORY_GROUP.VERIFICATION,
    icon: 'Store',
    description:
      'Chụp ảnh và ghi nhận tình trạng trưng bày sản phẩm tại điểm bán. Ảnh là sản phẩm bàn giao.',
    protocolId: 'PRT-VERIFY',
    examples: ['Kiểm tra trưng bày sản phẩm tại chuỗi siêu thị'],
    isActive: true,
    sortOrder: 100,
  },
  {
    id: 'CAT-ASSET-CHECK',
    slug: 'tham-dinh-tai-san',
    name: 'Thẩm định tài sản',
    group: CATEGORY_GROUP.VERIFICATION,
    icon: 'Car',
    description:
      'Xác minh hiện trạng xe, nhà, mặt bằng theo yêu cầu thẩm định. Ảnh là sản phẩm bàn giao.',
    protocolId: 'PRT-VERIFY',
    examples: ['Xác minh hiện trạng xe thế chấp'],
    isActive: true,
    sortOrder: 110,
  },
  {
    id: 'CAT-ADDRESS-VERIFY',
    slug: 'xac-minh-dia-chi',
    name: 'Xác minh địa chỉ',
    group: CATEGORY_GROUP.VERIFICATION,
    icon: 'MapPinCheck',
    description:
      'Đến tận nơi xác nhận địa chỉ, người cư trú hoặc cơ sở kinh doanh. Ảnh là sản phẩm bàn giao.',
    protocolId: 'PRT-VERIFY',
    examples: ['Xác minh địa chỉ cư trú của người vay'],
    isActive: true,
    sortOrder: 120,
  },
];

// ── Truy vấn nhanh ─────────────────────────────────────────────────────────

/** Tìm danh mục theo id. */
export function getCategoryById(id) {
  return CATEGORIES.find((c) => c.id === id) || null;
}

/** Tìm nghi thức theo id. */
export function getProtocolById(id) {
  return PROTOCOLS.find((p) => p.id === id) || null;
}

/**
 * Nghi thức áp dụng cho một danh mục.
 * Luôn trả về object — nếu không tìm thấy, trả nghi thức đơn giản nhất.
 */
export function getProtocolForCategory(categoryId) {
  const cat = getCategoryById(categoryId);
  return (
    getProtocolById(cat?.protocolId) ||
    PROTOCOLS.find((p) => p.id === 'PRT-SIMPLE') ||
    PROTOCOL_BASE
  );
}

/** Danh mục đang bật, sắp theo sortOrder. */
export function getActiveCategories() {
  return CATEGORIES.filter((c) => c.isActive).sort((a, b) => a.sortOrder - b.sortOrder);
}

/** Danh mục theo nhóm. */
export function getCategoriesByGroup(group) {
  return getActiveCategories().filter((c) => c.group === group);
}

export { PROTOCOL_BASE };
