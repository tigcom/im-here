# Danh sách vấn đề UI — 23 màn hình nền tảng (admin / client / looker / auth)

> **Nguồn**: audit UI + frontend theo skill `emilkowalski/skills` (`emil-design-eng`, `review-animations`, `mobile-native`).
> **Commit khi audit**: `7073fdf` (working tree có thay đổi chưa commit)
> **Bổ sung cho**: `docs/UI-REVIEW-ISSUES.md` (đã lỗi thời — xem mục 0).
> **Trạng thái**: chưa sửa gì.

---

## Hướng dẫn cho agent thực thi

1. **Đọc mục 0 trước** — nhiều thứ bạn định sửa đã xong rồi.
2. Trước khi sửa bất kỳ dòng nào, **mở file xác nhận mã tại `file:line` đúng như tài liệu này**. Nếu khác → **DỪNG và báo lại**, không tự ứng biến. Repo đã drift sau commit `7073fdf`.
3. Chỉ sửa lớp CSS / thuộc tính / handler / nhãn. **Không** đổi cấu trúc JSX, trừ khi bước ghi rõ.
4. **Không thêm dependency.** Không dựng backend (ngoài phạm vi giai đoạn này).

**Quy ước repo** (đọc trước khi sửa):

- Token màu hợp lệ: `paper-000/100/200/300`, `ink-900/700/500/300`, `surface-950/900/800/700`, `on-surface-900/700/500/300`, `accent`, `accent-hover`, `accent-blue`, `accent-orange`, `accent-amber`, `rule-subtle`, `rule-strong`, `rule-dark`. **Không có** `paper-50`, `paper-400`, `ink-7`.
- Token chuyển động (`globals.css:57-65`): `--ease-expo`, `--dur-micro`, `--dur-ui`.
- Ví dụ mẫu ĐÚNG: `styles/button.css:31-35` — khai báo từng thuộc tính, không `all`.

---

## 0. ĐÃ XONG — đừng làm lại

Bản sửa từ `docs/UI-REVIEW-ISSUES.md` **đã được thực thi và kiểm chứng đúng**:

| Việc | Trạng thái |
|---|---|
| Modal có animation thật (thay `animate-in`) | ✔ `globals.css:279-303` có `.modal-panel` / `.modal-backdrop` / `@starting-style` |
| Bottom sheet kéo bằng `transform` + rAF, damping, chống đa chạm | ✔ `LookerApp.jsx:188-260` |
| Bỏ animate `borderRadius` khi pin+scrub | ✔ đã bỏ khỏi `EditorialShowcaseSection.jsx` |
| Reduced-motion không còn giết mọi transition | ✔ `globals.css` |
| `bg-paper-50`, `hover:bg-paper-400` | ✔ không còn |
| `h-screen` / `min-h-screen` | ✔ không còn |
| `transition-all` trong `LookerApp.jsx` | ✔ 0 chỗ |
| Modal a11y (Esc / backdrop / focus trap) trong LookerApp | ✔ có `useModalA11y` (`LookerApp.jsx:184-186`) |
| `animate-ping` | ✔ giảm từ 11 → 5 |

> `docs/UI-REVIEW-ISSUES.md` giờ **lỗi thời** — nên xoá hoặc thêm ghi chú "DONE" ở đầu, kẻo agent khác làm lại việc đã xong.

**Di sản nhỏ còn sót** (dọn kèm khi tiện): các `className` có **khoảng trắng đôi** ở chỗ lớp bị xoá — `LookerApp.jsx:878, 965, 1073`.

---

## 1. Bảng ưu tiên

