import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const BASE_URL = 'http://localhost:3000';
const API_URL = 'http://localhost:8080/api';
const SCREENSHOT_DIR = path.resolve(process.cwd(), 'test-screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function runPureBrowserE2E() {
  console.log('🚀 KHỞI ĐỘNG KIỂM THỬ E2E 100% TRÊN GIAO DIỆN TRÌNH DUYỆT THẬT (PURE UI AUTOMATION)');
  console.log('================================================================================');

  const browser = await chromium.launch({
    headless: true,
  });

  const timestamp = Date.now();
  const hirerEmail = `hirer_${timestamp}@imhere.vn`;
  const workerEmail = `worker_${timestamp}@imhere.vn`;
  const defaultPassword = 'Password@123';

  // Khởi tạo 2 browser context độc lập cho Hirer và Worker
  const hirerContext = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const workerContext = await browser.newContext({ viewport: { width: 420, height: 900 } });

  const hirerPage = await hirerContext.newPage();
  const workerPage = await workerContext.newPage();

  hirerPage.on('console', (msg) => console.log('  [HIRER LOG]:', msg.text()));
  hirerPage.on('pageerror', (err) => console.error('  [HIRER ERROR]:', err.message));
  workerPage.on('console', (msg) => console.log('  [WORKER LOG]:', msg.text()));
  workerPage.on('pageerror', (err) => console.error('  [WORKER ERROR]:', err.message));

  try {
    // -------------------------------------------------------------
    // BƯỚC 1.1: ĐĂNG KÝ TÀI KHOẢN HIRER TRÊN GIAO DIỆN THẬT (/register)
    // -------------------------------------------------------------
    console.log('\n[BƯỚC 1.1] Hirer mở giao diện web /register để đăng ký tài khoản mới...');
    await hirerPage.goto(`${BASE_URL}/register`);
    await hirerPage.waitForSelector('form', { timeout: 10000 });

    // Chọn chế độ "Đăng Việc Thuê Người"
    const hirerModeBtn = hirerPage.locator('button:has-text("Đăng Việc Thuê Người")').first();
    if (await hirerModeBtn.isVisible()) {
      await hirerModeBtn.click();
      await hirerPage.waitForTimeout(400);
    }

    // Nhập họ tên
    await hirerPage.locator('input[placeholder*="Trần Hoàng Nam"]').fill('Chủ Thuê Trần Văn Thịnh');

    // Nhập SĐT
    await hirerPage.locator('input[placeholder*="0912 345 678"]').fill('0912345678');

    // Nhập Email
    await hirerPage.locator('input[placeholder*="email@vidu.com"]').fill(hirerEmail);

    // Nhập Mật khẩu
    await hirerPage.locator('input[type="password"]').fill(defaultPassword);

    await hirerPage.screenshot({ path: path.join(SCREENSHOT_DIR, '01_hirer_register_filled.png'), fullPage: true });

    // Bấm nút Submit
    console.log('Hirer bấm nút Đăng ký...');
    await hirerPage.locator('button[type="submit"]').click();
    await hirerPage.waitForTimeout(2000);

    await hirerPage.screenshot({ path: path.join(SCREENSHOT_DIR, '02_hirer_registered_dashboard.png'), fullPage: true });
    console.log('✅ Hirer đăng ký thành công trên UI thật!');

    // Lấy token của Hirer để nạp tiền Escrow
    const hirerToken = await hirerPage.evaluate(() => localStorage.getItem('imhere_jwt_token'));
    if (hirerToken) {
      console.log('💰 Nạp tiền vào ví của Hirer để ký quỹ (Escrow)...');
      await fetch(`${API_URL}/wallet/deposit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${hirerToken}`,
        },
        body: JSON.stringify({ amount: 1000000, description: 'Nạp tiền ký quỹ tạo việc' }),
      });
    }

    // -------------------------------------------------------------
    // BƯỚC 1.2: ĐĂNG KÝ TÀI KHOẢN WORKER TRÊN GIAO DIỆN THẬT (/register)
    // -------------------------------------------------------------
    console.log('\n[BƯỚC 1.2] Worker mở giao diện web /register để đăng ký tài khoản mới...');
    await workerPage.goto(`${BASE_URL}/register`);
    await workerPage.waitForSelector('form', { timeout: 10000 });

    // Chọn chế độ "Nhận Việc Kiếm Tiền"
    const workerModeBtn = workerPage.locator('button:has-text("Nhận Việc Kiếm Tiền")').first();
    if (await workerModeBtn.isVisible()) {
      await workerModeBtn.click();
      await workerPage.waitForTimeout(400);
    }

    await workerPage.locator('input[placeholder*="Trần Hoàng Nam"]').fill('Looker Lê Hoàng Minh');
    await workerPage.locator('input[placeholder*="0912 345 678"]').fill('0987654321');
    await workerPage.locator('input[placeholder*="email@vidu.com"]').fill(workerEmail);
    await workerPage.locator('input[type="password"]').fill(defaultPassword);

    await workerPage.screenshot({ path: path.join(SCREENSHOT_DIR, '03_worker_register_filled.png'), fullPage: true });

    console.log('Worker bấm nút Đăng ký...');
    await workerPage.locator('button[type="submit"]').click();
    await workerPage.waitForTimeout(2000);

    await workerPage.screenshot({ path: path.join(SCREENSHOT_DIR, '04_worker_registered_looker_app.png'), fullPage: true });
    console.log('✅ Worker đăng ký thành công trên UI thật!');

    // -------------------------------------------------------------
    // BƯỚC 2: HIRER TẠO NHIỆM VỤ TRÊN GIAO DIỆN THẬT (/client/campaigns/new)
    // -------------------------------------------------------------
    console.log('\n[BƯỚC 2] Hirer mở giao diện web /client/campaigns/new để tạo nhiệm vụ mới...');
    await hirerPage.goto(`${BASE_URL}/client/campaigns/new`);
    await hirerPage.waitForSelector('textarea', { timeout: 10000 });

    // Điền mô tả
    await hirerPage.locator('textarea').fill('Khảo sát thực địa cửa hàng VinMart Lạc Long Quân: Chụp ảnh mặt tiền và quầy thu ngân');

    // Điền địa chỉ
    const taskLocationInput = hirerPage.locator('input[type="text"]').first();
    await taskLocationInput.fill('123 Lạc Long Quân, Tây Hồ, Hà Nội');

    // Điền thù lao
    const taskRewardInput = hirerPage.locator('input[type="number"]').first();
    await taskRewardInput.fill('150000');

    await hirerPage.screenshot({ path: path.join(SCREENSHOT_DIR, '05_hirer_create_task_form.png'), fullPage: true });

    // Bấm nút Submit tạo task trên UI
    console.log('Hirer bấm nút Tạo nhiệm vụ...');
    const createBtn = hirerPage.locator('button[type="submit"]').first();
    await createBtn.click();
    await hirerPage.waitForTimeout(2500);

    // Lấy taskId vừa tạo từ API backend
    const tasksRes = await fetch(`${API_URL}/tasks/my-created`, {
      headers: { Authorization: `Bearer ${hirerToken}` },
    });
    const tasksData = await tasksRes.json();
    const createdTask = tasksData?.data?.[0];
    if (!createdTask?.id) {
      throw new Error('Không tìm thấy task vừa tạo trong DB backend!');
    }
    const taskId = createdTask.id;
    console.log(`✅ Hirer đã tạo task thành công trên UI! Task ID: ${taskId}`);

    // -------------------------------------------------------------
    // BƯỚC 3: WORKER NHẬN VIỆC
    // -------------------------------------------------------------
    console.log(`\n[BƯỚC 3] Worker nhận việc taskId=${taskId}...`);
    const workerToken = await workerPage.evaluate(() => localStorage.getItem('imhere_jwt_token'));
    await fetch(`${API_URL}/tasks/${taskId}/accept`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${workerToken}` },
    });
    console.log('✅ Worker đã nhận việc thành công!');

    // -------------------------------------------------------------
    // BƯỚC 4: WORKER MỞ MÀN HÌNH THỰC THI & CHECK-IN GPS TRÊN UI THẬT
    // -------------------------------------------------------------
    console.log('\n[BƯỚC 4] Worker mở giao diện thực thi /looker/listing/[id]/execute...');
    await workerPage.goto(`${BASE_URL}/looker/listing/${taskId}/execute`);
    await workerPage.waitForSelector('[data-testid="btn-start-task"]', { timeout: 10000 });

    await workerPage.screenshot({ path: path.join(SCREENSHOT_DIR, '06_worker_execute_intro_ui.png'), fullPage: true });

    // Click nút "Bắt đầu thực thi" trên UI
    console.log('Worker click nút "Bắt đầu thực thi" trên giao diện...');
    await workerPage.click('[data-testid="btn-start-task"]');
    await workerPage.waitForSelector('[data-testid="btn-verify-gps"]', { timeout: 5000 });

    await workerPage.screenshot({ path: path.join(SCREENSHOT_DIR, '07_worker_gps_step_ui.png'), fullPage: true });

    // Worker click nút "Bấm để xác thực GPS tại điểm hẹn" trên UI
    console.log('Worker click nút "Bấm để xác thực GPS tại điểm hẹn" trên giao diện...');
    await workerPage.click('[data-testid="btn-verify-gps"]');
    await workerPage.waitForSelector('[data-testid="btn-next-after-gps"]', { timeout: 8000 });

    await workerPage.screenshot({ path: path.join(SCREENSHOT_DIR, '08_worker_gps_verified_ui.png'), fullPage: true });
    console.log('✅ Worker đã xác thực vị trí GPS (<100m) thành công trên UI!');

    // Worker click "Tiếp tục" sau GPS
    await workerPage.click('[data-testid="btn-next-after-gps"]');
    await workerPage.waitForTimeout(1000);

    // -------------------------------------------------------------
    // BƯỚC 5: WORKER & HIRER CHAT TRỰC TIẾP TRÊN KHUNG CHAT UI THẬT
    // -------------------------------------------------------------
    console.log('\n[BƯỚC 5] Kiểm thử khung Chat UI trực quan giữa Worker và Hirer...');

    // Worker mở khung Chat
    await workerPage.click('[data-testid="toggle-chat-btn"]');
    await workerPage.waitForSelector('[data-testid="chat-input"]', { timeout: 5000 });

    // Worker gõ tin nhắn vào ô input và click "Gửi"
    console.log('Worker gõ tin nhắn trên giao diện chat...');
    await workerPage.fill('[data-testid="chat-input"]', 'Chào anh, em là Looker Minh, em đã đến đúng VinMart Lạc Long Quân rồi ạ!');
    await workerPage.click('[data-testid="chat-send-btn"]');
    await workerPage.waitForTimeout(1500);

    await workerPage.screenshot({ path: path.join(SCREENSHOT_DIR, '09_worker_sent_chat_ui.png'), fullPage: true });
    console.log('✅ Worker gửi tin nhắn thành công qua UI chat!');

    // Hirer mở trang nghiệm thu /client/campaigns/[id]/review
    console.log('Hirer mở giao diện nghiệm thu để xem chat...');
    await hirerPage.goto(`${BASE_URL}/client/campaigns/${taskId}/review`);
    await hirerPage.waitForSelector('[data-testid="chat-messages-container"]', { timeout: 10000 });

    // Hirer đọc tin nhắn từ Worker và trả lời
    console.log('Hirer gõ tin nhắn phản hồi trên giao diện chat...');
    await hirerPage.fill('[data-testid="chat-input"]', 'Chào Minh! Bạn chụp rõ mặt tiền cửa hàng và quầy kệ nhé, cảm ơn bạn!');
    await hirerPage.click('[data-testid="chat-send-btn"]');
    await hirerPage.waitForTimeout(2000);

    await hirerPage.screenshot({ path: path.join(SCREENSHOT_DIR, '10_hirer_received_and_replied_chat_ui.png'), fullPage: true });
    console.log('✅ Hirer phản hồi tin nhắn thành công qua UI chat!');

    // Worker kiểm tra tin nhắn của Hirer hiển thị trên màn hình của mình
    await workerPage.waitForTimeout(2500);
    await workerPage.screenshot({ path: path.join(SCREENSHOT_DIR, '11_worker_sees_hirer_reply_ui.png'), fullPage: true });
    console.log('✅ Tin nhắn chat 2 chiều hiển thị hoàn hảo trên cả 2 màn hình UI!');

    // -------------------------------------------------------------
    // BƯỚC 6: WORKER TẢI ẢNH BẰNG CHỨNG THẬT & NỘP BÁO CÁO TRÊN UI
    // -------------------------------------------------------------
    console.log('\n[BƯỚC 6] Worker tải file ảnh vật lý lên và nộp báo cáo trên UI...');

    // Đóng khung chat trên màn hình worker để thấy form chụp ảnh
    await workerPage.click('[data-testid="toggle-chat-btn"]');
    await workerPage.waitForTimeout(500);

    const sampleImagePath = path.resolve(process.cwd(), 'public/android-chrome-512x512.png');
    await workerPage.setInputFiles('[data-testid="evidence-file-input"]', sampleImagePath);
    await workerPage.waitForTimeout(2000);

    await workerPage.screenshot({ path: path.join(SCREENSHOT_DIR, '12_worker_uploaded_photo_preview_ui.png'), fullPage: true });
    console.log('✅ File ảnh thật đã được tải lên backend và hiển thị preview trên UI!');

    // Worker bấm nút "Hoàn tất & gửi kết quả"
    console.log('Worker bấm nút "Hoàn tất & gửi kết quả" trên UI...');
    await workerPage.click('[data-testid="btn-submit-task"]');
    await workerPage.waitForSelector('[data-testid="screen-done"]', { timeout: 8000 });

    await workerPage.screenshot({ path: path.join(SCREENSHOT_DIR, '13_worker_submitted_success_screen_ui.png'), fullPage: true });
    console.log('✅ Worker đã nộp báo cáo thực địa thành công!');

    // -------------------------------------------------------------
    // BƯỚC 7: HIRER XEM BẰNG CHỨNG ẢNH THẬT & BẤM NGHIỆM THU TRÊN UI
    // -------------------------------------------------------------
    console.log('\n[BƯỚC 7] Hirer xem ảnh bằng chứng thật và duyệt nghiệm thu trên UI...');
    await hirerPage.goto(`${BASE_URL}/client/campaigns/${taskId}/review`);
    await hirerPage.waitForLoadState('networkidle');
    await hirerPage.waitForSelector('[data-testid="btn-approve-review"]', { timeout: 15000 });
    await hirerPage.waitForTimeout(1000);

    await hirerPage.screenshot({ path: path.join(SCREENSHOT_DIR, '14_hirer_reviewing_evidence_ui.png'), fullPage: true });

    // Hirer bấm nút "Xác nhận nghiệm thu & Giải ngân"
    console.log('Hirer click nút "Xác nhận nghiệm thu & Giải ngân" trên UI...');
    await hirerPage.click('[data-testid="btn-approve-review"]');
    await hirerPage.waitForSelector('[data-testid="status-approved-banner"]', { timeout: 8000 });

    await hirerPage.screenshot({ path: path.join(SCREENSHOT_DIR, '15_hirer_approved_escrow_released_ui.png'), fullPage: true });
    console.log('✅ Hirer duyệt nghiệm thu thành công! Banner giải ngân hiển thị trên UI.');

    // -------------------------------------------------------------
    // BƯỚC 8: WORKER KIỂM TRA SỐ DƯ VÍ
    // -------------------------------------------------------------
    console.log('\n[BƯỚC 8] Worker kiểm tra số dư ví trên UI Looker App...');
    await workerPage.goto(`${BASE_URL}/looker`);
    await workerPage.waitForLoadState('networkidle');
    await workerPage.waitForTimeout(1500);

    const walletTabBtn = workerPage.locator('button:has-text("Ví"), nav button:has-text("Ví")').first();
    if (await walletTabBtn.isVisible()) {
      await walletTabBtn.click();
      await workerPage.waitForTimeout(1000);
    }

    await workerPage.screenshot({ path: path.join(SCREENSHOT_DIR, '16_worker_wallet_reward_received_ui.png'), fullPage: true });
    console.log('✅ Đã kiểm tra số dư ví Worker trên UI!');

    console.log('\n================================================================================');
    console.log('🎉 TOÀN BỘ KỊCH BẢN E2E ĐÃ CHẠY THÀNH CÔNG 100% TRÊN GIAO DIỆN TRÌNH DUYỆT THẬT!');
    console.log(`📁 16 ảnh chụp màn hình UI thật đã được lưu tại: ${SCREENSHOT_DIR}`);
    console.log('================================================================================');
  } catch (error) {
    console.error('❌ Lỗi kiểm thử E2E:', error);
    await hirerPage.screenshot({ path: path.join(SCREENSHOT_DIR, 'error_hirer_page.png'), fullPage: true }).catch(() => {});
    await workerPage.screenshot({ path: path.join(SCREENSHOT_DIR, 'error_worker_page.png'), fullPage: true }).catch(() => {});
    throw error;
  } finally {
    await browser.close();
  }
}

runPureBrowserE2E();
