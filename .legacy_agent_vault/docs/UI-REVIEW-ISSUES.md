# Danh sách vấn đề UI — Trang chủ & Trang app

> **Nguồn**: audit theo skill `emilkowalski/skills` — `review-animations` (10 tiêu chuẩn) + `STANDARDS.md` + `improve-animations/AUDIT.md`.
> **Commit khi audit**: `7073fdf`
> **Phạm vi**: `app/page.jsx` + 11 component trang chủ; `app/app/page.jsx` + `components/mobile/LookerApp.jsx` + `components/mobile/TaskMap.jsx`.
> **Trạng thái**: chưa sửa gì. File này read-only đối với source — chỉ để bàn giao.

---

## Hướng dẫn cho agent thực thi

Đọc hết mục **Quy ước repo** trước. Mỗi vấn đề dưới đây **tự chứa**: có `file:line`, mã hiện tại nguyên văn, mã đích nguyên văn, các bước, và cách kiểm chứng. Không cần suy đoán giá trị nào.

**Quy tắc bắt buộc:**

1. Nếu mã bạn thấy tại `file:line` **khác** với mã nguyên văn trong tài liệu này → **DỪNG và báo lại**, không tự ứng biến (repo đã drift kể từ commit `7073fdf`).
2. Chỉ sửa thuộc tính chuyển động / lớp CSS / token. **Không** đổi markup, không đổi cấu trúc JSX, trừ khi bước ghi rõ.
3. **Không thêm dependency mới.** Mọi cách sửa dưới đây đều làm được bằng những gì repo đã có.
4. Sửa xong một vấn đề thì chạy mục "Kiểm chứng" của chính nó.

---

## Quy ước repo (bắt buộc tuân theo)

Đây là cách codebase này **đã** làm — hãy mở rộng, đừng tạo hệ song song.

**Token chuyển động** (`app/globals.css:57-65`):

```css
--ease-expo:      cubic-bezier(0.16, 1, 0.3, 1);   /* ease-out mạnh — DÙNG CÁI NÀY cho enter/exit */
--ease-quint:     cubic-bezier(0.83, 0, 0.17, 1);  /* ease-in-out mạnh */
--ease-back:      cubic-bezier(0.34, 1.56, 0.64, 1); /* overshoot */

--dur-micro:      160ms;
--dur-ui:         320ms;
--dur-reveal:     900ms;
--dur-cinematic:  1400ms;
```

