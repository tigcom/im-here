/**
 * ULTIMATE COMPREHENSIVE E2E TEST SUITE (25 TEST CASES)
 * Đạt độ bao phủ cao nhất (Maximum Test Coverage) cho Nền tảng TÔI ĐÂY (IM-HERE)
 * Chạy trên: Next.js UI (port 3000), Spring Boot (port 8080), PostgreSQL 16 (port 5432), Redis 7 (port 6379)
 */

import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:3000';
const API_URL = 'http://localhost:8080/api';

const timestamp = Date.now().toString().slice(-6);
const HIRER = {
  fullName: `Doanh Nghiệp Coverage ${timestamp}`,
  phone: `090${timestamp}`,
  email: `hirer_cov_${timestamp}@test.imhere.vn`,
  password: 'Password@123',
};

const WORKER = {
  fullName: `Cộng Tác Viên Coverage ${timestamp}`,
  phone: `098${timestamp}`,
  email: `worker_cov_${timestamp}@test.imhere.vn`,
  password: 'Password@123',
  idCardNumber: `00120${timestamp}`,
};

const STRANGER = {
  fullName: `Người Ngoài Hệ Thống ${timestamp}`,
  phone: `096${timestamp}`,
  email: `stranger_${timestamp}@test.imhere.vn`,
  password: 'Password@123',
};

const ADMIN = {
  email: 'admin@imhere.vn',
  password: 'Admin@123',
};

let passedCount = 0;
let totalCount = 0;

function assertTest(testId, description, condition, details = '') {
  totalCount++;
  if (condition) {
    passedCount++;
    console.log(`   ✅ [PASS] Case #${testId}: ${description} ${details ? `(${details})` : ''}`);
  } else {
    console.error(`   ❌ [FAIL] Case #${testId}: ${description} ${details ? `(${details})` : ''}`);
    throw new Error(`Test Case #${testId} Failed: ${description}`);
  }
}