| # | Mức | Nhóm | Vị trí | Vấn đề |
|---|---|---|---|---|
| 1 | 🔴 HIGH | Token | `client/dashboard:338` | `text-ink-7 cơ` — chữ tiếng Việt lọt vào className, token sai |
| 2 | 🔴 HIGH | Dead UI | `admin/fraud:94,101` | 2 nút khác nhau ("Xoá cảnh báo" / "Khoá vĩnh viễn") dùng **cùng một handler** |
| 3 | 🔴 HIGH | Dead UI | `client/billing:173` | Nút "Tải Bảng Kê Thuế (PDF)" không có `onClick` |
| 4 | 🔴 HIGH | Điều hướng | 5 chỗ | Link `/client/campaigns/1/review` hardcode — mọi chiến dịch mở cùng một trạm |
| 5 | 🔴 HIGH | Điều hướng | `looker/*` | 4 màn hình mồ côi, không có lối vào |
| 6 | 🔴 HIGH | Nội dung | `onboarding`, `training` | Tuyên bố OCR / Face Match / "5 câu" — không có thật, gây hiểu sai |
| 7 | 🟠 MED | CSS | 21 file | `transition-all` — 59 chỗ |
| 8 | 🟠 MED | Trạng thái | `campaigns/new` | Stepper cho nhảy bước; form không validate |
| 9 | 🟠 MED | Trạng thái | `workforce:82` | Toggle khoá tài khoản biến thẳng `PENDING_REVIEW` → `VERIFIED` |
| 10 | 🟠 MED | A11y | nhiều modal | Modal ngoài LookerApp thiếu Esc / backdrop / `role="dialog"` |
| 11 | 🟠 MED | A11y | mobile | `hover:` không gate trên cảm ứng |
| 12 | 🟠 MED | A11y | nhiều input | Ô nhập thiếu `<label>` / `aria-label` |
| 13 | 🟠 MED | Dead UI | `LookerApp`, `onboarding` | Nút không handler (định vị, "Xem tất cả", 3 mục Settings, "Chạm để chụp lại") |
| 14 | 🟠 MED | Điều hướng | 2 layout | Active nav khớp tuyệt đối → không highlight ở route con |
| 15 | 🟡 LOW | Code | nhiều file | Import không dùng; dead data; `progress` nên derive |
| 16 | 🟡 LOW | Hiển thị | nhiều file | Dữ liệu mock vênh giữa các màn hình (xem mục 6) |

---

## 2. CSS & Token

### 2.1 Class rác `text-ink-7 cơ` — HIGH

```jsx
// app/client/dashboard/page.jsx:338 — current
<div className="p-4 rounded-2xl bg-paper-200 border border-rule-subtle text-xs text-ink-7 cơ space-y-2">
```

Chữ "cơ" tiếng Việt lọt vào `className` (lỗi copy-paste), và `text-ink-7` không phải token (đúng là `ink-700`). Cả hai lớp đều không tồn tại → chữ không nhận màu.

```jsx
// target
<div className="p-4 rounded-2xl bg-paper-200 border border-rule-subtle text-xs text-ink-700 space-y-2">
```

### 2.2 `transition-all` — 59 chỗ / 21 file — MEDIUM

`transition-all` animate cả thuộc tính layout → tốn hơn và dễ giật. Sửa thành danh sách thuộc tính cụ thể (theo mẫu `styles/button.css:31-35`).

Phân bố:

| File | Số chỗ | Gợi ý thay |
|---|---|---|
| `app/login/page.jsx` | 8 | `transition-[transform,background-color,border-color]` |
| `app/role-select/page.jsx` | 6 | `transition-[transform,border-color]` (thẻ) · `transition-transform` (icon) |
| `app/admin/qa/page.jsx` | 5 | `transition-colors` |
| `app/client/dashboard/page.jsx` | 5 | `transition-[transform,box-shadow]` |
| `app/looker/task/[id]/execute/page.jsx` | 5 | `transition-colors` / `transition-transform` |
| `components/DemoNavigator.jsx` | 5 | `transition-[transform,border-color]` |
| `app/client/campaigns/new/page.jsx` | 4 | `transition-[transform,border-color]` |
| `app/client/campaigns/page.jsx` | 4 | `transition-[transform,box-shadow]` |
| `app/client/campaigns/[id]/review/page.jsx` | 4 | `transition-colors` |
| `app/client/billing/page.jsx` | 3 | `transition-colors` |
| `app/looker/onboarding/page.jsx` | 3 | `transition-colors` |
| `app/register/page.jsx` | 3 | `transition-[transform,border-color]` |
| `components/auth/QuickRoleSwitcher.jsx` | 2 | `transition-transform` |
| `app/client/layout.jsx` | 2 | `transition-colors` |
| `admin/dashboard`, `admin/finance`, `admin/layout`, `admin/workforce` | 1 mỗi file | tuỳ ngữ cảnh |
| `client/settings`, `looker/training` | 1 mỗi file | `transition-colors` |