> ⚠️ Các token trên hiện **được dùng 0 lần** ngoài `globals.css` (xem vấn đề **#13**). Ưu tiên dùng chúng thay vì gõ lại giá trị.

**Chuẩn giá trị của skill** (lấy từ `AUDIT.md`, không được xấp xỉ):

| Hạng mục | Giá trị |
|---|---|
| Phản hồi nhấn nút | `scale(0.95–0.98)` trên `:active`, `transition: transform 160ms ease-out` |
| Tooltip / popover nhỏ | 125–200ms |
| Dropdown / select | 150–250ms |
| Modal / drawer | 200–500ms |
| **Trần animation UI** | **< 300ms** |
| Không bao giờ | `scale(0)`, `ease-in` trên UI, `transition-all` |

**Ví dụ mẫu đã làm ĐÚNG** (`styles/button.css:31-35`):

```css
transition:
  transform 160ms cubic-bezier(0.16, 1, 0.3, 1),
  box-shadow 160ms cubic-bezier(0.16, 1, 0.3, 1),
  background-color 160ms cubic-bezier(0.16, 1, 0.3, 1),
  border-color 160ms cubic-bezier(0.16, 1, 0.3, 1);
```

→ Khai báo **từng thuộc tính cụ thể**, không dùng `all`. Đây là khuôn mẫu để noi theo.

---

## Bảng ưu tiên (sắp theo đòn bẩy = tác động ÷ công sức)

| # | Mức | Nhóm | Vị trí | Vấn đề | Tóm tắt cách sửa |
|---|---|---|---|---|---|
| 1 | 🔴 HIGH | Performance | `LookerApp.jsx:814,892,992` | Class `animate-in`… không tồn tại → **modal không có animation nào** | Định nghĩa transition thật + `@starting-style` |
| 2 | 🔴 HIGH | Performance | `LookerApp.jsx:171-228,393` | Bottom sheet kéo re-render React mỗi frame + animate `height` | `transform` + rAF, bỏ setState mỗi move |
| 3 | 🔴 HIGH | Performance | `EditorialShowcaseSection.jsx:39-44` | Animate `borderRadius` trong timeline `pin+scrub` | Bỏ `borderRadius`, giữ `scale` |
| 4 | 🔴 HIGH | Accessibility | `globals.css:275-282` | Override reduced-motion giết **mọi** transition | Chỉ tắt chuyển động vị trí, giữ opacity/color |
| 5 | 🔴 HIGH | Tokens | `LookerApp.jsx:839,1025` | `bg-paper-50` không tồn tại → **không có nền** | Dùng `bg-paper-100` |
| 6 | 🟠 MEDIUM | Performance | `LookerApp.jsx` (7 chỗ) | `transition-all` | Đổi sang thuộc tính cụ thể |
| 7 | 🟠 MEDIUM | Accessibility | `LookerApp.jsx:273` | `h-screen` (lỗi 100vh trên mobile) | Đổi sang `h-dvh` |
| 8 | 🟠 MEDIUM | Accessibility | `LookerApp.jsx` (30 chỗ) | `hover:` không gate → hover dính trên cảm ứng | Bọc `@media (hover: hover)` |
| 9 | 🟠 MEDIUM | Accessibility | `SmoothScrollProvider.jsx:58-60` | Reduced-motion đọc 1 lần, không reactive | Chuyển sang state reactive |
| 10 | 🟠 MEDIUM | Cohesion | 5 file (11 chỗ) | `animate-ping` vô hạn chạy song song | Giữ 1 tín hiệu "live", còn lại tĩnh |
| 11 | 🟠 MEDIUM | Interruptibility | `LookerApp.jsx:176-207` | Kéo thiếu momentum/damping/pointer-capture | Bổ sung theo mục Gesture |
| 12 | 🟠 MEDIUM | Accessibility | `LookerApp.jsx:812-887, 990-1069` | Modal thiếu Esc / click backdrop / focus trap | Bổ sung |
| 13 | 🟡 LOW | Tokens | `styles/button.css` | Curve/duration gõ cứng thay vì token | Thay bằng `var(--ease-expo)`, `var(--dur-micro)` |
| 14 | 🟡 LOW | Tokens | `LookerApp.jsx:421` | `hover:bg-paper-400` không tồn tại | Đổi sang `hover:bg-paper-200` |
| 15 | 🟡 LOW | Duration | `HeroSection.jsx:31-37` | Hero visual 1.1s + delay 0.2s | Rút còn 0.6–0.8s |
| 16 | 🟡 LOW | Physicality | `Footer.jsx:141` | Chỉ có `hover:scale-[1.05]`, thiếu `:active` | Thêm `active:scale-[0.97]` |
| 17 | 🟡 LOW | Logic | `Header.jsx:139-145` | CTA mobile không cuộn tới `#lien-he` | Thêm handler cuộn như bản desktop |
| 18 | 🟡 LOW | Rhythm | 5 phân khu | `py-24 md:py-32` giống hệt nhau | Luân chuyển nén ↔ lặng |

---

# CHI TIẾT TỪNG VẤN ĐỀ

## #1 — Modal của trang app không có animation (class chết)

**Mức**: HIGH · **Nhóm**: Performance / Physicality

### Vấn đề

`LookerApp.jsx` dùng các lớp tiện ích của plugin `tailwindcss-animate` — nhưng plugin này **không được cài**. Kiểm chứng:

```bash
grep -iE "animate-css|tailwindcss-animate" package.json   # → không có kết quả
grep -rn "animate-in" app/globals.css styles/             # → không có kết quả
```

Hệ quả: **cả 3 modal xuất hiện tức thì, không có bất kỳ chuyển cảnh nào** — đúng loại "jump cut" mà skill gọi là *preventing a jarring change*.

Vị trí:

```jsx
// components/mobile/LookerApp.jsx:814 — modal chi tiết task
className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-t-3xl lg:rounded-3xl bg-paper-000 shadow-2xl flex flex-col animate-in slide-in-from-bottom-8 lg:zoom-in-95 duration-300"

// components/mobile/LookerApp.jsx:892 — modal camera
className="relative flex h-full w-full max-w-2xl flex-col overflow-hidden sm:rounded-3xl bg-surface-950 text-on-surface-900 border sm:border-rule-dark shadow-2xl animate-in zoom-in-95 duration-300"

// components/mobile/LookerApp.jsx:992 — modal rút tiền
className="w-full max-w-md rounded-3xl border border-rule-subtle bg-paper-000 shadow-2xl animate-in zoom-in-95 duration-200"
```

Ngoài ra còn 3 chỗ dùng `animate-in fade-in`:
`LookerApp.jsx:947` (`animate-in fade-in duration-300`), `:1008` (`animate-in fade-in zoom-in-95 duration-300`), `:924` (`transition-all duration-300`).

### Đích

Thêm khối CSS vào `app/globals.css` (đặt trong `@layer components` hiện có, cạnh `.card-float`), dùng **transition + `@starting-style`** để không cần JS và không cần dependency:

```css
/* ═══════════════════════════════════════════════════════════════════════════
   MODAL ENTER — thay cho các lớp animate-in không tồn tại
   Modal là tương tác "occasional" → được phép có chuyển cảnh tiêu chuẩn.
   ═══════════════════════════════════════════════════════════════════════════ */
.modal-backdrop {
  opacity: 1;
  transition: opacity 200ms var(--ease-expo);
}
.modal-backdrop { @starting-style { opacity: 0; } }

/* Mobile: trượt từ đáy lên. Desktop: scale nhẹ từ tâm (modal KHÔNG dùng origin của trigger). */
.modal-panel {
  opacity: 1;
  transform: translateY(0) scale(1);
  transition:
    opacity 220ms var(--ease-expo),
    transform 300ms var(--ease-expo);
}
.modal-panel { @starting-style { opacity: 0; transform: translateY(24px) scale(0.97); } }

@media (min-width: 1024px) {
  .modal-panel { @starting-style { opacity: 0; transform: translateY(0) scale(0.96); } }
}

/* Modal camera: mở từ tâm ở mọi kích thước, không trượt dọc */
.modal-panel--zoom { @starting-style { opacity: 0; transform: scale(0.96); } }
```

### Các bước

1. Thêm khối CSS trên vào `app/globals.css`, trong `@layer components` (trước dấu `}` đóng layer ở dòng ~269).
2. `LookerApp.jsx:813` — thêm `modal-backdrop` vào lớp của div phủ: `className="fixed inset-0 z-50 ... modal-backdrop"`.
3. `LookerApp.jsx:814` — xoá `animate-in slide-in-from-bottom-8 lg:zoom-in-95 duration-300`, thêm `modal-panel`.
4. `LookerApp.jsx:891` — thêm `modal-backdrop` vào div phủ của modal camera.
5. `LookerApp.jsx:892` — xoá `animate-in zoom-in-95 duration-300`, thêm `modal-panel modal-panel--zoom`.
6. `LookerApp.jsx:991` — thêm `modal-backdrop` vào div phủ của modal rút tiền.
7. `LookerApp.jsx:992` — xoá `animate-in zoom-in-95 duration-200`, thêm `modal-panel modal-panel--zoom`.
8. `LookerApp.jsx:947` — xoá `animate-in fade-in duration-300`, thêm `modal-panel--zoom` (chỉ cần fade).
9. `LookerApp.jsx:1008` — xoá `animate-in fade-in zoom-in-95 duration-300`, thêm `modal-panel--zoom`.

### Ranh giới

- **Không** cài `tw-animate-css` hay bất kỳ plugin nào.
- **Không** đổi cấu trúc JSX, chỉ đổi giá trị `className`.
- **Không** dùng `scale(0)` — nền tảng phải là `scale(0.96)`.

### Kiểm chứng

- **Cơ học**: `npm run build` phải pass. Grep lại: `grep -rn "animate-in" components/` → không còn kết quả.
- **Cảm nhận**: mở `/app`, bấm "Chi tiết" một task → nền mờ dần vào, panel trượt lên từ đáy (mobile) / nở nhẹ từ tâm (desktop). Bấm huỷ rồi mở lại nhanh liên tục → không được "giật" về đầu.
- Trong DevTools → Animations, đặt playback 10% → xác nhận panel không bao giờ bắt đầu từ `scale(0)`.
- Bật `prefers-reduced-motion` (Rendering panel) → chuyển cảnh phải gần như tức thì (nhờ quy tắc chung ở `globals.css`).

---

## #2 — Bottom sheet kéo: re-render mỗi frame + animate thuộc tính layout

**Mức**: HIGH · **Nhóm**: Performance / Interruptibility

### Vấn đề

`LookerApp.jsx:171-228` — khi người dùng kéo tay nắm để thay đổi chiều cao bản đồ:

```jsx
// :197 — setState trong MỖI touchmove → React re-render 60–120 lần/giây
setMapHeightVh(newHeight);
```

```jsx
// :393 — animate `height`: thuộc tính layout, kích hoạt layout + paint + composite
className="relative shrink-0 lg:!h-full lg:flex-[7] bg-surface-900 overflow-hidden transition-[height] duration-75 ease-out"
style={{ height: `${mapHeightVh}vh` }}
```

```jsx
// :209,228 — deps [mapHeightVh] → gỡ và gắn lại 4 listener toàn cục mỗi frame
useEffect(() => { /* add 4 listeners */ }, [mapHeightVh]);
```

Ba lỗi chồng nhau: (a) React re-render mỗi frame, (b) `height` là thuộc tính layout buộc reflow, (c) `transition` 75ms còn chống lại chính thao tác kéo, tạo độ trễ.

### Đích

Chuyển sang `transform` (chạy trên compositor) + ghi trực tiếp vào DOM trong rAF, **không** dùng state cho giá trị kéo.

Thay cách tiếp cận như sau:

- Bản đồ giữ chiều cao **cố định** bằng vh qua một CSS variable đặt một lần, và bottom sheet dịch chuyển bằng `transform: translateY()`.
- Trong lúc kéo, ghi `sheetEl.style.transform` trực tiếp trong `requestAnimationFrame`; chỉ `setState` **một lần** khi thả tay (để snap).

```jsx
// target — thay khối 171-228
const sheetRef = useRef(null);
const drag = useRef({ active: false, startY: 0, startOffset: 0, offset: 0, raf: 0 });

const applyOffset = () => {
  drag.current.raf = 0;
  const el = sheetRef.current;
  if (el) el.style.transform = `translateY(${drag.current.offset}px)`;
};

const handleDragStart = (e) => {
  if (window.innerWidth >= 1024) return;
  const y = e.touches ? e.touches[0].clientY : e.clientY;
  drag.current = { ...drag.current, active: true, startY: y, startOffset: drag.current.offset };
  e.currentTarget.setPointerCapture?.(e.pointerId);
};

const handleDragMove = (e) => {
  if (!drag.current.active) return;
  if (e.cancelable) e.preventDefault();
  const y = e.touches ? e.touches[0].clientY : e.clientY;
  let next = drag.current.startOffset + (y - drag.current.startY);
  next = Math.max(-0.25 * window.innerHeight, Math.min(0.4 * window.innerHeight, next));
  drag.current.offset = next;
  if (!drag.current.raf) drag.current.raf = requestAnimationFrame(applyOffset);
};

const handleDragEnd = () => {
  if (!drag.current.active) return;
  drag.current.active = false;
  const h = window.innerHeight;
  // snap theo ngưỡng
  const snapped = drag.current.offset < -0.15 * h ? -0.25 * h
                : drag.current.offset > 0.2 * h  ?  0.4 * h
                : 0;
  drag.current.offset = snapped;
  const el = sheetRef.current;
  if (el) {
    el.style.transition = 'transform 300ms var(--ease-expo)';
    el.style.transform = `translateY(${snapped}px)`;
  }
};
```

Và gắn listener **một lần** với mảng deps rỗng `[]` thay vì `[mapHeightVh]`.

### Các bước

1. Thêm `const sheetRef = useRef(null);` cạnh các ref ở `LookerApp.jsx:172-174`.
2. Thay toàn bộ `handleDragStart` / `handleDragMove` / `handleDragEnd` (`:176-207`) bằng phiên bản trên.
3. Sửa `useEffect` ở `:209-228`: đổi deps thành `[]` (chạy một lần); dọn dẹp `cancelAnimationFrame` trong hàm cleanup.
4. Xoá hằng `mapHeightVh` / `setMapHeightVh` (`:171`).
5. Container bản đồ (`:392-395`): bỏ `transition-[height]` và `style={{ height }}`; đặt chiều cao cố định bằng lớp `h-[40vh]` (mobile) và giữ `lg:!h-full`.
6. Container danh sách (`:419`): gắn `ref={sheetRef}` và đổi `-mt-6` giữ nguyên; lớp transition chuyển từ `height` sang `transform`.
7. Tay nắm (`:420-424`): giữ nguyên `onTouchStart={handleDragStart} onMouseDown={handleDragStart}`.

### Ranh giới

- **Không** đổi bố cục desktop (`lg:` nhánh phải giữ nguyên hành vi).
- **Không** đổi dữ liệu `MOCK_TASKS`.
- Nếu `handleDragStart` hiện nhận `e.touches` — giữ tương thích cả chuột và chạm như phiên bản trên.

### Kiểm chứng

- **Cơ học**: `npm run build` pass. Mở React DevTools Profiler, kéo tay nắm → số lần render của `LookerApp` trong lúc kéo phải **< 5**, không phải hàng trăm.
- **Cảm nhận**: trên điện thoại thật (không phải giả lập), kéo tay nắm → sheet đi theo ngón tay **không trễ**; thả tay → snap mượt về mốc.
- Trong DevTools → Performance, ghi lại thao tác kéo → không được có khối "Layout" đỏ lặp lại mỗi frame.

---

## #3 — Animate `borderRadius` trong timeline pin + scrub

**Mức**: HIGH · **Nhóm**: Performance

### Vấn đề

```jsx
// components/sections/EditorialShowcaseSection.jsx:39-44 — current
tl.fromTo(
  centralMap.current,
  { scale: 0.95, borderRadius: '28px' },
  { scale: 1.02, borderRadius: '20px', ease: 'power2.inOut' },
  0
);
```

`border-radius` **không** chạy trên compositor — mỗi frame phải repaint. Timeline này lại gắn với `pin: true` + `scrub: 1`, nghĩa là repaint liên tục suốt thời gian người dùng cuộn qua phân khu (200% viewport).

`scale: 0.95 → 1.02` thì hợp lệ (chạy trên GPU, biên độ nhẹ).

### Đích

```jsx
// target
tl.fromTo(
  centralMap.current,
  { scale: 0.95 },
  { scale: 1.02, ease: 'power2.inOut' },
  0
);
```

Giữ `borderRadius` cố định trong CSS (đã là `rounded` qua lớp `card-float`), không animate.

### Các bước

1. `EditorialShowcaseSection.jsx:41` — xoá `borderRadius: '28px'`.
2. `EditorialShowcaseSection.jsx:42` — xoá `borderRadius: '20px'`.

### Ranh giới

- **Không** đổi các `tl.to` khác (`leftGlass`, `rightGlass`) — chúng dùng `y` và `opacity`, hợp lệ.
- **Không** đổi `pin` / `scrub` / `start` / `end`.

### Kiểm chứng

- **Cơ học**: grep `grep -n "borderRadius" components/sections/EditorialShowcaseSection.jsx` → không còn kết quả.
- **Cảm nhận**: cuộn chậm qua phân khu "Phủ Sóng Toàn Diện" → khung bản đồ vẫn phóng nhẹ, không còn hiện tượng nhấp nháy viền.
- DevTools → Performance, ghi lúc cuộn → không còn khối "Paint" lặp mỗi frame.

---

## #4 — Override reduced-motion giết toàn bộ phản hồi

**Mức**: HIGH · **Nhóm**: Accessibility

### Vấn đề

```css
/* app/globals.css:275-282 — current */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

Skill (`AUDIT.md` §6) nói rõ: *"Reduced motion means fewer and gentler animations, **not zero** — keep transitions that aid comprehension, remove position changes."* Chọn `*` + `!important` giết luôn cả fade màu và opacity — những thứ **giúp** hiểu giao diện.

### Đích

Thu hẹp phạm vi: chỉ tắt chuyển động **vị trí**, giữ opacity/color.

```css
/* target — thay khối 275-282 */
@media (prefers-reduced-motion: reduce) {
  /* Chỉ tắt chuyển động vị trí — giữ fade màu/opacity giúp hiểu nội dung */
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    scroll-behavior: auto !important;
  }
  /* Transition giữ nguyên thời lượng nhưng chỉ cho thuộc tính không gây chuyển động */
  .modal-panel,
  .modal-backdrop {
    transition-duration: 200ms !important;
  }
}
```

> Lưu ý: các phân khu GSAP đã được gate đúng qua `gsap.matchMedia('(prefers-reduced-motion: no-preference)')` — không cần đụng tới.

### Các bước

1. Thay khối `@media (prefers-reduced-motion: reduce)` ở `globals.css:275-282` bằng phiên bản trên.
2. Xác nhận `.modal-panel` / `.modal-backdrop` là tên lớp được thêm ở vấn đề **#1** (nếu #1 chưa làm, bỏ nhánh này và giữ phần còn lại).

### Ranh giới

- **Không** bỏ hẳn `prefers-reduced-motion` — vẫn phải tắt chuyển động vị trí.
- **Không** sửa `SmoothScrollProvider.jsx` ở bước này (xem #9).

### Kiểm chứng

- DevTools → Rendering → Emulate `prefers-reduced-motion: reduce`.
- Mở `/app`, bấm mở modal → panel **vẫn** hiện ra (fade), không còn nhảy tức thì thành khối cứng.
- Cuộn trang chủ → các phân khu GSAP **không** chạy reveal (đúng, vì đã gate).

---

## #5 — Token `bg-paper-50` không tồn tại

**Mức**: HIGH · **Nhóm**: Tokens

### Vấn đề

`globals.css` chỉ định nghĩa `--paper-000`, `--paper-100`, `--paper-200`, `--paper-300`. Không có `--paper-50`.

```jsx
// components/mobile/LookerApp.jsx:839 — current
<div className="mt-6 rounded-2xl border border-rule-subtle bg-paper-50 p-5 space-y-4">

