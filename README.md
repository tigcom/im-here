# TÔI ĐÂY

> **"Ở đó, có tôi đây."**

Nền tảng kết nối người cần thuê ai đó đến một địa điểm thực hiện việc thay mình, với người sẵn sàng nhận việc tại khu vực đó. Điểm cốt lõi: **xác minh người thật sự có mặt tại chỗ**, thực hiện công việc và gửi bằng chứng về.

---

## Mục lục

- [Giới thiệu](#giới-thiệu)
- [Kiến trúc hệ thống](#kiến-trúc-hệ-thống)
- [Cấu trúc dự án](#cấu-trúc-dự-án)
- [Công nghệ sử dụng](#công-nghệ-sử-dụng)
- [Yêu cầu môi trường](#yêu-cầu-môi-trường)
- [Hướng dẫn cài đặt](#hướng-dẫn-cài-đặt)
- [Biến môi trường](#biến-môi-trường)
- [Chạy development](#chạy-development)
- [Build production](#build-production)
- [Tài liệu](#tài-liệu)
- [Quy ước code](#quy-ước-code)

---

## Giới thiệu

**TÔI ĐÂY** là marketplace kết nối hai nhóm người dùng:

| Vai trò | Mô tả |
|---|---|
| **Người thuê** | Đăng nhiệm vụ, chọn địa điểm, đặt cọc tiền, nhận bằng chứng |
| **Người nhận việc** | Xem nhiệm vụ gần vị trí, nhận việc, đến nơi, thực hiện và gửi bằng chứng |

Một tài khoản có thể sử dụng cả hai vai trò.

### Ví dụ sử dụng

- Thuê người đến xem phòng trọ ở tỉnh khác, quay video và báo cáo
- Thuê người đến nhận hàng, kiểm tra và xác nhận
- Thuê người kiểm tra xe/điện thoại cũ trước khi mua
- Thuê người xác nhận tình trạng thực tế tại một địa điểm

---

## Kiến trúc hệ thống

```
┌──────────────────────────────────────────────────────┐
│               NGƯỜI DÙNG CUỐI                        │
│     Mobile App (iOS & Android)  |  Website           │
└──────────────────────┬───────────────────────────────┘
                       │ HTTPS / REST API / WebSocket
                       ▼
┌──────────────────────────────────────────────────────┐
│                  API SERVER (NestJS)                 │
│  Auth · Task · GPS · Payment · Chat · Notification   │
│  Evidence · Rating · Dispute · Fraud · Admin         │
└────────────┬───────────────┬───────────────┬─────────┘
             │               │               │
             ▼               ▼               ▼
      ┌────────────┐  ┌─────────────┐  ┌──────────┐
      │ PostgreSQL │  │ File Storage│  │  Redis   │
      │  Database  │  │  (S3 / R2)  │  │  Cache   │
      └────────────┘  └─────────────┘  └──────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────┐
│                 ADMIN DASHBOARD (React)              │
│   User · Task · Payment · Dispute · Fraud · Config   │
└──────────────────────────────────────────────────────┘
```

### 3 trụ cột kỹ thuật

1. **Task Engine** — Quản lý toàn bộ vòng đời nhiệm vụ, kiểm soát trạng thái
2. **Payment & Ledger Engine** — Xử lý tiền, escrow, phí, hoàn tiền, giải ngân
3. **Trust & Safety Engine** — GPS check-in, bằng chứng, tranh chấp, risk, audit log

---

## Cấu trúc dự án

```
im-here/
├── apps/
│   ├── mobile/          # Flutter app (iOS & Android)
│   ├── admin/           # React admin dashboard
│   └── web/             # Next.js website
│
├── backend/
│   └── src/
│       ├── modules/
│       │   ├── auth/        # Xác thực, OTP, session
│       │   ├── user/        # Hồ sơ, xác minh, thiết bị
│       │   ├── task/        # Tạo, tìm, quản lý nhiệm vụ
│       │   ├── matching/    # Tìm người gần địa điểm
│       │   ├── checkin/     # GPS check-in, phát hiện bất thường
│       │   ├── evidence/    # Upload ảnh/video bằng chứng
│       │   ├── chat/        # Chat real-time WebSocket
│       │   ├── payment/     # Đặt cọc, escrow, giải ngân, ledger
│       │   ├── withdrawal/  # Yêu cầu rút tiền
│       │   ├── rating/      # Đánh giá sau nhiệm vụ
│       │   ├── dispute/     # Mở và xử lý tranh chấp
│       │   ├── notification/# Push notification, in-app
│       │   ├── fraud/       # Risk score, phát hiện gian lận
│       │   └── admin/       # Admin APIs, RBAC
│       ├── common/          # Guards, decorators, pipes, utils
│       ├── config/          # Cấu hình môi trường
│       └── database/
│           ├── migrations/  # Database migrations
│           └── seeds/       # Seed data
│
├── docs/
│   ├── api/             # API documentation (Postman / Swagger)
│   ├── database/        # Database schema, ERD
│   ├── deployment/      # Hướng dẫn triển khai
│   └── assets/          # Ảnh, diagram
│
├── infrastructure/
│   ├── docker/          # Dockerfile, docker-compose
│   └── nginx/           # Nginx config
│
├── scripts/             # Helper scripts
├── .env.example         # Mẫu biến môi trường
├── .gitignore
└── README.md
```

---

## Công nghệ sử dụng

### Backend
| Thành phần | Công nghệ |
|---|---|
| Framework | NestJS (Node.js / TypeScript) |
| Database | PostgreSQL |
| Cache / Queue | Redis |
| File Storage | Cloudflare R2 hoặc Amazon S3 |
| Real-time Chat | WebSocket (Socket.io) |
| Authentication | JWT + Refresh Token |

### Frontend
| Thành phần | Công nghệ |
|---|---|
| Mobile App | Flutter |
| Admin Dashboard | React + Ant Design |
| Website | Next.js |

### Dịch vụ bên thứ 3
| Dịch vụ | Nhà cung cấp |
|---|---|
| Thanh toán / Escrow | PayOS / VNPay |
| Bản đồ / GPS | Google Maps Platform |
| Push Notification | Firebase Cloud Messaging |
| SMS OTP | SpeedSMS / ESMS |
| Email | Brevo / SendGrid |

---

## Yêu cầu môi trường

### Chung
- Node.js >= 18.x
- npm >= 9.x hoặc pnpm >= 8.x
- Docker & Docker Compose (khuyến nghị)

### Backend
- PostgreSQL >= 15
- Redis >= 7

### Mobile
- Flutter >= 3.x
- Dart >= 3.x
- Xcode (iOS) hoặc Android Studio (Android)

---

## Hướng dẫn cài đặt

### 1. Clone dự án

```bash
git clone <repository-url>
cd im-here
```

### 2. Cài đặt Backend

```bash
cd backend
npm install
cp ../.env.example .env
# Chỉnh sửa .env với thông tin thực tế
```

### 3. Khởi động database (Docker)

```bash
cd infrastructure/docker
docker-compose up -d postgres redis
```

### 4. Chạy migrations

```bash
cd backend
npm run migration:run
npm run seed:run   # (tùy chọn — seed dữ liệu mẫu)
```

### 5. Cài đặt Admin Dashboard

```bash
cd apps/admin
npm install
cp .env.example .env
```

### 6. Cài đặt Website

```bash
cd apps/web
npm install
cp .env.example .env
```

### 7. Cài đặt Mobile App

```bash
cd apps/mobile
flutter pub get
# Cấu hình firebase, google maps key trong android/ và ios/
```

---

## Biến môi trường

Xem file [`.env.example`](.env.example) để biết đầy đủ các biến cần thiết.

Các biến quan trọng:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/toiday

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=
JWT_REFRESH_SECRET=
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=30d

# File Storage
STORAGE_PROVIDER=r2          # r2 | s3
STORAGE_BUCKET=
STORAGE_ENDPOINT=
STORAGE_ACCESS_KEY=
STORAGE_SECRET_KEY=

# Payment (PayOS)
PAYOS_CLIENT_ID=
PAYOS_API_KEY=
PAYOS_CHECKSUM_KEY=
PAYOS_WEBHOOK_SECRET=

# Google Maps
GOOGLE_MAPS_API_KEY=

# Firebase
FIREBASE_PROJECT_ID=
FIREBASE_PRIVATE_KEY=
FIREBASE_CLIENT_EMAIL=

# SMS OTP
SMS_PROVIDER=speedsms        # speedsms | esms
SMS_API_KEY=

# Checkin
CHECKIN_RADIUS_METERS=100    # Bán kính cho phép check-in (mét)
TASK_CONFIRM_TIMEOUT_HOURS=24 # Giờ chờ người thuê xác nhận trước khi tự động xác nhận
```

> **Lưu ý bảo mật:** Không commit file `.env` lên git. Không hard-code bất kỳ secret nào trong source code.

---

## Chạy development

### Chạy tất cả cùng lúc (Docker Compose)

```bash
docker-compose -f infrastructure/docker/docker-compose.dev.yml up
```

### Chạy từng phần riêng

**Backend:**
```bash
cd backend
npm run start:dev
# API server: http://localhost:3000
# Swagger docs: http://localhost:3000/api/docs
```

**Admin Dashboard:**
```bash
cd apps/admin
npm run dev
# http://localhost:3001
```

**Website:**
```bash
cd apps/web
npm run dev
# http://localhost:3002
```

**Mobile App:**
```bash
cd apps/mobile
flutter run
```

---

## Build production

**Backend:**
```bash
cd backend
npm run build
npm run start:prod
```

**Admin / Web:**
```bash
npm run build
```

**Mobile:**
```bash
# Android
flutter build apk --release
# hoặc
flutter build appbundle --release

# iOS
flutter build ipa --release
```

---

## Tài liệu

| Tài liệu | Đường dẫn |
|---|---|
| API Reference (Swagger) | `/api/docs` khi chạy dev |
| Database Schema | `docs/database/` |
| Hướng dẫn triển khai | `docs/deployment/` |
| Danh sách tính năng MVP | `docs/` |

---

## Quy ước code

### Git Branch
```
main          — production
develop       — integration
feature/*     — tính năng mới
fix/*         — sửa lỗi
hotfix/*      — sửa khẩn cấp trên production
```

### Commit Message
```
feat: thêm GPS check-in validation
fix: sửa lỗi race condition khi nhận việc
chore: cập nhật dependencies
docs: bổ sung API docs cho task module
```

### Nguyên tắc bắt buộc

- **Client không được quyết định dữ liệu quan trọng** — backend luôn tự tính lại giá, trạng thái
- **Tiền luôn có Transaction + Ledger + Audit Log** — không UPDATE balance trực tiếp
- **Mọi hành động quan trọng phải truy ngược được** — audit log đầy đủ
- **Không hard-code** giá, phí, bán kính, timeout, API secret trong code
- **Soft delete** cho dữ liệu liên quan đến tài chính và tranh chấp

---

## Liên hệ

Dự án **TÔI ĐÂY** — `toiday.vn`