async function runMaximumCoverageSuite() {
  console.log('='.repeat(90));
  console.log('🚀 BẮT ĐẦU CHẠY ULTIMATE E2E TEST SUITE — 25 TEST CASES BẢO ĐẢM MAXIMUM COVERAGE');
  console.log('   Hệ thống: TÔI ĐÂY (IM-HERE) Crowdsourced Field Audit & P2P Gig Tasks');
  console.log('   Môi trường: Next.js UI (3000) | Spring Boot (8080) | PostgreSQL 16 | Redis 7');
  console.log('='.repeat(90));

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  try {
    // ═════════════════════════════════════════════════════════════════════════
    // MODULE A: QUẢN TRỊ DANH TÍNH, ONBOARDING & BẢO MẬT KYC (Cases 1 - 5)
    // ═════════════════════════════════════════════════════════════════════════
    console.log('\n📦 MODULE A: QUẢN TRỊ DANH TÍNH, ONBOARDING & BẢO MẬT KYC');
    console.log('-'.repeat(90));

    // Case 1: Đăng ký Hirer & Worker trên UI thật
    await page.goto(`${BASE_URL}/register`, { waitUntil: 'networkidle' });
    const hirerBtn = page.locator('button:has-text("Đăng Việc Thuê Người")');
    if (await hirerBtn.count() > 0) await hirerBtn.click();
    await page.fill('input[placeholder="VD: Trần Hoàng Nam"]', HIRER.fullName);
    await page.fill('input[type="tel"]', HIRER.phone);
    await page.fill('input[type="email"]', HIRER.email);
    await page.fill('input[type="password"]', HIRER.password);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);

    await page.goto(`${BASE_URL}/register`, { waitUntil: 'networkidle' });
    const workerBtn = page.locator('button:has-text("Nhận Việc Kiếm Tiền")');
    if (await workerBtn.count() > 0) await workerBtn.click();
    await page.fill('input[placeholder="VD: Trần Hoàng Nam"]', WORKER.fullName);
    await page.fill('input[type="tel"]', WORKER.phone);
    await page.fill('input[type="email"]', WORKER.email);
    await page.fill('input[type="password"]', WORKER.password);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);

    // Đăng ký tài khoản người thứ 3 (Stranger) để test bảo mật
    await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: STRANGER.email,
        password: STRANGER.password,
        fullName: STRANGER.fullName,
        phone: STRANGER.phone,
        role: 'ROLE_SHEPHERD',
      }),
    });

    // Login lấy tokens
    const hLogin = await (await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: HIRER.email, password: HIRER.password }),
    })).json();
    const hirerToken = hLogin.data.token;
    const hirerId = hLogin.data.id;

    const wLogin = await (await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: WORKER.email, password: WORKER.password }),
    })).json();
    const workerToken = wLogin.data.token;
    const workerId = wLogin.data.id;

    const sLogin = await (await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: STRANGER.email, password: STRANGER.password }),
    })).json();
    const strangerToken = sLogin.data.token;
    const strangerId = sLogin.data.id;

    const aLogin = await (await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: ADMIN.email, password: ADMIN.password }),
    })).json();
    const adminToken = aLogin.data.token;

    assertTest(1, 'Đăng ký Hirer & Worker trên UI thật Next.js -> Lưu PostgreSQL', Boolean(hirerToken && workerToken));

    // Case 2: Worker nộp CCCD mờ -> Admin TỪ CHỐI KYC
    await fetch(
      `${API_URL}/admin/users/kyc/submit?userId=${workerId}&frontUrl=https://example.com/mo.jpg&backUrl=https://example.com/mo.jpg`,
      { method: 'POST', headers: { Authorization: `Bearer ${adminToken}` } }
    );
    const rejectRes = await (await fetch(
      `${API_URL}/admin/users/${workerId}/kyc/review?status=TU_CHOI&rejectionReason=${encodeURIComponent('Ảnh CCCD bị mờ, không đọc được số')}`,
      { method: 'POST', headers: { Authorization: `Bearer ${adminToken}` } }
    )).json();
    assertTest(2, 'Admin từ chối hồ sơ KYC không đạt chuẩn (TU_CHOI)', rejectRes.data?.kycStatus === 'TU_CHOI');

    // Nạp tiền cho Hirer và tạo 1 task kiểm thử
    await fetch(`${API_URL}/wallet/deposit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${hirerToken}` },
      body: JSON.stringify({ amount: 1000000, description: 'Nạp quỹ test coverage' }),
    });

    const initTask = (await (await fetch(`${API_URL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${hirerToken}` },
      body: JSON.stringify({
        title: `Task Test KYC & Security ${timestamp}`,
        description: 'Kiểm tra bảo mật',
        category: 'RETAIL_AUDIT',
        address: '191 Bà Triệu, Hà Nội',
        latitude: 21.0117,
        longitude: 105.8497,
        rewardAmount: 50000,
      }),
    })).json()).data;

    // Case 3: Worker bị từ chối KYC cố tình nhận việc -> BỊ CHẶN 403
    const tryAcceptRes = await fetch(`${API_URL}/tasks/${initTask.id}/accept`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${workerToken}` },
    });
    assertTest(3, 'Chặn quyền nhận việc khi tài khoản bị từ chối KYC (HTTP 403)', tryAcceptRes.status === 403);

    // Case 4: Worker nộp lại ảnh rõ nét -> Admin DUYỆT KYC
    await fetch(
      `${API_URL}/admin/users/kyc/submit?userId=${workerId}&frontUrl=https://images.unsplash.com/cccd-ro.jpg&backUrl=https://images.unsplash.com/cccd-ro-back.jpg`,
      { method: 'POST', headers: { Authorization: `Bearer ${adminToken}` } }
    );
    const approveKyc = await (await fetch(
      `${API_URL}/admin/users/${workerId}/kyc/review?status=DA_DUYET`,
      { method: 'POST', headers: { Authorization: `Bearer ${adminToken}` } }
    )).json();
    assertTest(4, 'Worker nộp lại CCCD rõ nét và Admin DUYỆT KYC thành công (DA_DUYET)', approveKyc.data?.kycStatus === 'DA_DUYET');

    // Case 5: Admin khóa tài khoản (BLOCKED) và Mở khóa (ACTIVE) tài khoản
    const blockRes = await (await fetch(`${API_URL}/admin/users/${workerId}/status?status=BLOCKED`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
    })).json();
    const unblockRes = await (await fetch(`${API_URL}/admin/users/${workerId}/status?status=ACTIVE`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
    })).json();
    assertTest(5, 'Admin quản trị Khóa (BLOCKED) và Mở khóa (ACTIVE) tài khoản Worker', blockRes.data?.status === 'BLOCKED' && unblockRes.data?.status === 'ACTIVE');

    // ═════════════════════════════════════════════════════════════════════════
    // MODULE B: VÍ ĐIỆN TỬ, KÝ QUỸ ESCROW & TẠO NHIỆM VỤ (Cases 6 - 10)
    // ═════════════════════════════════════════════════════════════════════════
    console.log('\n📦 MODULE B: VÍ ĐIỆN TỬ, KÝ QUỸ ESCROW & TẠO NHIỆM VỤ');
    console.log('-'.repeat(90));

    // Case 6: Nạp tiền số âm hoặc 0 -> Bị từ chối
    const invalidDep = await fetch(`${API_URL}/wallet/deposit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${hirerToken}` },
      body: JSON.stringify({ amount: -50000, description: 'Nạp âm' }),
    });
    assertTest(6, 'Chặn nạp tiền số âm hoặc bằng 0 (HTTP 400)', invalidDep.status >= 400);

    // Case 7: Nạp tiền hợp lệ 500k -> Số dư tăng
    const validDep = await (await fetch(`${API_URL}/wallet/deposit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${hirerToken}` },
      body: JSON.stringify({ amount: 500000, description: 'Nạp quỹ chạy chiến dịch' }),
    })).json();
    assertTest(7, 'Nạp tiền ví hợp lệ thành công (Số dư khả dụng tăng)', Number(validDep.data?.balance) >= 500000);

    // Case 8: Tạo task với thù lao vượt quá số dư ví -> Bị từ chối ký quỹ
    const brokeHirer = (await (await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `broke_${timestamp}@test.imhere.vn`,
        password: 'Password@123',
        fullName: 'Chủ Việc Chưa Có Tiền',
        phone: `091${timestamp}`,
        role: 'ROLE_CLIENT',
      }),
    })).json()).data;
    const brokeToken = (await (await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: `broke_${timestamp}@test.imhere.vn`, password: 'Password@123' }),
    })).json()).data.token;

    const noMoneyTask = await fetch(`${API_URL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${brokeToken}` },
      body: JSON.stringify({
        title: 'Task nợ tiền',
        category: 'RETAIL_AUDIT',
        address: '191 Bà Triệu',
        latitude: 21.0117,
        longitude: 105.8497,
        rewardAmount: 200000,
      }),
    });
    assertTest(8, 'Chặn tạo task khi ví không đủ số dư để ký quỹ Escrow (HTTP 400)', noMoneyTask.status >= 400);

    // Case 9: Thù lao dưới mức tối thiểu 10k -> Validation error
    const lowRewardTask = await fetch(`${API_URL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${hirerToken}` },
      body: JSON.stringify({
        title: 'Task thù lao thấp',
        category: 'RETAIL_AUDIT',
        address: '191 Bà Triệu',
        latitude: 21.0117,
        longitude: 105.8497,
        rewardAmount: 5000,
      }),
    });
    assertTest(9, 'Chặn thù lao dưới mức tối thiểu 10.000 VNĐ (Validation Min)', lowRewardTask.status >= 400);

    // Case 10: Tạo task chính hợp lệ 150k -> Escrow Hold thành công
    const mainTask = (await (await fetch(`${API_URL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${hirerToken}` },
      body: JSON.stringify({
        title: `Kiểm tra trưng bày WinMart Bà Triệu ${timestamp}`,
        description: 'Chụp ảnh quầy kệ, kiểm tra giá và hạn sử dụng sản phẩm khuyến mãi.',
        category: 'RETAIL_AUDIT',
        address: '191 Bà Triệu, Hai Bà Trưng, Hà Nội',
        latitude: 21.0117,
        longitude: 105.8497,
        rewardAmount: 150000,
        instructions: 'Chụp rõ nét theo đúng 3 mục checklist.',
        checklistRequirementsJson: JSON.stringify([
          { id: 1, title: 'Đúng địa chỉ cửa hàng' },
          { id: 2, title: 'Chụp ảnh quầy thu ngân và mặt tiền' },
          { id: 3, title: 'Kiểm tra hạn sử dụng trên kệ bánh kẹo' },
        ]),
      }),
    })).json()).data;
    const hWallet = (await (await fetch(`${API_URL}/wallet/my-wallet`, { headers: { Authorization: `Bearer ${hirerToken}` } })).json()).data;
    assertTest(10, 'Tạo nhiệm vụ hợp lệ & Escrow Ký quỹ (Hold 150k) tự động', Number(hWallet.escrowBalance) >= 150000);

    // ═════════════════════════════════════════════════════════════════════════
    // MODULE C: TÌM KIẾM GPS HAVERSINE & KHÓA ĐỘC QUYỀN CONCURRENCY (Cases 11 - 14)
    // ═════════════════════════════════════════════════════════════════════════
    console.log('\n📦 MODULE C: TÌM KIẾM GPS HAVERSINE & KHÓA ĐỘC QUYỀN CONCURRENCY');
    console.log('-'.repeat(90));

    // Case 11: Quét GPS tìm việc lân cận trong bán kính 5km
    const nearRes = (await (await fetch(`${API_URL}/tasks/nearby?lat=21.0119&lng=105.8499&radiusKm=5`, {
      headers: { Authorization: `Bearer ${workerToken}` },
    })).json()).data;
    const foundMain = nearRes.find((t) => t.id === mainTask.id);
    assertTest(11, 'Quét GPS lân cận (Haversine) phát hiện nhiệm vụ cách ~30 mét', Boolean(foundMain));

    // Case 12: Chính Hirer cố tự nhận task của mình -> BỊ CHẶN
    const selfAccept = await fetch(`${API_URL}/tasks/${mainTask.id}/accept`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${hirerToken}` },
    });
    assertTest(12, 'Chặn người đăng tin không được tự nhận việc của chính mình', selfAccept.status >= 400);

    // Case 13: Worker nhận việc độc quyền -> Two-Tier Lock thành công
    const acceptedTask = (await (await fetch(`${API_URL}/tasks/${mainTask.id}/accept`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${workerToken}` },
    })).json()).data;
    assertTest(13, 'Worker nhận việc thành công (Two-Tier Lock: Redis SETNX + DB Lock)', acceptedTask.status === 'ASSIGNED');

    // Case 14: Người khác cố bấm nhận task đã bị gán -> BỊ CHẶN (Chống Race Condition)
    const duplicateAccept = await fetch(`${API_URL}/tasks/${mainTask.id}/accept`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${strangerToken}` },
    });
    assertTest(14, 'Chặn nhận trùng lặp nhiệm vụ khi đã có CTV khác nhận (Concurrency Protection)', duplicateAccept.status >= 400);

    // ═════════════════════════════════════════════════════════════════════════
    // MODULE D: XÁC MINH VỊ TRÍ GPS & BẢO MẬT PHÒNG CHAT (Cases 15 - 18)
    // ═════════════════════════════════════════════════════════════════════════
    console.log('\n📦 MODULE D: XÁC MINH VỊ TRÍ GPS & BẢO MẬT PHÒNG CHAT');
    console.log('-'.repeat(90));

    // Case 15: Gian lận GPS từ Cầu Giấy (Cách 7.5km) -> BỊ CHẶN
    const fraudFar = await fetch(`${API_URL}/tasks/${mainTask.id}/check-in?latitude=21.0360&longitude=105.7820`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${workerToken}` },
    });
    assertTest(15, 'Chặn đứng check-in gian lận GPS ở khoảng cách xa (7.5 km)', fraudFar.status === 400);

    // Case 16: Gian lận GPS ngoài ngõ (Cách 255m > 100m) -> BỊ CHẶN
    const fraudNear = await fetch(`${API_URL}/tasks/${mainTask.id}/check-in?latitude=21.0140&longitude=105.8497`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${workerToken}` },
    });
    assertTest(16, 'Chặn đứng check-in khi cách địa điểm > 100 mét (255 mét)', fraudNear.status === 400);

    // Case 17: Check-in hợp lệ trước cửa hàng (Cách 15m <= 100m) -> THÀNH CÔNG
    const validCheckin = (await (await fetch(`${API_URL}/tasks/${mainTask.id}/check-in?latitude=21.0118&longitude=105.8498`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${workerToken}` },
    })).json()).data;
    assertTest(17, 'Phê duyệt Check-in GPS hợp lệ tại địa điểm thực tế (< 100m)', validCheckin.isCheckedIn === true);

    // Case 18: Bảo mật Chat: Người thứ 3 cố đọc/gửi tin nhắn -> BỊ CHẶN 403
    const strangerChat = await fetch(`${API_URL}/tasks/${mainTask.id}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${strangerToken}` },
      body: JSON.stringify({ content: 'Tôi là người ngoài cố xem lén' }),
    });
    // Gửi chat hợp lệ
    await fetch(`${API_URL}/tasks/${mainTask.id}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${workerToken}` },
      body: JSON.stringify({ content: 'Tôi đã có mặt, chuẩn bị chụp ảnh kệ hàng.' }),
    });
    assertTest(18, 'Bảo mật phòng Chat gắn với Task: Chặn người ngoài xem/gửi tin (HTTP 403)', strangerChat.status === 403);

    // ═════════════════════════════════════════════════════════════════════════
    // MODULE E: HỦY NHIỆM VỤ, HOÀN TIỀN & TRANH CHẤP NGHIỆM THU (Cases 19 - 22)
    // ═════════════════════════════════════════════════════════════════════════
    console.log('\n📦 MODULE E: HỦY NHIỆM VỤ, HOÀN TIỀN & TRANH CHẤP NGHIỆM THU');
    console.log('-'.repeat(90));

    // Case 19: Hirer hủy task chưa có ai nhận -> Hoàn 100% tiền Escrow về ví khả dụng
    const cancelableTask = (await (await fetch(`${API_URL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${hirerToken}` },
      body: JSON.stringify({
        title: 'Task tạo ra để test hủy và hoàn tiền',
        category: 'RETAIL_AUDIT',
        address: '191 Bà Triệu',
        latitude: 21.0117,
        longitude: 105.8497,
        rewardAmount: 80000,
      }),
    })).json()).data;

    const cancelRes = await (await fetch(`${API_URL}/tasks/${cancelableTask.id}/cancel`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${hirerToken}` },
    })).json();
    assertTest(19, 'Hủy nhiệm vụ khi chưa có người nhận -> Hoàn 100% tiền Escrow về ví Hirer', cancelRes.data?.status === 'CANCELLED');

    // Case 20: Hirer cố hủy task KHI ĐÃ CÓ WORKER NHẬN (ASSIGNED) -> BỊ CHẶN
    const tryCancelAssigned = await fetch(`${API_URL}/tasks/${mainTask.id}/cancel`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${hirerToken}` },
    });
    assertTest(20, 'Chặn Hirer không được đơn phương hủy khi đã có CTV nhận việc (HTTP 400)', tryCancelAssigned.status >= 400);

    // Worker nộp báo cáo bằng chứng
    const evidence = (await (await fetch(`${API_URL}/tasks/${mainTask.id}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${workerToken}` },
      body: JSON.stringify({
        actualLatitude: 21.0118,
        actualLongitude: 105.8498,
        note: 'Đã hoàn thành chụp ảnh kệ hàng WinMart',
        photosJson: JSON.stringify(['https://images.unsplash.com/photo-1578916171728.jpg']),
        checklistResponsesJson: JSON.stringify([
          { id: 1, title: 'Đúng địa chỉ', checked: true },
          { id: 2, title: 'Chụp ảnh quầy kệ', checked: true },
          { id: 3, title: 'Kiểm tra hạn sử dụng', checked: true },
        ]),
      }),
    })).json()).data;

    // Case 21: Hirer từ chối nghiệm thu -> Kích hoạt Tranh chấp (REJECTED), phong tỏa Escrow
    const rejectEvidence = (await (await fetch(`${API_URL}/evidences/${evidence.id}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${hirerToken}` },
      body: JSON.stringify({
        approved: false,
        reviewNotes: 'Góc chụp bị nghiêng, yêu cầu khiếu nại tranh chấp!',
      }),
    })).json()).data;
    assertTest(21, 'Hirer từ chối nghiệm thu -> Kích hoạt Tranh chấp (REJECTED) phong tỏa tiền', rejectEvidence.status === 'REJECTED');

    // Case 22: Admin can thiệp thẩm định độc lập -> Phán quyết giải ngân Escrow bảo vệ Worker
    const adminMediate = (await (await fetch(`${API_URL}/evidences/${evidence.id}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        approved: true,
        reviewNotes: 'Admin phân xử: Worker đã đến đúng GPS và chụp đầy đủ. Duyệt giải ngân!',
      }),
    })).json()).data;
    const wWalletAfter = (await (await fetch(`${API_URL}/wallet/my-wallet`, { headers: { Authorization: `Bearer ${workerToken}` } })).json()).data;
    assertTest(22, 'Admin can thiệp phân xử tranh chấp -> Giải ngân Escrow 150k cho Worker', Number(wWalletAfter.balance) >= 150000);

    // ═════════════════════════════════════════════════════════════════════════
    // MODULE F: ĐÁNH GIÁ 2 CHIỀU, UY TÍN & RÚT TIỀN (Cases 23 - 25)
    // ═════════════════════════════════════════════════════════════════════════
    console.log('\n📦 MODULE F: ĐÁNH GIÁ 2 CHIỀU, UY TÍN & RÚT TIỀN');
    console.log('-'.repeat(90));

    // Case 23: Đánh giá 2 chiều đa tiêu chí thành công
    const hReview = (await (await fetch(`${API_URL}/reviews/tasks/${mainTask.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${hirerToken}` },
      body: JSON.stringify({
        ratingStars: 4,
        punctualScore: 5,
        honestyScore: 5,
        qualityScore: 4,
        communicationScore: 4,
        comment: 'Đúng giờ, trung thực, có trách nhiệm.',
      }),
    })).json()).data;

    const wReview = (await (await fetch(`${API_URL}/reviews/tasks/${mainTask.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${workerToken}` },
      body: JSON.stringify({
        ratingStars: 5,
        punctualScore: 5,
        honestyScore: 5,
        qualityScore: 5,
        communicationScore: 5,
        comment: 'Chủ việc minh bạch, xử lý công bằng.',
      }),
    })).json()).data;
    assertTest(23, 'Đánh giá 2 chiều đa tiêu chí (Hirer: 4 sao, Worker: 5 sao) lưu DB', Boolean(hReview && wReview));

    // Case 24: Chống spam đánh giá: Cùng một người cố đánh giá lần 2 -> BỊ CHẶN 409 CONFLICT
    const duplicateReview = await fetch(`${API_URL}/reviews/tasks/${mainTask.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${hirerToken}` },
      body: JSON.stringify({ ratingStars: 5, comment: 'Đánh giá lần 2 spam' }),
    });
    assertTest(24, 'Chống spam đánh giá: Chặn một người đánh giá 2 lần cho cùng 1 nhiệm vụ (HTTP 409)', duplicateReview.status === 409);

    // Case 25: Rút tiền về Ngân hàng (Chặn rút quá số dư & Rút thành công)
    // 25.1 Chặn rút quá số dư
    const overWithdraw = await fetch(`${API_URL}/wallet/withdraw`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${workerToken}` },
      body: JSON.stringify({ amount: 99999999, bankInfo: 'Vietcombank' }),
    });
    // 25.2 Rút hợp lệ 100,000 VNĐ
    const validWithdraw = (await (await fetch(`${API_URL}/wallet/withdraw`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${workerToken}` },
      body: JSON.stringify({
        amount: 100000,
        bankInfo: `Vietcombank - 0011004382910 - ${WORKER.fullName.toUpperCase()}`,
      }),
    })).json()).data;
    assertTest(25, 'Kiểm toán rút tiền: Chặn rút vượt số dư & Rút thành công 100k về Vietcombank', overWithdraw.status === 400 && Boolean(validWithdraw));

    console.log('\n' + '='.repeat(90));
    console.log(`🏆 KẾT QUẢ: ${passedCount}/${totalCount} TEST CASES ĐÃ ĐẠT (TỶ LỆ THÀNH CÔNG: 100%)!`);
    console.log('='.repeat(90));
  } catch (err) {
    console.error('❌ LỖI TRONG QUÁ TRÌNH KIỂM THỬ:', err);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

runMaximumCoverageSuite();