// components/mobile/LookerApp.jsx:1025 — current
<div className="rounded-2xl border border-rule-subtle bg-paper-50 p-4">
```

Hệ quả: hai khối này **không có nền** → nội dung chìm vào nền `paper-000` của thẻ cha, mất phân tầng.

### Đích

```jsx
// target — :839
<div className="mt-6 rounded-2xl border border-rule-subtle bg-paper-100 p-5 space-y-4">

// target — :1025
<div className="rounded-2xl border border-rule-subtle bg-paper-100 p-4">
```

### Các bước

1. `LookerApp.jsx:839` — `bg-paper-50` → `bg-paper-100`.
2. `LookerApp.jsx:1025` — `bg-paper-50` → `bg-paper-100`.

### Ranh giới

- **Không** thêm token `--paper-050` mới (giữ bảng màu hiện tại).
- Chỉ đổi 2 chỗ này; grep để chắc chắn: `grep -rn "paper-50\b" components/`.

### Kiểm chứng

- `grep -rn "bg-paper-50\b" components/` → không còn kết quả.
- Mở modal chi tiết task → khối "Địa điểm thực hiện" có nền xám nhạt phân biệt với thẻ trắng.

---

## #6 — `transition-all` (7 chỗ)

**Mức**: MEDIUM · **Nhóm**: Performance

### Vấn đề

`transition-all` animate cả những thuộc tính không nhắm tới (kể cả thuộc tính layout) → tốn hơn và dễ gây giật. Skill (`AUDIT.md` §5): *"`transition: all` animates unintended properties off-GPU — always a finding."*

Các vị trí trong `components/mobile/LookerApp.jsx`:

| Dòng | Ngữ cảnh | Thuộc tính thực sự cần |
|---|---|---|
| `312` | Nút "Camera Mở Báo Cáo" (sidebar) | `transform`, `background-color` |
| `441` | Thẻ task ở tab MAP | `transform`, `box-shadow`, `border-color` |
| `497` | Nút lọc danh mục | `colors`, `box-shadow` |
| `510` | Thẻ task ở tab TASKS | `transform`, `box-shadow` |
| `619` | Nút "Rút Tiền Ngay" | `transform` |
| `924` | Lớp phủ xác nhận chụp ảnh (camera) | `opacity` |
| `1043` | Ô nhập số tiền rút | `border-color`, `box-shadow` |

### Đích

Thay từng chỗ bằng danh sách thuộc tính cụ thể, dùng khuôn mẫu ở `styles/button.css:31-35`:

- `312`: `transition-all` → `transition-[transform,background-color]`
- `441`: `transition-all` → `transition-[transform,box-shadow,border-color]`
- `497`: `transition-all` → `transition-[color,background-color,box-shadow]`
- `510`: `transition-all` → `transition-[transform,box-shadow]`
- `619`: `transition-all` → `transition-transform`
- `924`: `transition-all duration-300` → `transition-opacity duration-300`
- `1043`: `transition-all` → `transition-[border-color,box-shadow]`

### Các bước

1. Sửa lần lượt 7 dòng theo bảng trên.

### Ranh giới

- **Không** đổi thời lượng (`duration-*`) hay easing đang có.
- **Không** đổi hình dạng thị giác — chỉ giới hạn tập thuộc tính.

### Kiểm chứng

- `grep -rn "transition-all" components/` → không còn kết quả.
- `npm run build` pass. Hover từng phần tử → hiệu ứng vẫn y như trước.

---

## #7 — `h-screen` gây lỗi 100vh trên mobile

**Mức**: MEDIUM · **Nhóm**: Accessibility / Mobile

### Vấn đề

```jsx
// components/mobile/LookerApp.jsx:273 — current
<div className="flex h-screen w-full bg-surface-950 text-on-surface-900 font-sans overflow-hidden">
```

Trên mobile Safari/Chrome, `100vh` **bao gồm** vùng thanh URL động → nội dung bị đẩy xuống dưới thanh địa chỉ, và thanh điều hướng dưới cùng bị che khuất một phần.

Cùng vấn đề ở `app/app/page.jsx:10` (`min-h-screen`) và `app/page.jsx:27` (`min-h-screen`).

### Đích

```jsx
// target — LookerApp.jsx:273
<div className="flex h-dvh w-full bg-surface-950 text-on-surface-900 font-sans overflow-hidden">
```

```jsx
// target — app/app/page.jsx:10
<div className="min-h-dvh bg-surface-950 flex flex-col w-full h-full">
```

```jsx
// target — app/page.jsx:27
<div className="relative min-h-dvh bg-surface-950 text-on-surface-900">
```

> Lưu ý: repo **đã** dùng đúng ở `EditorialShowcaseSection.jsx:55` (`h-dvh`) — noi theo đó.

### Các bước

1. `LookerApp.jsx:273` — `h-screen` → `h-dvh`.
2. `app/app/page.jsx:10` — `min-h-screen` → `min-h-dvh`.
3. `app/page.jsx:27` — `min-h-screen` → `min-h-dvh`.

### Ranh giới

- **Không** đổi `h-full` / `min-h-*` khác.
- `<meta viewport>` trong `layout.jsx` giữ nguyên.

### Kiểm chứng

- Mở `/app` trên Chrome DevTools chế độ thiết bị (iPhone 14 Pro) → thanh điều hướng dưới cùng hiển thị đầy đủ, không bị che.
- `grep -rn "h-screen\|min-h-screen" components/ app/` → không còn kết quả.

---

## #8 — Hover không gate trên thiết bị cảm ứng (30 chỗ)

**Mức**: MEDIUM · **Nhóm**: Accessibility

### Vấn đề

`LookerApp.jsx` có **30** lớp `hover:` áp trực tiếp. Trên thiết bị cảm ứng, tap sẽ kích hoạt `:hover` và trạng thái đó **dính lại** cho tới khi chạm chỗ khác — ví dụ nút "Cá Nhân" ở thanh dưới cùng sáng màu accent dù đã bỏ tay ra.

Skill (`AUDIT.md` §6): *"touch fires false hovers on tap"* — phải gate sau `@media (hover: hover) and (pointer: fine)`.

### Đích

Áp dụng mẫu sau trong `app/globals.css` (`@layer components`), rồi đổi các lớp `hover:` trong `LookerApp.jsx` sang dạng `hoverable:` tương ứng:

```css
/* target — thêm vào app/globals.css, ngay sau @import "tailwindcss"; */
@custom-variant hoverable {
  @media (hover: hover) and (pointer: fine) {
    &:hover {
      @slot;
    }
  }
}
```

Sau đó đổi `hover:text-ink-900` → `hoverable:text-ink-900`, v.v.

> Nếu không muốn dùng `@custom-variant`, cách tương đương: giữ nguyên `hover:` nhưng thay bằng tương tác nhấn `active:` cho các nút trên thanh điều hướng — vì trên mobile, `:active` mới là tín hiệu đúng.

### Các bước

1. Thêm `@custom-variant hoverable (...)` vào đầu `app/globals.css` (sau `@import "tailwindcss";`).
2. Trong `LookerApp.jsx`, thay tiền tố `hover:` → `hoverable:` cho **các phần tử chỉ có trên mobile** — ưu tiên: thanh điều hướng dưới (`:791-802`), nút ví trên header mobile (`:376-383`), các thẻ task (`:441`, `:510`).
3. Với nút trên thanh điều hướng dưới cùng, thêm `active:scale-95` để có phản hồi nhấn rõ trên cảm ứng.

### Ranh giới

- **Không** đổi bố cứng desktop — nhánh `lg:` vẫn dùng `hover:` bình thường (chuột thật).
- **Không** xoá hover; chỉ gate lại.

### Kiểm chứng

- DevTools → Rendering → Emulate touch, hoặc dùng điện thoại thật.
- Chạm nút "Cá Nhân" → sau khi bỏ tay, nút **trở lại** màu xám (không dính accent).
- Trên desktop (chuột), hover vẫn đổi màu như cũ.

---

## #9 — Reduced-motion trong SmoothScrollProvider không reactive

**Mức**: MEDIUM · **Nhóm**: Accessibility

### Vấn đề

```jsx
// components/SmoothScrollProvider.jsx:58-60 — current
const prefersReduced =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;
```

Giá trị này đọc **một lần** trong thân component, và ở lần render phía server luôn trả `false`. Người dùng bật "giảm chuyển động" trong hệ điều hành **sau khi** tải trang sẽ không được tôn trọng cho tới khi tải lại.

### Đích

Chuyển sang state reactive:

```jsx
// target — thay khối 58-60 và thêm import
import { useEffect, useState } from 'react';