**Cách làm**: với mỗi chỗ, xác định phần tử thực sự đổi gì khi hover/active rồi chỉ khai báo thuộc tính đó. Không đổi `duration-*` / easing hiện có.

### 2.3 `hover:` không gate trên cảm ứng — MEDIUM

Trên thiết bị cảm ứng, `:hover` kích hoạt khi tap và **dính lại**. Cần gate bằng biến thể tuỳ chỉnh.

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

Áp dụng cho các phần tử **chỉ có trên mobile** — ưu tiên: thanh điều hướng dưới của `LookerApp` (`:835-845`), nút ví trên header mobile (`:376-383`), drawer điều hướng của `admin/layout` và `client/layout`.

Với nút trên thanh điều hướng dưới, thêm `active:scale-95` để có phản hồi nhấn đúng trên cảm ứng.

---

## 3. Nút / handler chết

| # | Vị trí | Vấn đề | Cách sửa |
|---|---|---|---|
| 3.1 | `app/admin/fraud/page.jsx:94,101` | Nút **"Bỏ qua cảnh báo"** và **"Xác Nhận Khoá Vĩnh Viễn"** gọi **cùng** `handleDismiss(item.id)` → cả hai chỉ xoá card khỏi màn hình | Tách 2 handler. Nút "Khoá vĩnh viễn" phải đổi trạng thái đối tượng (vd thêm cờ `suspended: true`) chứ không chỉ ẩn card. Nếu chưa có nơi lưu, ít nhất đổi nhãn nút thành đúng việc nó làm |
| 3.2 | `app/client/billing/page.jsx:173` | `<button>` "Tải Bảng Kê Thuế & Sao Kê (PDF)" không có `onClick` | Thêm `onClick` (xuất CSV/JSON từ dữ liệu đang hiển thị) hoặc thêm `disabled` + `title="Chưa khả dụng"` |
| 3.3 | `app/looker/onboarding/page.jsx:127,174` | "Chạm để chụp lại" là `<div>` không handler — ở bước quan trọng nhất của KYC | Đổi sang `<button type="button">` có handler, hoặc bỏ chữ gợi ý nếu không làm được |
| 3.4 | `app/looker/training/page.jsx:133,162-175` | Nhãn "Làm Bài Test Mở Khoá Ngay **(5 câu)**" nhưng modal chỉ 1 câu; **cả hai đáp án A và B** đều gọi `handleFinishTest` và luôn cho **10/10 điểm** | Sửa nhãn cho khớp số câu thật; đáp án sai phải **không** cho qua |
| 3.5 | `components/mobile/LookerApp.jsx:470-472` | Nút định vị trên bản đồ không `onClick` | Thêm handler hoặc `disabled` |
| 3.6 | `components/mobile/LookerApp.jsx:706` | "Xem tất cả" (lịch sử giao dịch) không handler | Thêm điều hướng hoặc `disabled` |
| 3.7 | `components/mobile/LookerApp.jsx:801-815` | 3 mục Settings (Thông báo / Bảo mật 2 lớp / Hỗ trợ) đều không `onClick` | Thêm handler hoặc `disabled` + nhãn "Sắp có" |
| 3.8 | `app/admin/workforce/page.jsx:82` | Toggle khoá: `kycStatus === 'SUSPENDED' ? 'VERIFIED' : 'SUSPENDED'` → user `PENDING_REVIEW` bị mở khoá sẽ thành **VERIFIED**, tức duyệt eKYC ngoài luồng | Tách 2 thao tác: "Khoá/Mở khoá" không được đổi `kycStatus`. Trạng thái phải đủ 3 giá trị `PENDING_REVIEW / VERIFIED / SUSPENDED` |
| 3.9 | `app/admin/workforce/page.jsx:258-265` | Nút "Phê Duyệt eKYC" hiện cả khi đã VERIFIED hoặc đang SUSPENDED | Chỉ render khi `kycStatus === 'PENDING_REVIEW'`; thêm nút "Từ chối" |
| 3.10 | `app/admin/finance/page.jsx:74-83` | Danh sách tiêu đề "Chờ Phê Duyệt" nhưng chứa cả lệnh `status: 'APPROVED'` | Lọc `status === 'PENDING'` |
| 3.11 | `app/admin/finance/page.jsx` | Chỉ có nhánh Duyệt, không có Từ chối | Thêm nút Từ chối + trạng thái `REJECTED` |
| 3.12 | `app/admin/qa/page.jsx:269` | Nút "Yêu Cầu Chụp Lại" đặt `QA_REJECTED` nhưng badge chỉ phân nhánh `QA_APPROVED`/`FRAUD_FLAGGED`/else → `QA_REJECTED` rơi vào nhánh "Chờ Thẩm Định", item không rời hàng đợi | Thêm nhánh hiển thị `QA_REJECTED`; đưa item ra khỏi queue |

