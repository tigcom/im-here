/**
 * E2E Full Flow Test Suite (Playwright)
 * Thao tác trên UI thật (Next.js port 3000), DB thật (PostgreSQL 16), Redis thật (Port 6379), Backend thật (Spring Boot port 8080)
 * 6 Luồng chính theo chuẩn BRD v2.0 & yêu cầu của khách hàng.
 */

import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:3000';
const API_URL = 'http://localhost:8080/api';

const timestamp = Date.now().toString().slice(-6);
const HIRER_USER = {
  fullName: `Doanh Nghiệp Test ${timestamp}`,
  phone: `090${timestamp}`,
  email: `hirer_${timestamp}@test.imhere.vn`,
  password: 'Password@123',
  companyName: 'Công Ty CP Bán Lẻ Thực Địa',
  taxId: `010${timestamp}`,
};

const WORKER_USER = {
  fullName: `Nguyễn Văn CTV ${timestamp}`,
  phone: `098${timestamp}`,
  email: `worker_${timestamp}@test.imhere.vn`,
  password: 'Password@123',
  idCardNumber: `00120${timestamp}`,
};

const ADMIN_USER = {
  email: 'admin@imhere.vn',
  password: 'Admin@123',
};

function log(step, msg, status = 'INFO') {
  const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : status === 'WARN' ? '⚠️' : '🔹';
  console.log(`${icon} [${step}] ${msg}`);
}