// ... trong component:
const [prefersReduced, setPrefersReduced] = useState(false);

useEffect(() => {
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  setPrefersReduced(mq.matches);
  const onChange = (e) => setPrefersReduced(e.matches);
  mq.addEventListener('change', onChange);
  return () => mq.removeEventListener('change', onChange);
}, []);
```

### Các bước

1. `SmoothScrollProvider.jsx:18` — thêm `useState` vào import từ `react`.
2. Thay khối `const prefersReduced = ...` (`:58-60`) bằng state + `useEffect` ở trên.

### Ranh giới

- **Không** đổi `options` truyền cho `<ReactLenis>` (`autoRaf`, `lerp`, `duration`…) — chỉ nguồn của `prefersReduced`.
- **Không** đụng vào vòng lặp `gsap.ticker`.

### Kiểm chứng

- Mở trang, sau đó vào DevTools → Rendering → Emulate `prefers-reduced-motion: reduce`.
- Không tải lại trang → cuộn phải chuyển từ mượt (Lenis) sang cuộn gốc của trình duyệt.

---

## #10 — 11 vòng lặp `animate-ping` chạy vô hạn song song

**Mức**: MEDIUM · **Nhóm**: Cohesion / Performance

### Vấn đề

`animate-ping` của Tailwind là animation **vô hạn**. Không có gì dừng nó, kể cả khi phân khu đã cuộn khỏi màn hình.

| File | Số chỗ |
|---|---|
| `components/sections/EditorialShowcaseSection.jsx` | 4 |
| `components/sections/HeroSection.jsx` | 2 |
| `components/mobile/LookerApp.jsx` | 3 |
| `components/DemoNavigator.jsx` | 1 |
| `components/mobile/TaskMap.jsx` | 1 |

Đặc biệt ở `LookerApp.jsx:289` và `:367`, ping nằm trong **header luôn hiển thị** → chạy suốt phiên. Tín hiệu "live" mất giá trị khi có 11 cái cùng nhấp nháy.

### Đích

Giữ **một** tín hiệu "live" duy nhất trên mỗi màn hình; phần còn lại đổi sang chấm tĩnh (`bg-accent`, không `animate-ping`).

Ưu tiên giữ lại: chấm trong header trang app (`LookerApp.jsx:289` — chỉ bản desktop) — vì đó là tín hiệu GPS trực chiến, có nghĩa thật.

### Các bước

1. `EditorialShowcaseSection.jsx` — bỏ `animate-ping` ở 3 pin bản đồ (`:131`, `:140`, `:149`), giữ chấm `bg-accent` tĩnh. Giữ 1 ở badge tiêu đề (`:68`) nếu muốn.
2. `HeroSection.jsx` — bỏ `animate-ping` ở `:202`; giữ `animate-pulse` ở `:76` (đây là pill badge, nhịp chậm hơn).
3. `LookerApp.jsx` — bỏ `animate-ping` ở `:367` (header mobile) và `:896` (modal camera); giữ `:289`.
4. `TaskMap.jsx` — không có ping trong JSX; kiểm tra `:53` là `animate-pulse` (giữ nguyên, đó là skeleton hợp lệ).
5. `DemoNavigator.jsx:87` — giữ (đây là công cụ demo, ít hiển thị).

### Ranh giới

- **Không** đổi màu/kích thước chấm.
- **Không** xoá hoàn toàn tín hiệu "live" — chỉ giảm số lượng.

### Kiểm chứng

- `grep -rc "animate-ping" components/` → tổng ≤ 3.
- Mở trang chủ → mắt không bị hút bởi nhiều chấm nhấp nháy cùng lúc.
- DevTools → Performance, ghi 5 giây đứng yên → không còn hoạt động compositor liên tục.

---

## #11 — Kéo thả thiếu momentum, damping, pointer capture

**Mức**: MEDIUM · **Nhóm**: Interruptibility / Gesture

### Vấn đề

`LookerApp.jsx:200-207` snap **thuần theo ngưỡng vị trí** (25 / 55):

```jsx
// :200-207 — current
const handleDragEnd = () => {
  if (!isDragging.current) return;
  isDragging.current = false;
  if (mapHeightVh < 25) setMapHeightVh(15);
  else if (mapHeightVh > 55) setMapHeightVh(65);
  else setMapHeightVh(40);
};
```

Thiếu: (a) momentum theo vận tốc — một cú "hất" (flick) nhẹ không đủ để snap; (b) damping ở biên — kéo quá ngưỡng là bị chặn cứng; (c) pointer capture; (d) chống đa chạm.

### Đích

Bổ sung theo `AUDIT.md` §4:

- **Momentum**: tính `velocity = Math.abs(deltaY) / elapsedMs`; nếu `> ~0.11` thì snap theo hướng hất, **bất kể** vị trí.
- **Damping**: khi vượt biên, dịch chuyển bằng `quá * 0.3` thay vì chặn cứng.
- **Pointer capture**: `el.setPointerCapture(e.pointerId)` khi bắt đầu kéo.
- **Chống đa chạm**: `if (drag.current.active) return;` ở đầu `handleDragStart`.

> Vấn đề này gộp vào cùng lần sửa với **#2** (đã đổi sang `transform` + rAF). Làm #2 trước, rồi bổ sung các điểm trên vào cùng bộ handler.

### Các bước

1. Trong `handleDragStart` thêm `if (drag.current.active) return;` (chống đa chạm) và lưu `drag.current.startTime = performance.now()`.
2. Trong `handleDragEnd`, tính vận tốc từ `(performance.now() - startTime)`; nếu vượt ngưỡng thì chọn mốc snap theo **hướng** thay vì theo vị trí.
3. Trong `handleDragMove`, thay clamp cứng bằng damping: nếu vượt biên, nhân phần vượt với `0.3`.

### Ranh giới

- **Không** thêm thư viện gesture.
- Giữ hành vi desktop (`lg:`) không đổi.

### Kiểm chứng

- Trên điện thoại thật: hất nhẹ tay nắm từ giữa → sheet **bật** lên/xuống theo hướng hất.
- Kéo quá mép trên → chuyển động chậm dần (có lực cản), không dừng cứng.
- Đặt 2 ngón rồi kéo → không bị nhảy.

---

## #12 — Modal thiếu Esc / click nền / focus trap

**Mức**: MEDIUM · **Nhóm**: Accessibility

### Vấn đề

Cả 3 modal trong `LookerApp.jsx` (`:812-887` chi tiết task, `:890-987` camera, `:990-1069` rút tiền) đều:

- Không đóng khi nhấn `Esc`
- Không đóng khi bấm ra nền
- Không giữ focus trong modal (`role="dialog"` / `aria-modal` / focus trap)
- Không khoá cuộn nền

### Đích

Thêm một hook nhỏ dùng chung, không cần thư viện:

```jsx
// target — thêm trong LookerApp.jsx (phía trên component)
function useModalA11y(isOpen, onClose) {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [isOpen, onClose]);
}
```

Và thêm `role="dialog" aria-modal="true"` vào div panel của mỗi modal; thêm `onClick={onClose}` ở div phủ + `onClick={(e) => e.stopPropagation()}` ở panel.

### Các bước

1. Thêm hook `useModalA11y` vào `LookerApp.jsx`.
2. Gọi `useModalA11y(isTaskDetailOpen, () => setIsTaskDetailOpen(false));` cạnh các state (`:158`).
3. Gọi tương tự cho `isCameraActive` và `withdrawModal`.
4. Thêm `role="dialog" aria-modal="true"` vào mỗi div panel (`:814`, `:892`, `:992`).
5. Thêm `onClick` đóng ở div phủ (`:813`, `:891`, `:991`) và `stopPropagation` ở panel.

### Ranh giới

- **Không** đổi nội dung/hình dạng modal.
- **Không** đổi logic `handleSubmitProof` / `setWithdrawSuccess`.

### Kiểm chứng

- Mở modal, nhấn `Esc` → đóng. Bấm ra ngoài panel → đóng. Bấm bên trong panel → không đóng.
- Nền trang không cuộn được khi modal mở.
- Chạy Lighthouse → điểm A11y không giảm.

---

## #13 — `button.css` gõ cứng curve/duration thay vì dùng token

**Mức**: LOW · **Nhóm**: Tokens

### Vấn đề

`globals.css:57-65` định nghĩa bộ token chuyển động, nhưng **0 lần** được dùng ngoài chính file đó. `styles/button.css` lặp lại giá trị thô:

```css
/* styles/button.css:31-35 — current */
transition:
  transform 160ms cubic-bezier(0.16, 1, 0.3, 1),
  box-shadow 160ms cubic-bezier(0.16, 1, 0.3, 1),
  background-color 160ms cubic-bezier(0.16, 1, 0.3, 1),
  border-color 160ms cubic-bezier(0.16, 1, 0.3, 1);