---

## 4. Điều hướng

### 4.1 Link hardcode campaign 1 — HIGH

Năm chỗ trỏ cứng về `/client/campaigns/1/review`, nên **mọi chiến dịch đều mở cùng một trạm duyệt**:

```jsx
// app/client/campaigns/page.jsx:233 — current (trong filtered.map(camp))
href={`/client/campaigns/1/review`}

// app/client/dashboard/page.jsx:261 — current (trong recentCampaigns.map)
href={`/client/campaigns/1/review`}

// app/client/dashboard/page.jsx:283 — current
href="/client/campaigns/1/review"

// app/client/dashboard/page.jsx:326 — current
href={`/client/campaigns/1/review`}

// app/client/layout.jsx:33 — mục sidebar
{ label: 'Duyệt Nghiệm Thu', href: '/client/campaigns/1/review', icon: CheckSquare },
```

**Đích**: dùng `camp.id` thật — `` href={`/client/campaigns/${camp.id}/review`} ``. Với mục sidebar, trỏ về danh sách `/client/campaigns`.

Thêm: `app/client/campaigns/page.jsx:232-238` — nút "Duyệt Ảnh" vẫn hiện với chiến dịch `COMPLETED`; cần ẩn khi đã kết thúc.

### 4.2 Màn hình mồ côi — HIGH

Không có `href` / `router.push` nào trỏ tới 4 route này (grep toàn repo, loại `.next/`):

- `app/looker/history/page.jsx`
- `app/looker/training/page.jsx`
- `app/looker/notifications/page.jsx`
- `app/looker/task/[id]/execute/page.jsx` ← quan trọng nhất, là luồng nghiệp vụ chính

`LookerApp.jsx` không có link tới lịch sử / đào tạo / thông báo, và nút Camera mở **modal riêng** thay vì điều hướng tới màn `execute`.

**Đích**: thêm lối vào từ `LookerApp` (mục "Lịch sử" ở tab Cá Nhân → `/looker/history`; mục "Đào tạo" → `/looker/training`; chuông thông báo → `/looker/notifications`). Quyết định nút Camera dùng modal hay màn `execute` — **không để cả hai**.

Ngoài ra `app/app/page.jsx` (14 dòng, demo cũ) cũng mồ côi — nên xoá hoặc thêm link.

