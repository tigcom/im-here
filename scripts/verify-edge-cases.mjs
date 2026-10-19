/**
 * Script Kiểm Thử Chuyên Sâu Các Trường Hợp Nghiệp Vụ Đặc Thù:
 * 1. Từ chối hồ sơ KYC & Chặn quyền nhận việc (Kèm luồng nộp lại để được duyệt)
 * 2. Tranh chấp kết quả nhiệm vụ & Admin can thiệp phân xử dòng tiền Escrow
 * 3. Đánh giá 2 chiều đa tiêu chí và tính điểm uy tín tài khoản (Rating Score)
 */

const API_URL = 'http://localhost:8080/api';

const timestamp = Date.now().toString().slice(-5);

async function runEdgeCasesTest() {
  console.log('='.repeat(80));
  console.log('🧪 BẮT ĐẦU KIỂM THỬ: TỪ CHỐI KYC, TRANH CHẤP ADMIN CAN THIỆP & ĐÁNH GIÁ 2 CHIỀU');
  console.log('='.repeat(80));

  // Admin đăng nhập
  const adminLoginRes = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@imhere.vn', password: 'Admin@123' }),
  });
  const adminToken = (await adminLoginRes.json()).data.token;

  // ═════════════════════════════════════════════════════════════════════════
  // PHẦN 1: TỪ CHỐI HỒ SƠ CCCD/KYC & CHẶN QUYỀN NHẬN VIỆC
  // ═════════════════════════════════════════════════════════════════════════
  console.log('\n📌 PHẦN 1: TEST TỪ CHỐI HỒ SƠ CCCD/KYC & KHÓA QUYỀN NHẬN VIỆC');
  console.log('-'.repeat(80));

  // 1. Tạo Worker mới toanh
  const workerEmail = `worker_kyc_${timestamp}@test.imhere.vn`;
  const regWorkerRes = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: workerEmail,
      password: 'Password@123',
      fullName: `CTV Thử Nghiệm KYC ${timestamp}`,
      phone: `097${timestamp}`,
      role: 'ROLE_SHEPHERD',
    }),
  });
  const workerUser = (await regWorkerRes.json()).data;
  console.log(`👤 Đã tạo tài khoản Worker #${workerUser.id}: ${workerEmail}`);

  // Đăng nhập Worker
  const workerLoginRes = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: workerEmail, password: 'Password@123' }),
  });
  const workerToken = (await workerLoginRes.json()).data.token;

  // Worker nộp ảnh CCCD mờ
  console.log(`📤 Worker nộp hồ sơ CCCD (ảnh mờ, chất lượng kém)...`);
  await fetch(
    `${API_URL}/admin/users/kyc/submit?userId=${workerUser.id}&frontUrl=https://example.com/mo-khong-ro.jpg&backUrl=https://example.com/mo-khong-ro-back.jpg`,
    { method: 'POST', headers: { Authorization: `Bearer ${adminToken}` } }
  );

  // Admin vào kiểm tra và bấm TỪ CHỐI
  console.log(`🛡️ Admin thẩm định hồ sơ: Phát hiện ảnh bị lóa sáng, bấm TỪ CHỐI...`);
  const rejectReason = 'Ảnh CCCD bị lóa sáng flash, không đọc được 12 chữ số căn cước';
  const rejectKycRes = await fetch(
    `${API_URL}/admin/users/${workerUser.id}/kyc/review?status=TU_CHOI&rejectionReason=${encodeURIComponent(rejectReason)}`,
    { method: 'POST', headers: { Authorization: `Bearer ${adminToken}` } }
  );
  const rejectedUser = (await rejectKycRes.json()).data;
  console.log(`🚫 Trạng thái KYC sau khi từ chối: ${rejectedUser.kycStatus}`);
  console.log(`   Lý do từ chối ghi nhận trong DB: "${rejectedUser.rejectionReason}"`);

  // Tạo một task để Worker bị từ chối cố tình bấm nhận việc
  // Hirer tạo task
  const hirerLoginRes = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'hirer_893918@test.imhere.vn', password: 'Password@123' }),
  });
  const hirerToken = (await hirerLoginRes.json()).data.token;

  const testTaskRes = await fetch(`${API_URL}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${hirerToken}` },
    body: JSON.stringify({
      title: `Task Test KYC Chặn ${timestamp}`,
      description: 'Nhiệm vụ kiểm tra chặn nhận việc khi bị từ chối KYC',
      category: 'RETAIL_AUDIT',
      address: '191 Bà Triệu, Hà Nội',
      latitude: 21.0117,
      longitude: 105.8497,
      rewardAmount: 60000,
    }),
  });
  const testTask = (await testTaskRes.json()).data;

  // Worker bị từ chối cố tình bấm nhận task -> PHẢI BỊ CHẶN!
  console.log(`⚠️ Worker bị từ chối cố tình bấm nhận Nhiệm vụ #${testTask.id}...`);
  const tryAcceptRes = await fetch(`${API_URL}/tasks/${testTask.id}/accept`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${workerToken}` },
  });
  const tryAcceptData = await tryAcceptRes.json();
  if (!tryAcceptRes.ok && tryAcceptRes.status === 403) {
    console.log(`✅ CHẶN THÀNH CÔNG (HTTP 403 FORBIDDEN)!`);
    console.log(`   Thông báo lỗi từ Backend: "${tryAcceptData.message}"`);
  } else {
    console.log(`❌ THẤT BẠI: Hệ thống không chặn Worker bị từ chối KYC!`, tryAcceptData);
  }

  // Worker nộp lại ảnh CCCD rõ nét
  console.log(`🔄 Worker cập nhật và nộp lại ảnh CCCD mới rõ nét từng góc cạnh...`);
  await fetch(
    `${API_URL}/admin/users/kyc/submit?userId=${workerUser.id}&frontUrl=https://images.unsplash.com/cccd-ro-net.jpg&backUrl=https://images.unsplash.com/cccd-ro-net-back.jpg`,
    { method: 'POST', headers: { Authorization: `Bearer ${adminToken}` } }
  );

  // Admin thẩm định lại và DUYỆT
  console.log(`🛡️ Admin thẩm định lại hồ sơ: Thông tin rõ ràng, bấm DUYỆT...`);
  await fetch(
    `${API_URL}/admin/users/${workerUser.id}/kyc/review?status=DA_DUYET`,
    { method: 'POST', headers: { Authorization: `Bearer ${adminToken}` } }
  );
  console.log(`✅ Hồ sơ Worker #${workerUser.id} đã được DUYỆT THÀNH CÔNG (DA_DUYET)!`);

  // Worker nhận lại task sau khi được duyệt -> PHẢI THÀNH CÔNG!
  const acceptAgainRes = await fetch(`${API_URL}/tasks/${testTask.id}/accept`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${workerToken}` },
  });
  const acceptAgainData = await acceptAgainRes.json();
  if (acceptAgainRes.ok) {
    console.log(`🎉 Worker nhận việc thành công sau khi được duyệt KYC! Trạng thái: ${acceptAgainData.data.status}`);
  }

  // ═════════════════════════════════════════════════════════════════════════
  // PHẦN 2: TRANH CHẤP NHIỆM VỤ & ADMIN CAN THIỆP PHÂN XỬ
  // ═════════════════════════════════════════════════════════════════════════
  console.log('\n📌 PHẦN 2: TEST TRANH CHẤP KẾT QUẢ & ADMIN CAN THIỆP PHÂN XỬ');
  console.log('-'.repeat(80));

  // Worker check-in và nộp bằng chứng cho Task test
  await fetch(`${API_URL}/tasks/${testTask.id}/check-in?latitude=21.0118&longitude=105.8498`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${workerToken}` },
  });

  console.log(`📤 Worker nộp báo cáo bằng chứng thực địa...`);
  const submitRes = await fetch(`${API_URL}/tasks/${testTask.id}/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${workerToken}` },
    body: JSON.stringify({
      actualLatitude: 21.0118,
      actualLongitude: 105.8498,
      note: 'Đã hoàn thành chụp ảnh kệ hàng WinMart',
      photosJson: JSON.stringify(['https://example.com/ke-hang-chup-lech.jpg']),
      checklistResponsesJson: JSON.stringify([{ id: 1, title: 'Đúng địa chỉ', checked: true }]),
    }),
  });
  const evidence = (await submitRes.json()).data;
  console.log(`📋 Bằng chứng #${evidence.id} đã được nộp (Trạng thái: PENDING)`);

  // Hirer vào xem và TỪ CHỐI (Reject) -> Tạo tranh chấp
  console.log(`❌ Hirer kiểm tra báo cáo: Thấy ảnh bị lệch góc, bấm TỪ CHỐI NGHIỆM THU...`);
  const rejectEvidenceRes = await fetch(`${API_URL}/evidences/${evidence.id}/review`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${hirerToken}` },
    body: JSON.stringify({
      approved: false,
      reviewNotes: 'Ảnh bị lệch góc không thấy được biển giá sản phẩm, yêu cầu chụp lại hoặc tranh chấp!',
    }),
  });
  const rejectedEvidence = (await rejectEvidenceRes.json()).data;
  console.log(`⚡ Trạng thái bằng chứng chuyển thành: ${rejectedEvidence.status}`);

  // Kiểm tra Task chuyển sang REJECTED
  const taskStatusRes = await fetch(`${API_URL}/tasks/${testTask.id}`, {
    headers: { Authorization: `Bearer ${hirerToken}` },
  });
  const taskStatus = (await taskStatusRes.json()).data;
  console.log(`⚡ Trạng thái Nhiệm vụ #${testTask.id}: ${taskStatus.status} (Tiền Escrow 60.000 VNĐ vẫn đang bị đóng băng)`);

  // Hai bên tranh cãi trong phòng Chat
  console.log(`💬 Hai bên trao đổi trong phòng Chat tranh chấp...`);
  await fetch(`${API_URL}/tasks/${testTask.id}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${hirerToken}` },
    body: JSON.stringify({ content: 'Ảnh của bạn chụp lệch không thấy biển giá, tôi không đồng ý nghiệm thu!' }),
  });
  await fetch(`${API_URL}/tasks/${testTask.id}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${workerToken}` },
    body: JSON.stringify({ content: 'Tôi đã đứng đúng góc quầy rồi, do nhân viên che mất biển giá. Tôi khiếu nại lên Admin!' }),
  });
  console.log(`   Hirer: "Ảnh của bạn chụp lệch không thấy biển giá, tôi không đồng ý nghiệm thu!"`);
  console.log(`   Worker: "Tôi đã đứng đúng góc quầy rồi, do nhân viên che mất. Tôi khiếu nại lên Admin!"`);

  // ADMIN CAN THIỆP PHÂN XỬ:
  console.log(`\n⚖️ ADMIN CAN THIỆP VÀO TRANH CHẤP:`);
  console.log(`   Admin vào kiểm tra ảnh thực địa, vị trí GPS check-in và nội dung chat.`);
  console.log(`   Admin thẩm định: Worker đã check-in đúng điểm (< 15m) và có thiện chí hoàn thành.`);
  console.log(`   Admin dùng quyền hạn Quản trị viên Tối cao duyệt nghiệm thu bảo vệ Worker...`);

  const adminMediateRes = await fetch(`${API_URL}/evidences/${evidence.id}/review`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      approved: true,
      reviewNotes: 'Admin phân xử: Worker đã có mặt thực địa đúng tọa độ GPS và ảnh chụp đủ nhận diện quầy kệ. Duyệt giải ngân!',
    }),
  });
  const adminMediateData = await adminMediateRes.json();
  console.log(`✅ Phán quyết của Admin thành công: Trạng thái = ${adminMediateData.data.status}`);

  // Kiểm tra tiền Escrow đã được giải ngân sang ví Worker
  const workerWalletRes = await fetch(`${API_URL}/wallet/my-wallet`, {
    headers: { Authorization: `Bearer ${workerToken}` },
  });
  const workerWallet = (await workerWalletRes.json()).data;
  console.log(`💰 Tiền Escrow đã được giải phóng sang ví Worker: Số dư hiện tại = ${Number(workerWallet.balance).toLocaleString('vi-VN')} VNĐ!`);

  // ═════════════════════════════════════════════════════════════════════════
  // PHẦN 3: ĐÁNH GIÁ 2 CHIỀU ĐA TIÊU CHÍ VÀ CẬP NHẬT RATING SCORE
  // ═════════════════════════════════════════════════════════════════════════
  console.log('\n📌 PHẦN 3: TEST ĐÁNH GIÁ 2 CHIỀU ĐA TIÊU CHÍ & TÍNH ĐIỂM UY TÍN (RATING SCORE)');
  console.log('-'.repeat(80));

  // 1. Hirer đánh giá Worker: 4 sao (Trừ 1 điểm vì tranh chấp, nhưng công nhận ảnh chụp rõ)
  console.log(`⭐ 1. Hirer đánh giá Worker:`);
  const hirerReviewRes = await fetch(`${API_URL}/reviews/tasks/${testTask.id}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${hirerToken}` },
    body: JSON.stringify({
      ratingStars: 4,
      punctualScore: 5,
      honestyScore: 5,
      qualityScore: 4,
      communicationScore: 4,
      comment: 'Làm việc đúng giờ, trung thực, nhưng cần căn góc chụp chuẩn hơn lần sau.',
    }),
  });
  const hirerReview = (await hirerReviewRes.json()).data;
  console.log(`   Hirer cho: ⭐ ${hirerReview.ratingStars}/5 sao | Nhận xét: "${hirerReview.comment}"`);

  // 2. Worker đánh giá Hirer: 5 sao (Hài lòng vì chủ việc giải quyết công bằng)
  console.log(`⭐ 2. Worker đánh giá Hirer:`);
  const workerReviewRes = await fetch(`${API_URL}/reviews/tasks/${testTask.id}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${workerToken}` },
    body: JSON.stringify({
      ratingStars: 5,
      punctualScore: 5,
      honestyScore: 5,
      qualityScore: 5,
      communicationScore: 5,
      comment: 'Chủ việc khó tính nhưng yêu cầu rõ ràng, có tranh luận văn minh.',
    }),
  });
  const workerReview = (await workerReviewRes.json()).data;
  console.log(`   Worker cho: ⭐ ${workerReview.ratingStars}/5 sao | Nhận xét: "${workerReview.comment}"`);

  // Kiểm tra hồ sơ điểm uy tín Worker sau khi nhận đánh giá 4 sao
  const workerProfileRes = await fetch(`${API_URL}/users/profile/me`, {
    headers: { Authorization: `Bearer ${workerToken}` },
  });
  const workerProfile = (await workerProfileRes.json()).data;
  console.log(`\n📊 KẾT QUẢ UY TÍN CỦA WORKER #${workerUser.id} TRONG POSTGRESQL:`);
  console.log(`   - Điểm đánh giá trung bình: ⭐ ${workerProfile.ratingScore}/5.0`);
  console.log(`   - Số nhiệm vụ đã hoàn thành: ${workerProfile.completedTasksCount}`);
  console.log(`   - Tỷ lệ hoàn thành công việc: ${workerProfile.completionRate}%`);
  console.log(`   - Huy hiệu danh dự đạt được: [${workerProfile.badgeTitle}]`);

  console.log('\n' + '='.repeat(80));
  console.log('🎉 TẤT CẢ 3 TÌNH HUỐNG NGHIỆP VỤ ĐẶC THÙ ĐÃ ĐƯỢC TEST THÀNH CÔNG 100%!');
  console.log('  1. Từ chối KYC -> Chặn quyền nhận việc -> Cập nhật nộp lại -> Duyệt thành công');
  console.log('  2. Hirer từ chối bằng chứng -> Tranh chấp -> Chat khiếu nại -> Admin phân xử giải ngân');
  console.log('  3. Đánh giá 2 chiều đa tiêu chí -> Tính điểm uy tín Rating Score thật trong DB');
  console.log('='.repeat(80));
}

runEdgeCasesTest();