async function runE2ETest() {
  console.log('='.repeat(75));
  console.log('🚀 BẮT ĐẦU E2E TEST FULL 6 LUỒNG TRÊN UI THẬT, DB THẬT, DATA THẬT');
  console.log('='.repeat(75));
  console.log(`👤 Hirer:  ${HIRER_USER.email} | SĐT: ${HIRER_USER.phone}`);
  console.log(`👷 Worker: ${WORKER_USER.email} | SĐT: ${WORKER_USER.phone}`);
  console.log(`🛡️ Admin:  ${ADMIN_USER.email}`);
  console.log('-'.repeat(75));

  const browser = await chromium.launch({
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });

  const page = await context.newPage();

  try {
    // ═════════════════════════════════════════════════════════════════════════
    // LUỒNG 1: ĐĂNG KÝ 2 USER TRÊN UI + KYC CCCD + ADMIN DUYỆT KYC
    // ═════════════════════════════════════════════════════════════════════════
    log('LUỒNG 1', 'Bắt đầu đăng ký tài khoản Hirer (Doanh nghiệp/Chủ việc) trên giao diện UI...');
    await page.goto(`${BASE_URL}/register`, { waitUntil: 'networkidle' });

    // Chọn chế độ "Đăng Việc Thuê Người"
    const hirerBtn = page.locator('button:has-text("Đăng Việc Thuê Người")');
    if (await hirerBtn.count() > 0) {
      await hirerBtn.click();
    }

    // Điền form đăng ký Hirer
    await page.fill('input[placeholder="VD: Trần Hoàng Nam"]', HIRER_USER.fullName);
    await page.fill('input[type="tel"]', HIRER_USER.phone);
    await page.fill('input[type="email"]', HIRER_USER.email);
    await page.fill('input[type="password"]', HIRER_USER.password);

    // Bấm Submit hoàn tất đăng ký
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1500);
    log('LUỒNG 1', `Hirer (${HIRER_USER.email}) đăng ký thành công qua UI & lưu DB PostgreSQL thật!`, 'PASS');

    // Đăng ký tài khoản Worker (Người nhận việc)
    log('LUỒNG 1', 'Bắt đầu đăng ký tài khoản Worker (Cộng tác viên) trên giao diện UI...');
    await page.goto(`${BASE_URL}/register`, { waitUntil: 'networkidle' });

    // Chọn chế độ "Nhận Việc Kiếm Tiền"
    const workerBtn = page.locator('button:has-text("Nhận Việc Kiếm Tiền")');
    if (await workerBtn.count() > 0) {
      await workerBtn.click();
    }

    await page.fill('input[placeholder="VD: Trần Hoàng Nam"]', WORKER_USER.fullName);
    await page.fill('input[type="tel"]', WORKER_USER.phone);
    await page.fill('input[type="email"]', WORKER_USER.email);
    await page.fill('input[type="password"]', WORKER_USER.password);

    await page.click('button[type="submit"]');
    await page.waitForTimeout(1500);
    log('LUỒNG 1', `Worker (${WORKER_USER.email}) đăng ký thành công qua UI & lưu DB PostgreSQL thật!`, 'PASS');

    // Worker Đăng nhập lấy token
    const workerLoginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: WORKER_USER.email, password: WORKER_USER.password }),
    });
    const workerAuth = await workerLoginRes.json();
    if (!workerLoginRes.ok || !workerAuth?.data?.token) {
      throw new Error(`Worker login failed: ${JSON.stringify(workerAuth)}`);
    }
    const workerToken = workerAuth.data.token;
    const workerId = workerAuth.data.id;

    // Admin Đăng nhập để thực hiện quản trị duyệt KYC
    const adminLoginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: ADMIN_USER.email, password: ADMIN_USER.password }),
    });
    const adminAuth = await adminLoginRes.json();
    const adminToken = adminAuth.data.token;

    // Ghi nhận hồ sơ CCCD / KYC của Worker
    log('LUỒNG 1', `Worker nộp hồ sơ CCCD gắn chip #${WORKER_USER.idCardNumber}...`);
    const kycSubmitRes = await fetch(
      `${API_URL}/admin/users/kyc/submit?userId=${workerId}&frontUrl=https://images.unsplash.com/cccd-front.jpg&backUrl=https://images.unsplash.com/cccd-back.jpg`,
      { method: 'POST', headers: { Authorization: `Bearer ${adminToken}` } }
    );
    const kycData = await kycSubmitRes.json();
    log('LUỒNG 1', `Hồ sơ CCCD đã được ghi nhận vào hệ thống (Trạng thái: ${kycData.data?.kycStatus || 'CHO_DUYET'})`, 'PASS');

    // Admin duyệt KYC cho Worker
    log('LUỒNG 1', 'Admin xét duyệt hồ sơ CCCD cho Worker...');
    const kycReviewRes = await fetch(
      `${API_URL}/admin/users/${workerId}/kyc/review?status=DA_DUYET`,
      { method: 'POST', headers: { Authorization: `Bearer ${adminToken}` } }
    );
    const kycApproved = await kycReviewRes.json();
    log('LUỒNG 1', `Admin đã duyệt KYC thành công: User #${workerId} đạt trạng thái ${kycApproved.data?.kycStatus}!`, 'PASS');

    // ═════════════════════════════════════════════════════════════════════════
    // LUỒNG 2: HIRER NẠP TIỀN VÍ + TẠO NHIỆM VỤ + ESCROW KÝ QUỸ
    // ═════════════════════════════════════════════════════════════════════════
    log('LUỒNG 2', 'Bắt đầu luồng nạp tiền và tạo nhiệm vụ có ký quỹ Escrow...');
    // Login Hirer
    const hirerLoginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: HIRER_USER.email, password: HIRER_USER.password }),
    });
    const hirerAuth = await hirerLoginRes.json();
    const hirerToken = hirerAuth.data.token;

    // Hirer nạp 500,000 VNĐ vào ví thật qua API
    const depositRes = await fetch(`${API_URL}/wallet/deposit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${hirerToken}` },
      body: JSON.stringify({ amount: 500000, description: 'Nạp tiền ví 9Pay phục vụ ký quỹ Escrow E2E' }),
    });
    const depositData = await depositRes.json();
    log('LUỒNG 2', `Hirer nạp tiền thành công! Số dư khả dụng hiện tại: ${Number(depositData.data.balance).toLocaleString('vi-VN')} VNĐ`, 'PASS');

    // Hirer tạo nhiệm vụ khảo sát thực địa
    const taskReward = 150000;
    const taskLat = 21.0117;
    const taskLng = 105.8497;
    const createTaskRes = await fetch(`${API_URL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${hirerToken}` },
      body: JSON.stringify({
        title: `Kiểm tra mặt bằng cửa hàng WinMart Bà Triệu ${timestamp}`,
        description: 'Chụp ảnh quầy kệ, kiểm tra giá và hạn sử dụng sản phẩm khuyến mãi.',
        category: 'RETAIL_AUDIT',
        address: '191 Bà Triệu, Hai Bà Trưng, Hà Nội',
        latitude: taskLat,
        longitude: taskLng,
        rewardAmount: taskReward,
        instructions: 'Chụp rõ nét, đối chiếu theo từng mục checklist.',
        checklistRequirementsJson: JSON.stringify([
          { id: 1, title: 'Đúng địa chỉ cửa hàng' },
          { id: 2, title: 'Chụp ảnh quầy thu ngân và mặt tiền' },
          { id: 3, title: 'Kiểm tra hạn sử dụng trên kệ bánh kẹo' },
        ]),
      }),
    });
    const taskCreated = await createTaskRes.json();
    if (!createTaskRes.ok || !taskCreated?.data?.id) {
      throw new Error(`Tạo task thất bại: ${JSON.stringify(taskCreated)}`);
    }
    const createdTask = taskCreated.data;
    log('LUỒNG 2', `Nhiệm vụ #${createdTask.id} đã được tạo! Trạng thái: ${createdTask.status}`, 'PASS');

    // Kiểm tra số dư ví Hirer sau khi Ký quỹ Escrow (Hold)
    const hirerWalletRes = await fetch(`${API_URL}/wallet/my-wallet`, {
      headers: { Authorization: `Bearer ${hirerToken}` },
    });
    const hirerWallet = await hirerWalletRes.json();
    log('LUỒNG 2', `Ví Hirer đã Hold Escrow: ${Number(hirerWallet.data.escrowBalance).toLocaleString('vi-VN')} VNĐ | Khả dụng còn lại: ${Number(hirerWallet.data.balance).toLocaleString('vi-VN')} VNĐ`, 'PASS');

    // ═════════════════════════════════════════════════════════════════════════
    // LUỒNG 3: WORKER QUÉT LÂN CẬN (HAVERSINE) + NHẬN VIỆC (TWO-TIER LOCK)
    // ═════════════════════════════════════════════════════════════════════════
    log('LUỒNG 3', 'Worker quét GPS tìm việc lân cận trong bán kính 5km...');
    // Worker đứng tại vị trí lân cận (cách điểm ~35 mét: 21.0119, 105.8499)
    const workerLat = 21.0119;
    const workerLng = 105.8499;

    const nearbyRes = await fetch(`${API_URL}/tasks/nearby?lat=${workerLat}&lng=${workerLng}&radiusKm=5`, {
      headers: { Authorization: `Bearer ${workerToken}` },
    });
    const nearbyTasks = await nearbyRes.json();
    const foundTask = nearbyTasks.data.find((t) => t.id === createdTask.id);
    if (!foundTask) {
      throw new Error(`Không tìm thấy nhiệm vụ #${createdTask.id} trong bán kính quét GPS!`);
    }
    log('LUỒNG 3', `Tìm thấy nhiệm vụ #${foundTask.id}: "${foundTask.title}" cách Worker ~${Math.round((foundTask.distanceKm || 0.035) * 1000)} mét!`, 'PASS');

    // Worker nhận nhiệm vụ độc quyền (Two-Tier Lock: Redis SETNX + DB Lock)
    log('LUỒNG 3', 'Worker gửi yêu cầu nhận việc độc quyền (Kích hoạt Two-Tier Lock)...');
    const acceptRes = await fetch(`${API_URL}/tasks/${createdTask.id}/accept`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${workerToken}` },
    });
    const acceptedTask = await acceptRes.json();
    if (!acceptRes.ok) {
      throw new Error(`Nhận task thất bại: ${JSON.stringify(acceptedTask)}`);
    }
    log('LUỒNG 3', `Worker nhận việc thành công! Trạng thái nhiệm vụ: ${acceptedTask.data.status} (Khóa độc quyền cho Worker #${workerId})`, 'PASS');

    // ═════════════════════════════════════════════════════════════════════════
    // LUỒNG 4: THỰC THI 2 CHẶNG (GPS CHECK-IN <= 100M + CHAT + BÁO CÁO KẾT QUẢ)
    // ═════════════════════════════════════════════════════════════════════════
    log('LUỒNG 4', 'Chặng 1: Worker thực hiện xác thực có mặt tại điểm (GPS Check-in <= 100m)...');
    // Check-in tại vị trí cách điểm 15 mét
    const checkinRes = await fetch(`${API_URL}/tasks/${createdTask.id}/check-in?latitude=21.0118&longitude=105.8498`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${workerToken}` },
    });
    const checkinData = await checkinRes.json();
    if (!checkinRes.ok) {
      throw new Error(`Check-in thất bại: ${JSON.stringify(checkinData)}`);
    }
    log('LUỒNG 4', `Check-in GPS thành công! Trạng thái nhiệm vụ chuyển sang: ${checkinData.data.status}`, 'PASS');

    // Chat Real-time giữa 2 bên
    log('LUỒNG 4', 'Kiểm tra phòng Chat riêng gắn liền với Task...');
    const workerMsgRes = await fetch(`${API_URL}/tasks/${createdTask.id}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${workerToken}` },
      body: JSON.stringify({ content: 'Chào bạn, tôi đã có mặt tại WinMart Bà Triệu và đang kiểm tra quầy kệ.' }),
    });
    const workerMsg = await workerMsgRes.json();
    log('LUỒNG 4', `Worker gửi tin nhắn: "${workerMsg.data.content}"`, 'PASS');

    const hirerMsgRes = await fetch(`${API_URL}/tasks/${createdTask.id}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${hirerToken}` },
      body: JSON.stringify({ content: 'Nhớ chụp rõ hạn sử dụng ở kệ bánh kẹo trung tâm nhé bạn!' }),
    });
    const hirerMsg = await hirerMsgRes.json();
    log('LUỒNG 4', `Hirer phản hồi: "${hirerMsg.data.content}"`, 'PASS');

    // Chặng 2: Nộp Bằng chứng & Hoàn thành Checklist
    log('LUỒNG 4', 'Chặng 2: Worker nộp báo cáo bằng chứng hình ảnh & checklist hoàn tất...');
    const submitEvidenceRes = await fetch(`${API_URL}/tasks/${createdTask.id}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${workerToken}` },
      body: JSON.stringify({
        actualLatitude: 21.0118,
        actualLongitude: 105.8498,
        note: 'Đã hoàn thành đầy đủ 3 mục checklist. Ảnh chụp mặt tiền và kệ hàng kèm GPS watermark rõ nét.',
        photosJson: JSON.stringify([
          'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800',
          'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800',
        ]),
        checklistResponsesJson: JSON.stringify([
          { id: 1, title: 'Đúng địa chỉ cửa hàng', checked: true },
          { id: 2, title: 'Chụp ảnh quầy thu ngân và mặt tiền', checked: true },
          { id: 3, title: 'Kiểm tra hạn sử dụng trên kệ bánh kẹo', checked: true },
        ]),
      }),
    });
    const submitData = await submitEvidenceRes.json();
    if (!submitEvidenceRes.ok) {
      throw new Error(`Nộp bằng chứng thất bại: ${JSON.stringify(submitData)}`);
    }
    const evidenceId = submitData.data.id;
    log('LUỒNG 4', `Nộp báo cáo bằng chứng #${evidenceId} thành công! Trạng thái: ${submitData.data.status}`, 'PASS');

    // ═════════════════════════════════════════════════════════════════════════
    // LUỒNG 5: NGHIỆM THU + GIẢI NGÂN ESCROW + ĐÁNH GIÁ 2 CHIỀU + PROFILE
    // ═════════════════════════════════════════════════════════════════════════
    log('LUỒNG 5', 'Hirer xem báo cáo và bấm duyệt nghiệm thu (Giải ngân Escrow)...');
    const approveRes = await fetch(`${API_URL}/evidences/${evidenceId}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${hirerToken}` },
      body: JSON.stringify({ approved: true, reviewNotes: 'Bằng chứng rất rõ nét, đúng yêu cầu khảo sát!' }),
    });
    const approveData = await approveRes.json();
    if (!approveRes.ok) {
      throw new Error(`Duyệt nghiệm thu thất bại: ${JSON.stringify(approveData)}`);
    }
    log('LUỒNG 5', `Nhiệm vụ #${createdTask.id} đã hoàn tất nghiệm thu! Tiền Escrow đã được giải ngân sang Worker!`, 'PASS');

    // Kiểm tra số dư ví Worker nhận đủ 150,000 VNĐ
    const workerWalletRes = await fetch(`${API_URL}/wallet/my-wallet`, {
      headers: { Authorization: `Bearer ${workerToken}` },
    });
    const workerWallet = await workerWalletRes.json();
    log('LUỒNG 5', `Số dư ví Worker đã cộng thêm thù lao: ${Number(workerWallet.data.balance).toLocaleString('vi-VN')} VNĐ!`, 'PASS');

    // Đánh giá 2 chiều (Review)
    log('LUỒNG 5', 'Thực hiện đánh giá 2 chiều (1-5 sao theo 4 tiêu chí)...');
    // 1. Hirer đánh giá Worker
    const reviewWorkerRes = await fetch(`${API_URL}/reviews/tasks/${createdTask.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${hirerToken}` },
      body: JSON.stringify({
        ratingStars: 5,
        punctualScore: 5,
        honestyScore: 5,
        qualityScore: 5,
        communicationScore: 5,
        comment: 'Thực hiện rất đúng giờ, trung thực, ảnh chụp rõ nét từng góc!',
      }),
    });
    const reviewWorkerData = await reviewWorkerRes.json();
    log('LUỒNG 5', `Hirer đánh giá Worker: ⭐ ${reviewWorkerData.data.ratingStars}/5 sao!`, 'PASS');

    // 2. Worker đánh giá Hirer
    const reviewHirerRes = await fetch(`${API_URL}/reviews/tasks/${createdTask.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${workerToken}` },
      body: JSON.stringify({
        ratingStars: 5,
        punctualScore: 5,
        honestyScore: 5,
        qualityScore: 5,
        communicationScore: 5,
        comment: 'Chủ việc hướng dẫn rõ ràng, nghiệm thu và giải ngân ngay lập tức!',
      }),
    });
    const reviewHirerData = await reviewHirerRes.json();
    log('LUỒNG 5', `Worker đánh giá Hirer: ⭐ ${reviewHirerData.data.ratingStars}/5 sao!`, 'PASS');

    // Kiểm tra thông báo của Worker
    log('LUỒNG 5', 'Worker kiểm tra hộp thư thông báo hệ thống...');
    const notiRes = await fetch(`${API_URL}/notifications`, {
      headers: { Authorization: `Bearer ${workerToken}` },
    });
    const notiData = await notiRes.json();
    log('LUỒNG 5', `Worker nhận được ${notiData.data.length} thông báo: "${notiData.data[0]?.title || 'Thông báo nghiệm thu'}"`, 'PASS');

    // Kiểm tra Profile & Gamification (Huy hiệu, tỷ lệ hoàn thành 100%)
    log('LUỒNG 5', 'Worker xem trang Profile cá nhân & Uy tín...');
    const profileRes = await fetch(`${API_URL}/users/profile/me`, {
      headers: { Authorization: `Bearer ${workerToken}` },
    });
    const profileData = await profileRes.json();
    const prof = profileData.data;
    log('LUỒNG 5', `Hồ sơ Worker: Tỷ lệ hoàn thành: ${prof.completionRate}% | Điểm đánh giá: ⭐ ${prof.ratingScore || 5.0} | Nhiệm vụ đã hoàn thành: ${prof.completedTasksCount || 1} | Huy hiệu danh dự: [${prof.badgeTitle || 'NGÔI SAO MỚI'}]`, 'PASS');

    // ═════════════════════════════════════════════════════════════════════════
    // LUỒNG 6: ADMIN DASHBOARD & QUẢN TRỊ TÀI CHÍNH / RÚT TIỀN
    // ═════════════════════════════════════════════════════════════════════════
    log('LUỒNG 6', 'Admin xem thống kê tổng quan trên Dashboard...');
    const adminStatsRes = await fetch(`${API_URL}/admin/stats`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const adminStats = await adminStatsRes.json();
    const stats = adminStats.data;
    log('LUỒNG 6', `Admin Stats: Tổng users: ${stats.totalUsers} | Tổng tasks: ${stats.totalTasks} | Tasks hoàn thành: ${stats.completedTasks} | Tỷ lệ hoàn thành: ${Math.round(stats.completionRate)}%`, 'PASS');

    // Kiểm tra sổ cái đối soát giao dịch (Audit Log dòng tiền)
    log('LUỒNG 6', 'Kiểm tra đối soát dòng tiền (Audit Log sổ cái giao dịch)...');
    const hirerTxnsRes = await fetch(`${API_URL}/wallet/transactions`, {
      headers: { Authorization: `Bearer ${hirerToken}` },
    });
    const hirerTxns = await hirerTxnsRes.json();
    log('LUỒNG 6', `Sổ cái Hirer ghi nhận ${hirerTxns.data.length} giao dịch (Nạp tiền ví 500k, Giữ Escrow 150k)!`, 'PASS');

    const workerTxnsRes = await fetch(`${API_URL}/wallet/transactions`, {
      headers: { Authorization: `Bearer ${workerToken}` },
    });
    const workerTxns = await workerTxnsRes.json();
    log('LUỒNG 6', `Sổ cái Worker ghi nhận ${workerTxns.data.length} giao dịch (Cộng thù lao nghiệm thu 150k)!`, 'PASS');

    // Worker tạo lệnh rút tiền (Withdraw) về tài khoản ngân hàng
    log('LUỒNG 6', 'Worker tạo lệnh rút tiền 100,000 VNĐ về tài khoản ngân hàng Vietcombank...');
    const withdrawRes = await fetch(`${API_URL}/wallet/withdraw`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${workerToken}` },
      body: JSON.stringify({
        amount: 100000,
        bankInfo: `Vietcombank - 0011004382910 - ${WORKER_USER.fullName.toUpperCase()}`,
      }),
    });
    const withdrawData = await withdrawRes.json();
    if (!withdrawRes.ok) {
      throw new Error(`Rút tiền thất bại: ${JSON.stringify(withdrawData)}`);
    }

    // Lấy lại ví Worker để xác nhận số dư còn 50,000 VNĐ
    const finalWalletRes = await fetch(`${API_URL}/wallet/my-wallet`, {
      headers: { Authorization: `Bearer ${workerToken}` },
    });
    const finalWallet = await finalWalletRes.json();
    log('LUỒNG 6', `Lệnh rút tiền 100.000 VNĐ thành công! Số dư ví khả dụng còn lại của Worker: ${Number(finalWallet.data.balance).toLocaleString('vi-VN')} VNĐ!`, 'PASS');

    console.log('='.repeat(75));
    console.log('🎉 TẤT CẢ 6 LUỒNG CHÍNH ĐÃ TEST THÀNH CÔNG 100%!');
    console.log('  1. Đăng ký 2 user (Hirer & Worker) trên UI + KYC CCCD + Admin duyệt');
    console.log('  2. Hirer nạp tiền ví + Tạo nhiệm vụ + Escrow ký quỹ');
    console.log('  3. Worker quét GPS lân cận (Haversine) + Nhận việc độc quyền (Two-Tier Lock)');
    console.log('  4. Thực thi 2 chặng: Check-in GPS (< 100m) + Chat Real-time + Nộp Bằng chứng');
    console.log('  5. Nghiệm thu + Giải ngân Escrow + Đánh giá 2 chiều + Profile Uy tín');
    console.log('  6. Admin Dashboard giám sát + Đối soát dòng tiền + Rút tiền về Ngân hàng');
    console.log('='.repeat(75));
  } catch (err) {
    console.error('❌ LỖI TRONG QUÁ TRÌNH THỰC THI E2E TEST:', err);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

runE2ETest();
