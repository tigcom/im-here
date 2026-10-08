# Starter Kit — Landing Page Cao Cấp

Khung khởi tạo Next.js 15 + React 19 + GSAP + Lenis, tuân thủ
`~/.agent-rules/high-end-landing/RULES.md`.

## 1. Dùng

```bash
# Copy vào dự án mới
cp -r ~/.agent-rules/high-end-landing/starter/. ./my-landing/
cd ./my-landing
npm install
npm run dev
```

Nhớ cấu hình alias `@/` trong `jsconfig.json` hoặc `tsconfig.json`:

```json
{ "compilerOptions": { "paths": { "@/*": ["./*"] } } }
```

## 2. Cần thêm thủ công

| Tệp | Vì sao |
|---|---|
| `public/textures/noise-128.png` | Ảnh hạt 128×128 cho `.noise-layer` (`SRF-04`). Không có thì nền tối sẽ phẳng. |
| `postcss.config.mjs` | Cho Tailwind v4: `{ plugins: { "@tailwindcss/postcss": {} } }` |
| Phông display tuỳ chỉnh | Mặc định dùng `Fraunces` (Google Fonts). Muốn `Clash Display` / `Syne` → tải `.woff2` và đổi sang `next/font/local`. |

## 3. Cấu trúc

```
app/
  layout.jsx                    nạp phông, SmoothScrollProvider, NoiseOverlay, skip-link
  page.jsx                      lắp ghép phân khu — minh hoạ nhịp lặng→nén
  globals.css                   TOKEN + @theme Tailwind + base
components/
  SmoothScrollProvider.jsx      MOT-01 — Lenis + GSAP gộp một RAF
  NoiseOverlay.jsx              SRF-04
  EditorialShowcase.jsx         MOT-04 — pin + scrub, tỷ lệ 4/8
  AsymmetricBento.jsx           LAY §2.1 — bento 12 cột bất đối xứng
  ActionButton.jsx              STA-01 — 8 trạng thái
  sections/Hero.jsx             LAY §2.1 — 7/5/3, mask dòng chữ
  sections/PauseSection.jsx     LAY-02 + LAY-03 — khoảng lặng, chữ xuyên biên
styles/
  button.css                    8 trạng thái của nút
```

## 4. Bản đồ quy tắc → mã nguồn

| Quy tắc | Ở đâu |
|---|---|
| `TOK-01/02/05` | `app/globals.css` — khối `:root` |
| `TYP-01…04` | `app/globals.css` — `.display-*`, `.label`; `app/layout.jsx` — cặp phông |
| `SRF-01/02/03` | `app/globals.css` — `.elevated`, `.panel`, `.concentric` |
| `SRF-04` | `components/NoiseOverlay.jsx` |
| `LAY-01` | `components/sections/Hero.jsx` — `md:translate-y-6` |
| `LAY-02` | `app/page.jsx` — chu kỳ lặng→nén |
| `LAY-03` | `components/sections/PauseSection.jsx` — nền đôi + `mix-blend-difference` |
| `MOT-01` | `components/SmoothScrollProvider.jsx` |
| `MOT-04` | `components/EditorialShowcase.jsx` |
| `MOT-05` | Mọi component dùng `gsap.matchMedia()` + `globals.css` media query |
| `STA-01/02/03` | `components/ActionButton.jsx` + `styles/button.css` |

## 5. Kiểm định

```bash
npm run audit          # quét thư mục hiện tại
npm run audit -- --strict
npm run audit -- --json > audit.json
```

Kỳ vọng trên starter: **0 lỗi**. (Có thể còn 1 cảnh báo `SRF-01` cho bóng tiếp
xúc một tầng ở biến thể nút ghost — đó là cảnh báo có chủ đích, không phải lỗi.)

## 6. Trước khi dùng cho dự án thật

1. **Thay toàn bộ nội dung demo** trong `app/page.jsx`. Số liệu, tên, mô tả
   phải là dữ liệu thật. Nếu chưa có → **dừng lại và hỏi** (`EDT-04`).
2. **Chốt brief 8 mục** theo `references/08-art-direction-brief.md`.
3. **Chọn hướng art direction** trước khi tinh chỉnh màu/phông.
4. **Tinh chỉnh vi mô bằng tay** — đệm lệch vài px, thời điểm reveal, easing.
   Đây là bước quyết định sự khác biệt giữa sản phẩm AI và sản phẩm studio.
5. Chạy `npm run audit` và Lighthouse (Perf ≥ 90, A11y ≥ 95, CLS < 0.1).
