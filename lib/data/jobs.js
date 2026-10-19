/**
 * ĐƠN GOM — container tuỳ chọn khi gom nhiều tin vào một đợt.
 *
 * Một tin lẻ (đi chợ dùm) KHÔNG cần đơn gom. Đơn gom chỉ dùng khi người đăng
 * cần giao cùng một loại việc tại nhiều địa điểm (ví dụ: kiểm toán 120 điểm bán).
 *
 * Đây là thứ thay cho khái niệm "chiến dịch" trước đây.
 */

import { JOB_STATUS } from '../constants';

export const JOBS = [
  {
    id: 'JOB-2026-01',
    hirerId: 'USR-CL-8802',
    categoryId: 'CAT-RETAIL-AUDIT',
    title: 'Kiểm toán trưng bày bia tại chuỗi siêu thị TP.HCM',
    description:
      'Chụp ảnh và ghi nhận tình trạng trưng bày sản phẩm tại 120 điểm bán thuộc chuỗi WinMart+ và Co.op Food trên địa bàn TP.HCM.',
    areas: [
      { province: 'TP. Hồ Chí Minh', district: 'Quận 1' },
      { province: 'TP. Hồ Chí Minh', district: 'Quận 3' },
      { province: 'TP. Hồ Chí Minh', district: 'Quận 4' },
      { province: 'TP. Hồ Chí Minh', district: 'Quận 7' },
    ],
    status: JOB_STATUS.ACTIVE,
    listingCount: 120,
    completedCount: 108,
    budgetTotal: 10200000,
    budgetSpent: 9180000,
    escrowHeld: 1020000,
    slaMinutes: 240,
    startAt: '2026-10-10T00:00:00+07:00',
    endAt: '2026-10-20T23:59:00+07:00',
    createdAt: '2026-10-08T14:00:00+07:00',
  },
  {
    id: 'JOB-2026-02',
    hirerId: 'USR-CL-8802',
    categoryId: 'CAT-ADDRESS-VERIFY',
    title: 'Xác minh địa chỉ cư trú cho hồ sơ vay tiêu dùng',
    description:
      'Đến tận nơi xác nhận sự hiện diện của người vay tại địa chỉ khai báo, chụp ảnh biển số nhà và mặt tiền.',
    areas: [
      { province: 'TP. Hồ Chí Minh', district: 'Bình Thạnh' },
      { province: 'TP. Hồ Chí Minh', district: 'Phú Nhuận' },
    ],
    status: JOB_STATUS.ACTIVE,
    listingCount: 40,
    completedCount: 26,
    budgetTotal: 4800000,
    budgetSpent: 3120000,
    escrowHeld: 1680000,
    slaMinutes: 480,
    startAt: '2026-10-01T00:00:00+07:00',
    endAt: '2026-10-25T23:59:00+07:00',
    createdAt: '2026-09-28T10:00:00+07:00',
  },
  {
    id: 'JOB-2026-03',
    hirerId: 'USR-CL-8802',
    categoryId: 'CAT-RETAIL-AUDIT',
    title: 'Khảo sát giá bán lẻ nước giải khát quý 3',
    description: 'Ghi nhận giá niêm yết của 8 sản phẩm tại các điểm bán lẻ toàn quốc.',
    areas: [
      { province: 'TP. Hồ Chí Minh', district: 'Toàn thành phố' },
      { province: 'Hà Nội', district: 'Toàn thành phố' },
    ],
    status: JOB_STATUS.COMPLETED,
    listingCount: 200,
    completedCount: 200,
    budgetTotal: 14000000,
    budgetSpent: 14000000,
    escrowHeld: 0,
    slaMinutes: 240,
    startAt: '2026-09-15T00:00:00+07:00',
    endAt: '2026-09-30T23:59:00+07:00',
    createdAt: '2026-09-12T09:00:00+07:00',
  },
];

export function getJobById(id) {
  return JOBS.find((j) => j.id === id) || null;
}

export function getJobsByHirer(hirerId) {
  return JOBS.filter((j) => j.hirerId === hirerId);
}