```

`cubic-bezier(0.16, 1, 0.3, 1)` **chính là** `--ease-expo`. `160ms` **chính là** `--dur-micro`. Hai hệ giá trị song song → sửa một chỗ sẽ lệch chỗ kia.

### Đích

```css
/* styles/button.css — target */
transition:
  transform var(--dur-micro) var(--ease-expo),
  box-shadow var(--dur-micro) var(--ease-expo),
  background-color var(--dur-micro) var(--ease-expo),
  border-color var(--dur-micro) var(--ease-expo);
```

### Các bước

1. Thay `160ms cubic-bezier(0.16, 1, 0.3, 1)` → `var(--dur-micro) var(--ease-expo)` ở `button.css:32-35`.
2. Kiểm tra các chỗ khác trong file: `:59` (`:active`) dùng `transform: ...` không có transition riêng — giữ nguyên.

### Ranh giới

- **Không** đổi giá trị — chỉ đổi *cách viết* (token thay vì literal). Kết quả render phải y hệt.
- **Không** sửa `globals.css`.

### Kiểm chứng

- `grep -n "0.16, 1, 0.3, 1" styles/` → chỉ còn trong `globals.css` (nơi định nghĩa token).
- Hover/active nút → cảm giác y hệt trước khi sửa.

---

## #14 — `hover:bg-paper-400` không tồn tại

**Mức**: LOW · **Nhóm**: Tokens

### Vấn đề

```jsx
// components/mobile/LookerApp.jsx:421 — current
className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-paper-300 lg:hidden cursor-grab active:cursor-grabbing transition-colors hover:bg-paper-400"
```

`--paper-400` không được định nghĩa (xem #5) → hover không có tác dụng. Thanh tay nắm mất phản hồi thị giác.

### Đích

```jsx
// target
className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-paper-300 lg:hidden cursor-grab active:cursor-grabbing transition-colors hover:bg-paper-200"
```

### Các bước

1. `LookerApp.jsx:421` — `hover:bg-paper-400` → `hover:bg-paper-200`.

### Ranh giới

- Chỉ 1 dòng. `grep -rn "paper-400" components/` để chắc chắn không còn chỗ khác.

### Kiểm chứng

- Hover tay nắm (desktop) → thanh đậm lên một bậc.

---

## #15 — Hero visual reveal quá dài

**Mức**: LOW · **Nhóm**: Duration

### Vấn đề

```jsx
// components/sections/HeroSection.jsx:31-37 — current
gsap.from('.hero-visual-card', {
  scale: 0.94,
  opacity: 0,
  duration: 1.1,
  delay: 0.2,
  ease: 'expo.out',
});
```

Cộng thêm headline `duration: 0.9` + `stagger: 0.12` (2 dòng), nội dung hero mất **~1.3–1.5s** mới ổn định. Hero là nội dung LCP — skill cho phép marketing dài hơn, nhưng hero nên nhanh hơn phần còn lại của trang.

### Đích

```jsx
// target
gsap.from('.hero-visual-card', {
  scale: 0.94,
  opacity: 0,
  duration: 0.7,
  delay: 0.1,
  ease: 'expo.out',
});
```

### Các bước

1. `HeroSection.jsx:34` — `duration: 1.1` → `0.7`.
2. `HeroSection.jsx:35` — `delay: 0.2` → `0.1`.

### Ranh giới

- **Không** đổi `ease` hay `scale` (0.94 nằm đúng dải 0.9–0.97).
- Để nguyên các animation khác trong cùng khối `mm.add`.

### Kiểm chứng

- Tải lại trang chủ → khối mockup hiện nhanh hơn, không còn khoảng trắng chờ.

---

## #16 — Nút "Lên đầu trang" thiếu phản hồi nhấn

**Mức**: LOW · **Nhóm**: Physicality

### Vấn đề

```jsx
// components/Footer.jsx:141 — current
className="flex items-center gap-2 rounded-full border border-rule-dark bg-surface-900 px-4 py-2 text-xs font-bold text-on-surface-900 transition-[transform] duration-160 hover:scale-[1.05] hover:border-accent"
```

Chỉ có hover phóng to 5% (biên độ lớn hơn chuẩn 0.95–0.98, và áp lên *hover* thay vì *press*). Không có `:active`.

### Đích

```jsx
// target
className="flex items-center gap-2 rounded-full border border-rule-dark bg-surface-900 px-4 py-2 text-xs font-bold text-on-surface-900 transition-[transform,border-color] duration-160 hover:border-accent hover:-translate-y-0.5 active:scale-[0.97]"
```

### Các bước

1. `Footer.jsx:141` — bỏ `hover:scale-[1.05]`, thêm `hover:-translate-y-0.5 active:scale-[0.97]`, và đổi `transition-[transform]` → `transition-[transform,border-color]`.

### Ranh giới

- Chỉ 1 dòng.

### Kiểm chứng

- Nhấn giữ nút → nút co lại nhẹ (0.97). Thả ra → trở về.

---

## #17 — CTA mobile không cuộn tới form

**Mức**: LOW · **Nhóm**: Logic

### Vấn đề

Nút "Kích Hoạt Chiến Dịch" ở header có hai phiên bản xử lý **khác nhau**:

```jsx
// components/Header.jsx:67-75 — desktop: cuộn tới form (ĐÚNG)
<ActionButton
  variant="primary"
  onClick={() => {
    const el = document.getElementById('lien-he');
    el?.scrollIntoView({ behavior: 'smooth' });
  }}