### 4.3 Active nav khớp tuyệt đối — MEDIUM

```jsx
// app/client/layout.jsx:104 — current
const isActive = pathname === item.href;

// app/admin/layout.jsx:90 — current
const isActive = pathname === item.href;
```

Ở `/client/campaigns/new` hoặc `/client/campaigns/1/review`, mục "Chiến Dịch" **không** được highlight.

```jsx
// target
const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
```

### 4.4 Stepper cho nhảy bước — MEDIUM

```jsx
// app/client/campaigns/new/page.jsx:106 — current
onClick={() => setCurrentStep(st.number)}
```

Bấm thẳng "Bước 04" khi bước 1–3 chưa nhập.

```jsx
// target — chỉ cho nhảy tới bước đã đi qua
onClick={() => { if (st.number <= visitedStep) setCurrentStep(st.number); }}
```

(Thêm state `visitedStep`, cập nhật khi bấm "Tiếp Tục".)

### 4.5 Modal đóng được — MEDIUM

`LookerApp` đã có `useModalA11y` ✔. **Nhưng các modal nơi khác thì chưa**:

- `app/client/billing/page.jsx:236` (modal nạp quỹ) — không `role="dialog"`, không Esc, backdrop không `onClick`
- `app/admin/layout.jsx` drawer điều hướng mobile — không Esc, không focus trap
- `app/client/layout.jsx` drawer tương tự

**Đích**: dùng lại đúng mẫu `useModalA11y` đã có ở `LookerApp.jsx` — copy sang, thêm `role="dialog" aria-modal="true"`, đóng bằng Esc và click backdrop.

---

## 5. Khả năng tiếp cận

| # | Vị trí | Vấn đề | Sửa |
|---|---|---|---|
| 5.1 | `app/client/campaigns/page.jsx:137-143` | Ô tìm kiếm chỉ có `placeholder`, không `<label>`/`aria-label` | Thêm `aria-label="Tìm kiếm chiến dịch"` |
| 5.2 | `app/client/campaigns/[id]/review/page.jsx:335-341` | Ô nhập lý do chụp lại không label | Thêm `aria-label` |
| 5.3 | `app/looker/task/[id]/execute/page.jsx` | Nhiều ô nhập thiếu label | Thêm `aria-label` |
| 5.4 | `app/client/billing/page.jsx:245-251` | Nút ✕ đóng modal không `aria-label` | Thêm `aria-label="Đóng"` |
| 5.5 | `app/client/campaigns/[id]/review/page.jsx:261,289` | `alt="Live proof"` / `alt="Thumb"` — vô nghĩa | Mô tả nội dung ảnh thật |
| 5.6 | nhiều file | `<img>` thiếu `width`/`height` → layout shift; ảnh ngoài (unsplash) không qua `next/image` | Thêm `width`/`height`, hoặc `next/image` cho ảnh nội bộ |
| 5.7 | `app/client/campaigns/page.jsx:165-244` | Lọc rỗng → vùng trống, không thông báo | Thêm empty state |

---

## 6. Dữ liệu hiển thị vênh giữa các màn hình

> **Đây là vấn đề UI, không phải vấn đề backend.** Ở giai đoạn demo, dữ liệu hiển thị phải **tự nhất quán** — người xem demo thấy cùng một nhiệm vụ ở ba trạng thái sẽ kết luận giao diện bị lỗi.
>
> **Cần một quyết định của con người trước khi sửa**: chọn một giá trị chuẩn cho mỗi mục dưới đây, rồi sửa mọi màn hình theo giá trị đó. Đừng sửa lẻ.

