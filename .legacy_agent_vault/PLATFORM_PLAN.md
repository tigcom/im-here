# KẾ HOẠCH THIẾT KẾ NỀN TẢNG "IM-HERE" (Dự kiến)

Dự án phát triển nền tảng kết nối nhân lực thu thập dữ liệu và kiểm định thực địa (tương tự Shepper / WeGoLook), với ngôn ngữ thiết kế công nghệ, bảo mật và tài chính (cảm hứng từ 9Pay).

---

## 1. NGÔN NGỮ THIẾT KẾ TỔNG THỂ (Art Direction)

Lấy cảm hứng từ 9Pay (Fintech) nhưng được nâng cấp theo chuẩn giao diện cao cấp:
*   **Màu sắc:** Sử dụng hệ màu không gian `OKLCH`. 
    *   Màu chủ đạo (Primary): Xanh tín nhiệm (Trust Blue - tương tự 9Pay) hoặc Tím công nghệ (Deep Purple), nhưng điều chỉnh độ rực (chroma) để sang trọng hơn.
    *   Màu nền (Background): Trắng ngà hoặc Xám cực nhạt (`chroma ∈ [0.005, 0.018]`), kết hợp với nền tối (Dark mode) có phủ lớp noise mỏng (`opacity 0.015-0.045`) cho các khu vực điểm nhấn.
*   **Nghệ thuật Chữ (Typography):** 
    *   Phông chữ hiển thị (Display): `Clash Display` hoặc `Bricolage Grotesque` cho các tiêu đề lớn (Hero, Heading) mang tính hiện đại, mạnh mẽ.
    *   Phông chữ nội dung (Body): `Geist` hoặc `Satoshi` đảm bảo dễ đọc cho các luồng dữ liệu dày đặc.
*   **Bố cục (Layout):** Áp dụng lưới CSS Grid 12 cột bất đối xứng (VD: 7/5 hoặc 8/4) để phá vỡ sự rập khuôn. Khoảng cách (padding) sẽ có nhịp điệu `lặng -> nén` rõ ràng để điều hướng mắt người dùng.
*   **Chất liệu bề mặt:** Sử dụng bóng đổ đa tầng (spread âm) và viền nội giáng (inner shadow) tinh tế cho các thẻ thông tin (cards) và nút bấm (buttons) thay vì bóng đổ đơn thuần, tạo cảm giác app thực tế.

---

## 2. PHÂN HỆ 1: WEBSITE GIỚI THIỆU (B2B & B2C LANDING PAGE)

Đây là "bộ mặt" của dự án, nhằm thuyết phục doanh nghiệp sử dụng dịch vụ và thu hút cộng tác viên tải app tham gia mạng lưới.

**01 — HERO SECTION (Màn hình đầu tiên)**
*   **Cấu trúc Lưới 7/5:** 
    *   Bên trái (7 cột): Tiêu đề (Headline) cực lớn (Dùng hàm `clamp()` tối đa 7 từ): *"Dữ liệu thực địa chuẩn xác. Kích hoạt trong vài phút."* (Ví dụ). Sub-heading ngắn gọn. Cụm nút CTA kép: "Dành cho Doanh nghiệp" & "Trở thành Đối tác".
    *   Bên phải (5 cột): Hình ảnh trực quan (Mockup app điện thoại của cộng tác viên đặt chồng lên màn hình dashboard của doanh nghiệp), sử dụng hiệu ứng lơ lửng nhẹ và thị giác nổi 3D.
*   **Hiệu ứng:** Scroll-trigger nhẹ nhàng, áp dụng lenis smooth scroll.

**02 — SOCIAL PROOF & METRICS (Bảo chứng niềm tin)**
*   Dải logo khách hàng/đối tác chạy ngang màn hình (Infinite marquee).
*   Chỉ số ấn tượng: "50,000+ Cộng tác viên", "63 Tỉnh thành", "Dữ liệu trả về sau <24h".

**03 — B2B SOLUTIONS (Giải pháp cho Doanh nghiệp)**
*   Tránh chia cột 3 đều đặn. Sử dụng lưới bất đối xứng hoặc dạng danh sách cuộn dính (Pin & Scrub scroll).
*   Các giải pháp chính (như WeGoLook / Shepper):
    *   *Kiểm định Tích sản (Asset Inspection):* Xe cộ, bất động sản.
    *   *Khảo sát Bán lẻ (Retail Audit):* Chụp ảnh quầy kệ, kiểm tra hàng tồn.
    *   *Xác minh Danh tính & Địa chỉ (KYC/Address Verification).*

**04 — HOW IT WORKS (Luồng hoạt động)**
*   Thiết kế dạng dòng thời gian trượt ngang hoặc dọc với animation nối các điểm:
    1. Doanh nghiệp tạo chiến dịch.
    2. Thuật toán "bắn" yêu cầu cho cộng tác viên gần nhất (Minh họa bằng bản đồ toả sóng).
    3. Cộng tác viên tới nơi thu thập dữ liệu bằng App.
    4. Dữ liệu được AI & QA kiểm duyệt, đổ thẳng về Dashboard doanh nghiệp.

