/**
 * ĐIỂM VÀO DUY NHẤT CỦA TẦNG DỮ LIỆU
 *
 * Mọi màn hình import từ `@/lib/data`, KHÔNG khai báo mảng mock riêng.
 * Đó là cách chấm dứt tình trạng 10/12 file tự có bản sao dữ liệu mâu thuẫn nhau.
 *
 * LƯU Ý VỀ BẢN DEMO: dữ liệu là tĩnh. Thao tác (nhận việc, duyệt, nạp quỹ)
 * chỉ đổi state cục bộ trong trang và KHÔNG tồn tại sau khi rời trang.
 * Đây là giới hạn đã biết của bản demo — cần backend để khắc phục.
 */

export * from './users';
export * from './categories';
export * from './jobs';
export * from './listings';
export * from './submissions';
export * from './fraud';
export * from './finance';
export * from './notifications';
export * from './analytics';