| Mục | Giá trị A | Giá trị B | Ghi chú |
|---|---|---|---|
| `TASK-8801` trạng thái | `AVAILABLE` (`LookerApp:45`) | `APPROVED` + hoàn tất 12/10 (`looker/history:15`) · đang thực thi (`execute:25`) | Cùng 1 task ở **3 trạng thái** |
| `TASK-8790` | Co.op Food, **75.000đ** (`looker/history:20-26`) | Circle K Bùi Viện, **110.000đ** (`LookerApp:128-133`) | Khác khách + địa điểm + tiền |
| Số nhiệm vụ của looker | **142** (`LookerApp:763`) | **84** (`training:85`) | |
| Tên looker | "Nguyễn Văn An" (`LookerApp:402,756`) | "Nguyễn Văn Thành" (`AuthContext:11`, `onboarding:25`) · "NGUYEN VAN THANH" (`execute:212`) | **3 tên** cho 1 người |
| Điểm đang khảo sát | **320** (`client/dashboard:28`) | Tổng thật của 4 chiến dịch = **350** | |
| Ngân sách đã chi | **24.140.000đ** (`client/dashboard:52`, `billing:156`) | **44.025.000đ** (tổng `campaigns`) | |
| Số điểm 1 chiến dịch | **50** (`campaigns/new:33`) | **120** (`campaigns:28-30`, `dashboard:64-66`) | Cùng chiến dịch Heineken |
| Badge QA | **12** (`admin/layout:30`, `admin/dashboard`) | **2** (hàng đợi thật) | Badge hardcode |
| Badge workforce | **5** (`admin/layout:31`) | **1** (hồ sơ chờ thật) | |
| Badge thông báo client | **3** (`client/layout:35`) | Không đổi sau `markAllAsRead` | |
| Ví looker "Hôm nay" | **+345.000đ** (`LookerApp:670`) | Lịch sử chỉ có **+110.000đ** (`LookerApp:129`) | Không suy ra được |
| Tài chính admin | Giữ 2.45B · phí 245M · đã trả 1.82B | 1.82B + 245M = 2.065B ≠ 2.45B | Thiếu **385 triệu** |
| Đối tượng cảnh báo gian lận | `USR-LK-9950` (`fraud:21`) | Không tồn tại (chỉ có 9921–9924) | |

**Cách sửa đề xuất**: tạo một file dữ liệu dùng chung, ví dụ `lib/mock-data.js`, export các mảng `TASKS`, `LOOKERS`, `CAMPAIGNS`, `TRANSACTIONS`, `QA_QUEUE`, `FRAUD_ALERTS`… rồi mọi màn hình `import` từ đó thay vì khai báo `useState([...])` riêng. Đây **không phải backend** — chỉ là một module JS, nhưng nó xoá sạch cả bảng trên.

---

## 7. Chất lượng code frontend

| # | Vấn đề | Vị trí | Sửa |
|---|---|---|---|
| 7.1 | Import không dùng | `admin/dashboard` (5), `admin/layout` (3), `admin/qa` (7), `admin/workforce` (8), `admin/fraud` (4), `admin/finance` (5), `client/dashboard` (5), `client/campaigns` (5), `client/campaigns/new`, `client/review` (5), `looker/execute`, `looker/training` | Xoá |
| 7.2 | `progress` là hằng số nhưng suy ra được | `client/campaigns:38,54,70,86,102` | `Math.round(pointsCompleted / pointsTotal * 100)` |
| 7.3 | Dữ liệu chết | `execute:45-46` (`outOfStock`, `note`), `qa:34` (`isMockGpsSuspected`), `billing:31,42,52,63` (`fee`), `campaigns/new:34` (`storeListFile`) | Render hoặc xoá |
| 7.4 | `selectedItem` có thể `undefined` | `admin/qa:74-75` — `qaQueue.find(...) \|\| qaQueue[0]`, nếu queue rỗng sẽ throw ở `:175` | Thêm guard |
| 7.5 | Số liệu bịa trong modal | `admin/workforce:232` — "98.8%" hardcode cho mọi looker | Suy ra từ `completedTasks` |
| 7.6 | `useState` cho dữ liệu nên derive | nhiều file | Chuyển sang biến dẫn xuất |
| 7.7 | Vùng upload là `<div>` tĩnh | `campaigns/new:197-209` — không `<input type="file">`, không `onClick` | Thêm input thật hoặc ghi rõ "Demo" |