**05 — FOR LOOKERS / SHEPHERDS (Dành cho Cộng tác viên - B2C)**
*   Đổi màu nền phân khu sang tông tối (Dark mode) có phủ noise để tạo sự đối lập mạnh.
*   Tiêu đề: *"Biến thời gian rảnh thành thu nhập"*. 
*   Trình bày quyền lợi: Thu nhập linh hoạt, thao tác qua app đơn giản, thanh toán ngay lập tức (Nhấn mạnh yếu tố ví điện tử chuẩn 9Pay).

**06 — TRUST & SECURITY (Cam kết Bảo mật)**
*   Lấy cảm hứng mạnh từ Fintech 9Pay. Hiển thị các chứng chỉ bảo mật, mã hóa dữ liệu, xác thực vị trí (GPS/Timestamp) chống giả mạo hình ảnh.

**07 — FOOTER (Chân trang)**
*   Điều hướng sâu, liên hệ, chính sách, và CTA tải App (QR code, nút App Store / Google Play).

---

## 3. PHÂN HỆ 2: TRANG QUẢN TRỊ (ADMIN DASHBOARD / CLIENT PORTAL)

Nơi Doanh nghiệp (Client) và Ban quản trị (Super Admin) thao tác. Thiết kế ưu tiên sự gọn gàng, dữ liệu chuyên sâu (Data-heavy).

**Dành cho Doanh nghiệp (Client Portal):**
*   **Tổng quan (Overview):** Màn hình dashboard hiển thị bản đồ nhiệt (Heatmap) về các nhiệm vụ đang diễn ra. Biểu đồ thống kê tỷ lệ hoàn thành, ngân sách đã tiêu.
*   **Quản lý Chiến dịch (Campaign Builder):** 
    *   Giao diện tạo mới yêu cầu dạng từng bước (Stepper): Chọn địa điểm trên bản đồ -> Xây dựng form câu hỏi/yêu cầu chụp ảnh (Kéo thả) -> Đặt ngân sách/thù lao -> Xuất bản.
*   **Kho Dữ liệu (Data Review):** Nơi xem kết quả CTV gửi về. Giao diện chia đôi màn hình: Trái là danh sách địa điểm, phải là hình ảnh/dữ liệu chi tiết, có nút "Phê duyệt" hoặc "Yêu cầu làm lại".
*   **Quản lý Thanh toán (Billing):** Giao diện ví điện tử giống 9Pay: Lịch sử nạp tiền, sao kê trừ tiền theo từng tác vụ.

**Dành cho Super Admin (Quản trị hệ thống):**
*   **Quản lý Lực lượng (Workforce):** Bảng xét duyệt hồ sơ CTV (Duyệt CCCD), theo dõi điểm uy tín (Rating).
*   **QA/QC Control:** Trạm trung chuyển để đội ngũ Admin duyệt chất lượng hình ảnh/dữ liệu trước khi gửi tới doanh nghiệp (để đảm bảo không có ảnh mờ, fake GPS).
*   **Đối soát tài chính:** Hệ thống tính toán dòng tiền, phí nền tảng, chi lương tự động cho CTV.

---

## 4. PHÂN HỆ 3: WEB MOBILE APP (CHO CỘNG TÁC VIÊN)

Thiết kế ưu tiên thao tác bằng một tay trên điện thoại, phông chữ lớn, màu sắc cảnh báo rõ ràng. Luồng trải nghiệm tương đương các app giao hàng/xe công nghệ.

*   **Khám phá Nhiệm vụ (Map/List View):**
    *   Màn hình chính là Bản đồ (Google/Mapbox). Các nhiệm vụ là các điểm ghim (Pins) có hiện sẵn số tiền thù lao (VD: `50.000đ`).
    *   Có thể chuyển sang dạng danh sách cho dễ nhìn.
*   **Chi tiết & Nhận việc (Task Detail):**
    *   Hiển thị khoảng cách (km), thời gian hết hạn, và mô tả yêu cầu cụ thể (Cần chụp ảnh mặt tiền, chụp quầy kệ...).
    *   Nút CTA cực lớn (Full width) ở đáy màn hình: **"NHẬN NHIỆM VỤ NÀY"**.
*   **Thực thi nhiệm vụ (Execution Flow):**
    *   Giao diện Camera chuyên dụng (có đánh dấu toạ độ GPS, ngày giờ chìm trên ảnh - Watermark để chống gian lận).
    *   Form checklist: Các câu hỏi trắc nghiệm hoặc ô nhập liệu ngắn (Ví dụ: "Cửa hàng có mở cửa không? Có / Không").
*   **Ví Thu Thu Nhập (Wallet):**
    *   Thiết kế học hỏi 100% từ 9Pay: Thẻ hiển thị "Số dư khả dụng" nổi bật. Nút "Rút tiền về ngân hàng".
    *   Lịch sử dòng tiền (Tiền cộng vào từ nhiệm vụ nào, tiền đang chờ duyệt).
*   **Hồ sơ & Đào tạo (Profile & Training):**
    *   Chứng nhận cấp bậc của CTV (Tân binh, Bậc thầy...).
    *   Các bài test ngắn để mở khóa nhận những nhiệm vụ thù lao cao hơn.