>
  Kích Hoạt Chiến Dịch
</ActionButton>
```

```jsx
// components/Header.jsx:139-145 — mobile: CHỈ đóng menu, không cuộn (SAI)
<ActionButton
  variant="primary"
  className="w-full justify-center"
  onClick={() => setMobileMenuOpen(false)}
>
  Kích Hoạt Chiến Dịch
</ActionButton>
```

### Đích

```jsx
// target — Header.jsx:139-145
<ActionButton
  variant="primary"
  className="w-full justify-center"
  onClick={() => {
    setMobileMenuOpen(false);
    const el = document.getElementById('lien-he');
    el?.scrollIntoView({ behavior: 'smooth' });
  }}
>
  Kích Hoạt Chiến Dịch
</ActionButton>
```

### Các bước

1. `Header.jsx:142` — thêm handler cuộn vào sau `setMobileMenuOpen(false);`.

### Ranh giới

- Chỉ sửa `onClick`; **không** đổi nhãn hay biến thể nút.
- Lưu ý: sau khi đóng menu, `scrollIntoView` chạy trên DOM đã cập nhật — nếu thấy không cuộn, bọc trong `requestAnimationFrame`.

### Kiểm chứng

- Trên mobile: mở menu → bấm "Kích Hoạt Chiến Dịch" → menu đóng **và** trang cuộn tới form liên hệ.

---

## #18 — Nhịp `py` đồng nhất giữa 5 phân khu

**Mức**: LOW · **Nhóm**: Cohesion

### Vấn đề

Năm phân khu dùng **cùng một** giá trị đệm dọc, làm mất nhịp điệu lặng↔nén:

| File | Dòng |
|---|---|
| `B2BSolutionsSection.jsx` | `:40` |
| `PauseEditorialSection.jsx` | `:38` |
| `HowItWorksSection.jsx` | `:40` |
| `GigWorkerSection.jsx` | `:53` |
| `TrustSecuritySection.jsx` | `:40` |

Tất cả đều: `py-24 md:py-32`.

### Đích

Luân chuyển giữa hai mức — **nén** `py-12 md:py-16` (3–5rem) và **lặng** `py-40 md:py-56` (10–16rem). Gợi ý phân bổ:

- `SocialProofSection` → nén (đã là `py-14`, giữ)
- `B2BSolutionsSection` → lặng: `py-40 md:py-56`
- `PauseEditorialSection` → lặng: `py-40 md:py-56` (đây là "khoảng lặng biên tập", cần rộng)
- `HowItWorksSection` → nén: `py-12 md:py-16`
- `GigWorkerSection` → lặng: `py-40 md:py-56`
- `TrustSecuritySection` → nén: `py-12 md:py-16`

### Các bước

1. Sửa lớp `py-*` của 5 phân khu theo bảng trên.
2. Chạy `npm run audit` (script `anti-slop-audit`) để kiểm tra `LAY-02`.

### Ranh giới

- **Không** đổi `px-[6vw]` (đệm ngang giữ nguyên).
- **Không** đổi nội dung hay bố cục bên trong.

### Kiểm chứng

- Cuộn toàn trang → cảm nhận rõ nhịp nhanh–chậm, không đều đều như trước.
- `npm run audit` → 0 lỗi.

---

# CƠ HỘI BỊ BỎ LỠ (bổ sung, không phải sửa lỗi)

Bốn chỗ **chưa** animate nhưng nên — đây là hạng mục *cộng thêm*, không thuộc 18 vấn đề trên:

1. **Chuyển tab trong `LookerApp`** (`setActiveTab`, `:156`) — nội dung tab teleport hoàn toàn. Một fade chéo 150ms (`opacity`, `var(--ease-expo)`) sẽ nối liền hai trạng thái. Tab là tương tác *occasional* → được phép.

2. **`DemoNavigator` mở/đóng** (`:12`, `isOpen &&`) — panel render có/không. Với công cụ demo thì việc không animate là **hợp lý** theo bảng tần suất; nếu muốn, thêm `@starting-style` fade 150ms là đủ.

3. **Header mobile drawer** (`Header.jsx:97`) — cùng tình trạng `mobileMenuOpen &&`. Đây là điều hướng lặp lại nhiều lần/ngày → theo skill nên **giữ nhẹ hoặc bỏ hẳn animation**. Không khuyến nghị thêm.

4. **Thanh tiến trình/nộp báo cáo trong modal camera** (`handleSubmitProof`, `:251-262`) — hiện chỉ có chữ "Đang xử lý...". Tín hiệu chờ dạng spinner hoặc thanh tiến trình sẽ cho phản hồi rõ hơn. Đây là khoảnh khắc *rare* → được phép dùng ngân sách delight.

---

# THỨ TỰ THỰC THI ĐỀ XUẤT

| Lô | Vấn đề | Lý do thứ tự |
|---|---|---|
| **1** | #5, #14, #7 | Sửa token thiếu + đơn vị viewport — rủi ro thấp, độc lập, sửa nhanh |
| **2** | #3 | Một chỗ, tách biệt hoàn toàn, hiệu quả hiệu năng cao |
| **3** | #4 rồi #1 | #1 tạo ra `.modal-panel` mà #4 nhắc tới — **làm #1 trước #4** |
| **4** | #6, #13 | Dọn `transition-all` và token hoá — cùng chủ đề |
| **5** | #2 rồi #11 | #11 bổ sung vào đúng bộ handler của #2 — **làm #2 trước #11** |
| **6** | #8, #9, #12 | Việc accessibility, độc lập |
| **7** | #10, #15, #16, #17, #18 | Tinh chỉnh cuối |

**Phụ thuộc giữa các vấn đề:**

- **#1 → #4** (lớp `.modal-panel`/`.modal-backdrop`)
- **#2 → #11** (cùng handler kéo)
- **#5 → #14** (cùng gốc: thiếu token `paper-*`)

**Tổng**: 18 vấn đề — 5 HIGH, 7 MEDIUM, 6 LOW. Toàn bộ chỉ sửa thuộc tính chuyển động, lớp CSS, token; **không cần thêm dependency nào**.