---

## 8. Nội dung hiển thị (UI copy) — cần người quyết

> Đây là **chữ hiển thị trên giao diện**, nên thuộc phạm vi UI. Ở giai đoạn demo chưa có backend, các dòng dưới đây đang khẳng định những điều chưa tồn tại. Rủi ro là **tin cậy và pháp lý**, không phải kỹ thuật.

| Chỗ | Nội dung hiện tại | Vấn đề |
|---|---|---|
| `components/sections/PauseEditorialSection.jsx:79` | "ISO 27001 Certified" | Chứng nhận khẳng định |
| `components/sections/TrustSecuritySection.jsx` | "PCI-DSS Ready", "SHA-256 EXIF" | Chứng nhận khẳng định |
| `components/Footer.jsx:115` | "Mã số DN: 0108923482 do Sở KH&ĐT TP. Hà Nội cấp" | Số đăng ký doanh nghiệp cụ thể |
| `app/looker/onboarding/page.jsx:142,221` | "OCR tự động trích xuất", "Face Match · Khớp 99.2%", "PCI-DSS" | Tính năng + chứng nhận |
| `app/looker/training/page.jsx:133` | "(5 câu)" nhưng có 1 câu | Nhãn sai |
| `app/admin/finance/page.jsx:70` vs tiêu đề | "9Pay" ở tiêu đề, "VietQR" ở phụ đề | Trộn 2 kênh thanh toán |
| `app/client/billing/page.jsx:162-165` | "Thuế GTGT khấu trừ: 241.400đ" | Không nêu rõ base tính |

**Đề xuất**: chọn một trong hai —

- **(a)** Giữ nguyên kịch bản demo nhưng thêm nhãn **"DEMO"** rõ ràng và chuyển các câu khẳng định sang dạng dự kiến ("Chuẩn bị đạt ISO 27001"), gỡ số đăng ký doanh nghiệp.
- **(b)** Gỡ hẳn các dòng chứng nhận/số pháp lý khỏi giao diện.

---

## 9. Thứ tự thực thi

| Lô | Việc | Lý do |
|---|---|---|
| **1** | #1 (class rác), #3 (nút PDF), #14 (active nav) | Sửa 1 dòng, rủi ro bằng 0 |
| **2** | #7 (`transition-all` 59 chỗ) | Cơ học, không đổi thị giác, kiểm chứng bằng grep |
| **3** | #4 (link hardcode), #5 (màn mồ côi) | Điều hướng — cần thống nhất trước khi sửa |
| **4** | #3.5–#3.12 (nút chết, trạng thái) | Cần quyết định hành vi đúng cho từng nút |
| **5** | #10, #11, #12 (a11y) | Độc lập |
| **6** | **Mục 6** (dữ liệu vênh) | **Cần bạn chọn giá trị chuẩn trước** → tốt nhất là gom về `lib/mock-data.js` |
| **7** | #15, #16, mục 8 (code + copy) | Tinh chỉnh cuối |

**Phụ thuộc**: Lô 6 (gom dữ liệu) nên làm **trước** Lô 4, vì nhiều nút chết chỉ hoạt động đúng khi có nguồn dữ liệu chung.

---

## 10. Ba việc cần con người quyết trước khi agent sửa

1. **Mục 6** — chọn giá trị chuẩn cho 13 mục dữ liệu vênh (hoặc cho phép gom vào `lib/mock-data.js`).
2. **Mục 8** — chọn (a) thêm nhãn DEMO + hạ tông, hay (b) gỡ hẳn chứng nhận/số pháp lý.
3. **Mục 4.2** — nút Camera của LookerApp: dùng **modal** hay điều hướng tới màn `task/[id]/execute`? Hiện đang có cả hai, gây trùng lặp luồng.
