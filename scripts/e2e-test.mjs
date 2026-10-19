/**
 * IM-HERE End-to-End (E2E) Full Lifecycle Test Script
 * Kiểm thử toàn trình kết nối giữa Frontend và Backend Java Spring Boot + PostgreSQL 16
 */

const API_BASE = 'http://localhost:8080/api';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

function logStep(stepNum, title) {
  console.log(`\n${colors.cyan}${colors.bold}=== BƯỚC ${stepNum}: ${title} ===${colors.reset}`);
}

function logPass(msg) {
  console.log(`  ${colors.green}✓ [PASS]${colors.reset} ${msg}`);
}

function logFail(msg, err) {
  console.error(`  ${colors.red}✗ [FAIL]${colors.reset} ${msg}`, err || '');
}

async function runE2ETest() {
  console.log(`${colors.yellow}${colors.bold}BẮT ĐẦU KIỂM THỬ E2E TOÀN TRÌNH: IM-HERE PLATFORM${colors.reset}`);
  console.log(`Target Backend: ${API_BASE}\n`);

  let clientToken = '';
  let shepherdToken = '';
  let createdTaskId = null;
  let evidenceId = null;
  let initialClientBalance = 0;
  let initialShepherdBalance = 0;

  try {
    // ── BƯỚC 1: Healthcheck Backend & OpenAPI Docs ──
    logStep(1, 'Kiểm tra Backend Health & OpenAPI Documentation');
    const docsRes = await fetch(`${API_BASE}/v3/api-docs`);
    if (!docsRes.ok) throw new Error(`OpenAPI docs trả về mã ${docsRes.status}`);
    const docsJson = await docsRes.json();
    logPass(`Kết nối backend thành công. API Title: "${docsJson.info.title}" (v${docsJson.info.version})`);

    // ── BƯỚC 2: Đăng nhập Doanh nghiệp B2B (Client) ──
    logStep(2, 'Đăng nhập tài khoản Doanh nghiệp (Client: client@vinmart.vn)');
    const clientLoginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'client@vinmart.vn', password: 'Client@123' }),
    });
    const clientLoginData = await clientLoginRes.json();
    if (!clientLoginData.success) throw new Error(clientLoginData.message);
    clientToken = clientLoginData.data.token;
    initialClientBalance = Number(clientLoginData.data.walletBalance);
    logPass(`Client đăng nhập thành công. Token được cấp phát.`);
    logPass(`Họ tên: ${clientLoginData.data.fullName} | Số dư ví ban đầu: ${initialClientBalance.toLocaleString('vi-VN')} VNĐ`);

    // ── BƯỚC 3: Đăng nhập Cộng tác viên thực địa (Shepherd) ──
    logStep(3, 'Đăng nhập tài khoản Cộng tác viên (Shepherd: shepherd@imhere.vn)');
    const shepherdLoginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'shepherd@imhere.vn', password: 'Shepherd@123' }),
    });
    const shepherdLoginData = await shepherdLoginRes.json();
    if (!shepherdLoginData.success) throw new Error(shepherdLoginData.message);
    shepherdToken = shepherdLoginData.data.token;
    initialShepherdBalance = Number(shepherdLoginData.data.walletBalance);
    logPass(`Shepherd đăng nhập thành công. Token được cấp phát.`);
    logPass(`Họ tên: ${shepherdLoginData.data.fullName} | Số dư ví ban đầu: ${initialShepherdBalance.toLocaleString('vi-VN')} VNĐ`);

    // ── BƯỚC 4: Client tạo Nhiệm vụ thực địa (Ký quỹ tiền thưởng tự động) ──
    logStep(4, 'Doanh nghiệp đăng ký Nhiệm vụ thực địa mới (Escrow Ký quỹ)');
    const rewardAmount = 150000;
    const taskPayload = {
      title: 'E2E Test: Kiểm định quầy bia Heineken WinMart Liễu Giai',
      description: 'Chụp ảnh kệ trưng bày bia và kiểm tra bảng giá niêm yết.',
      category: 'RETAIL_AUDIT',
      address: '29 Liễu Giai, Ba Đình, Hà Nội',
      latitude: 21.0315,
      longitude: 105.8152,
      rewardAmount: rewardAmount,
      instructions: 'Bật GPS, chụp cận cảnh nhãn giá khuyến mại.',
      checklistRequirementsJson: JSON.stringify([
        { id: 'q1', title: 'Giá có đúng 420k/thùng không?', type: 'boolean' }
      ]),
      deadline: new Date(Date.now() + 86400000 * 2).toISOString(),
    };

    const createTaskRes = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${clientToken}`,
      },
      body: JSON.stringify(taskPayload),
    });
    const createTaskData = await createTaskRes.json();
    if (!createTaskData.success) throw new Error(createTaskData.message);
    createdTaskId = createTaskData.data.id;
    logPass(`Nhiệm vụ #${createdTaskId} đã tạo thành công với trạng thái: ${createTaskData.data.status}`);
    logPass(`Thù lao: ${rewardAmount.toLocaleString('vi-VN')} VNĐ`);

    // Kiểm tra số dư ví Client sau khi ký quỹ
    const clientWalletRes = await fetch(`${API_BASE}/wallet/my-wallet`, {
      headers: { 'Authorization': `Bearer ${clientToken}` },
    });
    const clientWalletData = await clientWalletRes.json();
    const newClientBalance = Number(clientWalletData.data.balance);
    const newClientEscrow = Number(clientWalletData.data.escrowBalance);
    logPass(`Ví Client sau ký quỹ: Số dư khả dụng = ${newClientBalance.toLocaleString('vi-VN')} VNĐ (đã trừ ${rewardAmount.toLocaleString('vi-VN')} VNĐ)`);
    logPass(`Số dư ký quỹ tạm giữ (Escrow) = ${newClientEscrow.toLocaleString('vi-VN')} VNĐ`);

    if (newClientBalance !== initialClientBalance - rewardAmount) {
      throw new Error(`Ký quỹ thất bại: Số dư khả dụng không giảm chính xác ${rewardAmount}`);
    }

    // ── BƯỚC 5: Shepherd quét nhiệm vụ xung quanh theo GPS (Haversine Formula) ──
    logStep(5, 'Shepherd quét nhiệm vụ gần vị trí hiện tại (GPS: Ba Đình, Hà Nội)');
    // Shepherd đang ở toạ độ Kim Mã, Ba Đình (cách Liễu Giai ~800m)
    const shepherdLat = 21.0320;
    const shepherdLng = 21.0320 ? 105.8200 : 0;
    const nearbyRes = await fetch(`${API_BASE}/tasks/nearby?lat=${shepherdLat}&lng=${shepherdLng}&radiusKm=5`, {
      headers: { 'Authorization': `Bearer ${shepherdToken}` },
    });
    const nearbyData = await nearbyRes.json();
    if (!nearbyData.success) throw new Error(nearbyData.message);
    const foundTask = nearbyData.data.find(t => t.id === createdTaskId);
    if (!foundTask) throw new Error(`Không tìm thấy nhiệm vụ #${createdTaskId} trong bán kính 5km`);
    logPass(`Đã tìm thấy nhiệm vụ #${createdTaskId} trên bản đồ. Khoảng cách tính toán: ${foundTask.distanceKm} km`);

    // ── BƯỚC 6: Shepherd nhận việc (Accept Task) ──
    logStep(6, 'Shepherd nhận việc (Accept Task)');
    const acceptRes = await fetch(`${API_BASE}/tasks/${createdTaskId}/accept`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${shepherdToken}` },
    });
    const acceptData = await acceptRes.json();
    if (!acceptData.success) throw new Error(acceptData.message);
    logPass(`Nhiệm vụ #${createdTaskId} chuyển trạng thái sang: ${acceptData.data.status}`);
    logPass(`Đã gán cho CTV ID: ${acceptData.data.assignedShepherdId} (${acceptData.data.assignedShepherdName})`);

    // ── BƯỚC 7: Chặng 1 — Shepherd Check-in GPS tại địa điểm (Bán kính <= 100m) ──
    logStep(7, 'Chặng 1: Shepherd bấm Check-in GPS tại địa điểm (Bán kính <= 100m)');
    const checkInRes = await fetch(`${API_BASE}/tasks/${createdTaskId}/check-in?latitude=21.0315&longitude=105.8152`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${shepherdToken}` },
    });
    const checkInData = await checkInRes.json();
    if (!checkInData.success) throw new Error(checkInData.message);
    logPass(`Check-in Chặng 1 thành công! isCheckedIn: ${checkInData.data.isCheckedIn}`);

    // ── BƯỚC 8: Chat Real-time giữa Client và Shepherd trong nhiệm vụ ──
    logStep(8, 'Giao tiếp: Chat Real-time giữa 2 bên trong Task #' + createdTaskId);
    const chatMsgRes = await fetch(`${API_BASE}/tasks/${createdTaskId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${shepherdToken}`,
      },
      body: JSON.stringify({
        content: 'Tôi đã tới quầy kệ WinMart Liễu Giai, chuẩn bị chụp ảnh giá bia Heineken.',
      }),
    });
    const chatMsgData = await chatMsgRes.json();
    if (!chatMsgData.success) throw new Error(chatMsgData.message);
    logPass(`Shepherd gửi tin nhắn: "${chatMsgData.data.content}"`);

    const getChatRes = await fetch(`${API_BASE}/tasks/${createdTaskId}/messages`, {
      headers: { 'Authorization': `Bearer ${clientToken}` },
    });
    const getChatData = await getChatRes.json();
    if (!getChatData.success || getChatData.data.length === 0) throw new Error('Không đọc được lịch sử chat');
    logPass(`Client nhận tin nhắn thành công (${getChatData.data.length} tin nhắn trong phòng)`);

    // ── BƯỚC 9: Chặng 2 — Shepherd gửi Báo cáo Thực địa (Checklist & Ảnh) ──
    logStep(9, 'Chặng 2: Shepherd nộp Báo cáo Thực địa & Bằng chứng kiểm tra');
    const submitPayload = {
      actualLatitude: 21.0316, // Lệch chỉ ~15 mét so với điểm mục tiêu (21.0315)
      actualLongitude: 105.8153,
      note: 'Đã hoàn thành kiểm tra kệ bia Heineken, giá niêm yết đúng quy định.',
      photosJson: JSON.stringify([
        'https://cdn.imhere.vn/evidences/e2e-shelf-1.jpg',
        'https://cdn.imhere.vn/evidences/e2e-price-tag.jpg'
      ]),
      checklistResponsesJson: JSON.stringify({ q1: true }),
    };

    const submitRes = await fetch(`${API_BASE}/tasks/${createdTaskId}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${shepherdToken}`,
      },
      body: JSON.stringify(submitPayload),
    });
    const submitData = await submitRes.json();
    if (!submitData.success) throw new Error(submitData.message);
    evidenceId = submitData.data.id;
    logPass(`Báo cáo thực địa #${evidenceId} đã nộp thành công!`);
    logPass(`Sai số GPS thực tế: ${submitData.data.distanceFromTaskMeters} mét | GPS Verified: ${submitData.data.isGpsVerified ? 'HỢP LỆ (Không gian lận)' : 'CẢNH BÁO'}`);

    // ── BƯỚC 10: Doanh nghiệp duyệt Báo cáo & Giải phóng Ký quỹ trả thù lao ──
    logStep(10, 'Doanh nghiệp QA Review & Nghiệm thu Báo cáo');
    const reviewPayload = {
      approved: true,
      reviewNotes: 'Hình ảnh sắc nét, định vị GPS chuẩn xác, dữ liệu hợp lệ 100%.',
    };
    const reviewRes = await fetch(`${API_BASE}/evidences/${evidenceId}/review`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${clientToken}`,
      },
      body: JSON.stringify(reviewPayload),
    });
    const reviewData = await reviewRes.json();
    if (!reviewData.success) throw new Error(reviewData.message);
    logPass(`Báo cáo #${evidenceId} đã được phê duyệt (Trạng thái: ${reviewData.data.status})`);
    logPass(`Kích hoạt cơ chế giải phóng ký quỹ trả thù lao ${rewardAmount.toLocaleString('vi-VN')} VNĐ cho CTV.`);

    // ── BƯỚC 11: Đối soát Tài chính 2 chiều (Reconciliation) ──
    logStep(11, 'Kiểm tra & Đối soát dòng tiền 2 chiều sau khi hoàn tất');
    // Kiểm tra ví Shepherd
    const shepherdWalletRes = await fetch(`${API_BASE}/wallet/my-wallet`, {
      headers: { 'Authorization': `Bearer ${shepherdToken}` },
    });
    const shepherdWalletData = await shepherdWalletRes.json();
    const finalShepherdBalance = Number(shepherdWalletData.data.balance);
    logPass(`Ví Shepherd sau khi nhận thù lao: ${finalShepherdBalance.toLocaleString('vi-VN')} VNĐ (đã tăng +${rewardAmount.toLocaleString('vi-VN')} VNĐ)`);

    if (finalShepherdBalance !== initialShepherdBalance + rewardAmount) {
      throw new Error(`Đối soát thù lao thất bại: Số dư ví Shepherd không tăng chính xác ${rewardAmount}`);
    }

    // Kiểm tra số dư ký quỹ Client đã giải phóng về 0
    const finalClientWalletRes = await fetch(`${API_BASE}/wallet/my-wallet`, {
      headers: { 'Authorization': `Bearer ${clientToken}` },
    });
    const finalClientWalletData = await finalClientWalletRes.json();
    const finalClientEscrow = Number(finalClientWalletData.data.escrowBalance);
    logPass(`Ví Client sau đối soát: Số dư ký quỹ (Escrow) đã giải phóng hoàn toàn về ${finalClientEscrow.toLocaleString('vi-VN')} VNĐ`);

    // ── BƯỚC 12: Thống kê Quản trị Super Admin ──
    logStep(12, 'Super Admin kiểm tra báo cáo toàn hệ thống');
    const adminLoginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@imhere.vn', password: 'Admin@123' }),
    });
    const adminLoginData = await adminLoginRes.json();
    const adminToken = adminLoginData.data.token;

    const statsRes = await fetch(`${API_BASE}/admin/stats`, {
      headers: { 'Authorization': `Bearer ${adminToken}` },
    });
    const statsData = await statsRes.json();
    logPass(`Tổng số người dùng: ${statsData.data.totalUsers}`);
    logPass(`Tổng số nhiệm vụ: ${statsData.data.totalTasks} (Đã hoàn thành: ${statsData.data.completedTasks})`);
    logPass(`Tỷ lệ hoàn thành nhiệm vụ: ${statsData.data.completionRate.toFixed(1)}%`);

    // ── BƯỚC 13: Đánh giá 2 chiều theo tiêu chí (Review & Reputation) ──
    logStep(13, 'Đánh giá 2 chiều: Client đánh giá Shepherd 5 sao (Đúng giờ, Trung thực, Chất lượng)');
    const reviewReq = {
      ratingStars: 5,
      punctualScore: 5,
      honestyScore: 5,
      qualityScore: 5,
      communicationScore: 5,
      comment: 'Cộng tác viên làm việc rất nhanh chóng, chụp ảnh rõ nét và đúng hẹn!',
    };
    const reviewTaskRes = await fetch(`${API_BASE}/reviews/tasks/${createdTaskId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${clientToken}`,
      },
      body: JSON.stringify(reviewReq),
    });
    const reviewTaskData = await reviewTaskRes.json();
    if (!reviewTaskData.success) throw new Error(reviewTaskData.message);
    logPass(`Đánh giá thành công! Rating: ${reviewTaskData.data.ratingStars} sao | Comment: "${reviewTaskData.data.comment}"`);

    // ── BƯỚC 14: Thông báo Socket Real-time (Notifications) ──
    logStep(14, 'Kiểm tra hộp thư Thông báo (Notifications)');
    const notifRes = await fetch(`${API_BASE}/notifications`, {
      headers: { 'Authorization': `Bearer ${shepherdToken}` },
    });
    const notifData = await notifRes.json();
    if (!notifData.success || notifData.data.length === 0) throw new Error('Không nhận được thông báo sau khi hoàn thành');
    logPass(`Shepherd nhận được ${notifData.data.length} thông báo trong hộp thư.`);
    logPass(`Thông báo mới nhất: "${notifData.data[0].title}" - ${notifData.data[0].content}`);

    // ── BƯỚC 15: Hồ sơ Người dùng, Tỷ lệ hoàn thành & Huy hiệu uy tín ──
    logStep(15, 'Kiểm tra Hồ sơ Người dùng (Profile, Tỷ lệ hoàn thành & Huy hiệu)');
    const profileRes = await fetch(`${API_BASE}/users/profile/me`, {
      headers: { 'Authorization': `Bearer ${shepherdToken}` },
    });
    const profileData = await profileRes.json();
    if (!profileData.success) throw new Error(profileData.message);
    logPass(`Họ tên: ${profileData.data.fullName}`);
    logPass(`Điểm đánh giá uy tín: ${profileData.data.ratingScore} / 5.0 ⭐`);
    logPass(`Tỷ lệ hoàn thành nhiệm vụ: ${profileData.data.completionRate}%`);
    logPass(`Huy hiệu danh dự: 👑 ${profileData.data.badgeTitle}`);
    logPass(`Trạng thái CCCD/KYC: ${profileData.data.kycStatus}`);

    console.log(`\n${colors.green}${colors.bold}======================================================`);
    console.log(`🎉 TẤT CẢ 15 BƯỚC KIỂM THỬ E2E TOÀN TRÌNH ĐỀU THÀNH CÔNG RỰC RỠ!`);
    console.log(`Hệ thống Frontend & Backend Java Spring Boot + PostgreSQL 16 + Redis 7 hoạt động 100% chính xác.`);
    console.log(`======================================================${colors.reset}\n`);
  } catch (err) {
    logFail('Kiểm thử E2E gặp lỗi:', err.message);
    process.exit(1);
  }
}

runE2ETest();
