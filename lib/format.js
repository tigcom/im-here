/**
 * TIỆN ÍCH ĐỊNH DẠNG
 *
 * Quy ước toàn nền tảng:
 *   • Tiền lưu dưới dạng SỐ NGUYÊN VNĐ — không bao giờ lưu chuỗi '85.000đ'.
 *   • Ngày lưu dưới dạng ISO 8601 — không bao giờ lưu '12/10/2026 • 09:24'.
 *
 * Định dạng chỉ diễn ra lúc hiển thị, qua các hàm dưới đây.
 */

/** 85000 → "85.000đ" */
export function formatVnd(amount) {
  if (amount === null || amount === undefined || Number.isNaN(Number(amount))) return '—';
  return `${Number(amount).toLocaleString('vi-VN')}đ`;
}

/** 85000 → "85.000" (không có ký hiệu tiền) */
export function formatNumber(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '—';
  return Number(value).toLocaleString('vi-VN');
}

/** "2026-10-12T09:24:15Z" → "12/10/2026" */
export function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

/** "2026-10-12T09:24:15Z" → "12/10/2026 • 09:24" */
export function formatDateTime(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} • ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/**
 * Khoảng thời gian tương đối so với MỐC CỐ ĐỊNH của bản demo.
 *
 * Lưu ý: bản demo không dùng `Date.now()` để giữ kết quả ổn định giữa các lần
 * render (tránh hydration mismatch). Mốc thời gian lấy từ `DEMO_NOW`.
 */
export const DEMO_NOW = '2026-10-12T11:30:00+07:00';

export function formatRelative(iso, now = DEMO_NOW) {
  if (!iso) return '—';
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return '—';
  const diffMin = Math.round((new Date(now).getTime() - t) / 60000);

  if (diffMin < 1) return 'vừa xong';
  if (diffMin < 60) return `${diffMin} phút trước`;
  const diffHour = Math.round(diffMin / 60);
  if (diffHour < 24) return `${diffHour} giờ trước`;
  const diffDay = Math.round(diffHour / 24);
  if (diffDay < 30) return `${diffDay} ngày trước`;
  return formatDate(iso);
}

/**
 * Khoảng cách từ một ISO tương lai tới DEMO_NOW → "còn 45 phút".
 * Dùng cho hạn nhận việc.
 */
export function formatTimeLeft(iso, now = DEMO_NOW) {
  if (!iso) return '—';
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return '—';
  const diffMin = Math.round((t - new Date(now).getTime()) / 60000);
  if (diffMin <= 0) return 'đã hết hạn';
  if (diffMin < 60) return `còn ${diffMin} phút`;
  const h = Math.floor(diffMin / 60);
  const m = diffMin % 60;
  return m ? `còn ${h} giờ ${m} phút` : `còn ${h} giờ`;
}

/** Thêm phút vào một mốc ISO → ISO mới. Dùng khi tạo dữ liệu mẫu. */
export function addMinutes(iso, minutes) {
  return new Date(new Date(iso).getTime() + minutes * 60000).toISOString();
}

/** 0.42 (km) → "0.4 km" */
export function formatDistance(km) {
  if (km === null || km === undefined) return '—';
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

/** 68 → "1 giờ 8 phút" (dùng cho SLA / thời lượng ước tính) */
export function formatDuration(minutes) {
  if (minutes === null || minutes === undefined) return '—';
  if (minutes < 60) return `${minutes} phút`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h} giờ ${m} phút` : `${h} giờ`;
}

/**
 * Khoảng cách đường chim bay giữa hai toạ độ, đơn vị km.
 * Dùng để tính "cách bạn bao xa" từ vị trí demo tới địa điểm tin đăng.
 */
export function haversineKm(a, b) {
  if (!a?.lat || !a?.lng || !b?.lat || !b?.lng) return null;
  const R = 6371;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Làm tròn số sao: 4.96 → "4.96", chưa có đánh giá hoặc 0 → "—" */
export function formatRating(rating) {
  if (rating === null || rating === undefined || Number(rating) === 0 || Number.isNaN(Number(rating))) return '—';
  return Number(rating).toFixed(2);
}

/** Chuẩn hoá số điện thoại để so khớp: bỏ khoảng trắng và dấu chấm. */
export function normalizePhone(phone) {
  return String(phone || '').replace(/[\s.\-()]/g, '');
}
