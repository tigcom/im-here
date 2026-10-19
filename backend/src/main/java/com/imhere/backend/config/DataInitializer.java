package com.imhere.backend.config;

import com.imhere.backend.modules.evidence.Evidence;
import com.imhere.backend.modules.evidence.EvidenceRepository;
import com.imhere.backend.modules.evidence.EvidenceStatus;
import com.imhere.backend.modules.task.Task;
import com.imhere.backend.modules.task.TaskCategory;
import com.imhere.backend.modules.task.TaskRepository;
import com.imhere.backend.modules.task.TaskStatus;
import com.imhere.backend.modules.user.Role;
import com.imhere.backend.modules.user.User;
import com.imhere.backend.modules.user.UserRepository;
import com.imhere.backend.modules.user.UserStatus;
import com.imhere.backend.modules.wallet.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final TaskRepository taskRepository;
    private final EvidenceRepository evidenceRepository;
    private final TransactionRepository transactionRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        log.info("Kiểm tra và đồng bộ dữ liệu nền tảng thực tế vào PostgreSQL...");

        // 1. TẠO TÀI KHOẢN ADMIN (Đã duyệt để quản trị)
        User admin = createUserIfNotExist(
                "admin@imhere.vn", "Admin@123", "Trần Văn Quản Trị",
                "0901234567", Role.ROLE_ADMIN, 5.0, 0, BigDecimal.valueOf(100000000),
                com.imhere.backend.modules.user.KycStatus.DA_DUYET
        );

        // 2. TẠO TÀI KHOẢN DOANH NGHIỆP & NGƯỜI THUÊ
        User clientB2B = createUserIfNotExist(
                "client@vinmart.vn", "Client@123", "Tập Đoàn Bán Lẻ WinCommerce",
                "0912345678", Role.ROLE_USER, 4.9, 0, BigDecimal.valueOf(50000000),
                com.imhere.backend.modules.user.KycStatus.DA_DUYET
        );

        User clientIndividual = createUserIfNotExist(
                "lan.nguyen@gmail.com", "Client@123", "Nguyễn Thị Lan (Người thuê cá nhân)",
                "0933112233", Role.ROLE_USER, 4.85, 0, BigDecimal.valueOf(5000000),
                com.imhere.backend.modules.user.KycStatus.CHUA_NOP
        );

        // 3. TẠO TÀI KHOẢN CỘNG TÁC VIÊN THỰC ĐỊA (SHEPHERD / LOOKER)
        User looker1 = createUserIfNotExist(
                "thanh.nguyen@imhere.vn", "Shepherd@123", "Nguyễn Văn Thành (Top Looker TP.HCM)",
                "0908123456", Role.ROLE_USER, 4.96, 84, BigDecimal.valueOf(2450000),
                com.imhere.backend.modules.user.KycStatus.DA_DUYET
        );

        // Looker 2: Đang ở trạng thái CHO_DUYET để Admin vào hàng đợi thấy ngay
        User looker2 = createUserIfNotExist(
                "long.le@imhere.vn", "Shepherd@123", "Lê Hoàng Long (Auditor Quận 1)",
                "0918888999", Role.ROLE_USER, 4.92, 42, BigDecimal.valueOf(1120000),
                com.imhere.backend.modules.user.KycStatus.CHO_DUYET
        );
        if (looker2.getIdCardFrontUrl() == null) {
            looker2.setIdCardFrontUrl("https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600");
            looker2.setIdCardBackUrl("https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600");
            userRepository.save(looker2);
        }

        User looker3 = createUserIfNotExist(
                "shepherd@imhere.vn", "Shepherd@123", "Trần Minh Quân (Auditor Hà Nội)",
                "0987654321", Role.ROLE_USER, 4.88, 18, BigDecimal.valueOf(680000),
                com.imhere.backend.modules.user.KycStatus.DA_DUYET
        );

        // 3b. TẠO TÀI KHOẢN NGƯỜI DÙNG ĐA NĂNG (VỪA THUÊ VỪA NHẬN VIỆC) - CHƯA NỘP KYC
        User unifiedUser = createUserIfNotExist(
                "user@imhere.vn", "User@123", "Hoàng Nam (Người Dùng Nền Tảng)",
                "0977889900", Role.ROLE_USER, 5.0, 12, BigDecimal.valueOf(1500000),
                com.imhere.backend.modules.user.KycStatus.CHUA_NOP
        );

        // 4. TẠO BỘ DỮ LIỆU NHIỆM VỤ THỰC ĐỊA (TASKS) NẾU CHƯA CÓ ĐỦ
        if (taskRepository.count() < 5) {
            log.info("Đang nạp các nhiệm vụ thực địa mẫu thực tế...");

            // T1: Mua thịt heo và rau củ Chợ Bến Thành (TP.HCM)
            createTaskWithEscrow(
                    clientIndividual, null,
                    "Mua 2kg thịt heo và rau củ ở chợ Bến Thành",
                    "Nhờ mua giúp 2kg thịt heo xay và 1 bó rau muống ở chợ Bến Thành. Cổng số 3 hướng đường Lê Thánh Tôn.",
                    TaskCategory.RETAIL_AUDIT, TaskStatus.CREATED,
                    "Chợ Bến Thành, Lê Lợi, Phường Bến Thành, Quận 1, TP.HCM",
                    10.7725, 106.6980, BigDecimal.valueOf(60000),
                    "Nhớ lấy hoá đơn hoặc chụp ảnh cân thịt.", false, null
            );

            // T2: Xếp hàng mua vé xem phim CGV Đồng Khởi (TP.HCM)
            createTaskWithEscrow(
                    clientIndividual, null,
                    "Xếp hàng mua 2 vé xem phim ở CGV Vincom Đồng Khởi",
                    "Suất chiếu 19:30 tối nay. Nhờ bạn tới sớm xếp hàng mua 2 vé ghế giữa.",
                    TaskCategory.MYSTERY_SHOPPING, TaskStatus.CREATED,
                    "CGV Vincom Đồng Khởi, 72 Lê Thánh Tôn, Bến Nghé, Quận 1, TP.HCM",
                    10.7770, 106.7025, BigDecimal.valueOf(80000),
                    "Chụp rõ số ghế và cuống vé.", false, null
            );

            // T3: Lấy số thứ tự Bệnh viện Mắt (TP.HCM) - Đang gán cho Thành
            createTaskWithEscrow(
                    clientIndividual, looker1,
                    "Lấy số thứ tự khám sáng sớm tại Bệnh viện Mắt TP.HCM",
                    "Cần lấy số trước 6h30 sáng tại khu khám dịch vụ cổng Điện Biên Phủ.",
                    TaskCategory.KYC_VERIFICATION, TaskStatus.ASSIGNED,
                    "280 Điện Biên Phủ, Phường Võ Thị Sáu, Quận 3, TP.HCM",
                    10.7745, 106.6890, BigDecimal.valueOf(75000),
                    "Chụp phiếu khám có dấu mộc.", true, looker1
            );

            // T4: Kiểm tra quầy kệ sữa bột WinMart Bà Triệu (Hà Nội) - ĐÃ NỘP BẰNG CHỨNG CHỜ QA
            Task t4 = createTaskWithEscrow(
                    clientB2B, looker3,
                    "Kiểm tra quầy kệ sữa bột chuỗi WinMart Bà Triệu",
                    "Chụp 4 bức ảnh toàn cảnh quầy sữa, kiểm tra việc gắn tem khuyến mại và kiểm tra date sản phẩm.",
                    TaskCategory.RETAIL_AUDIT, TaskStatus.SUBMITTED,
                    "24 Bà Triệu, Phường Hàng Bài, Quận Hoàn Kiếm, Hà Nội",
                    21.0116, 105.8505, BigDecimal.valueOf(120000),
                    "1. Bật GPS trên app.\n2. Chụp ảnh góc rộng.\n3. Điền checklist hạn dùng.",
                    true, looker3
            );

            // Tạo bằng chứng tương ứng cho T4
            if (evidenceRepository.findByTaskIdOrderBySubmittedAtDesc(t4.getId()).isEmpty()) {
                Evidence ev4 = Evidence.builder()
                        .task(t4)
                        .shepherd(looker3)
                        .note("Đã chụp đủ 4 góc quầy sữa Friso và Abbott, tem giá đầy đủ.")
                        .actualLatitude(21.0117)
                        .actualLongitude(105.8506)
                        .distanceFromTaskMeters(14.5)
                        .isGpsVerified(true)
                        .photosJson("[\"https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800\",\"https://images.unsplash.com/photo-1542838132-92c53300491e?w=800\"]")
                        .checklistResponsesJson("{\"shelf_clean\":true,\"promotion_tagged\":true,\"stock_sufficient\":true}")
                        .status(EvidenceStatus.PENDING)
                        .build();
                evidenceRepository.save(ev4);
            }

            // T5: Xác minh địa chỉ nhà thuốc Cầu Giấy (Hà Nội) - ĐÃ DUYỆT (APPROVED)
            Task t5 = createTaskWithEscrow(
                    clientB2B, looker3,
                    "Xác minh địa chỉ & mặt tiền nhà thuốc Pharmacity Cầu Giấy",
                    "Xác nhận thông tin nhà thuốc có đang hoạt động thực tế, chụp ảnh biển hiệu và bảng số nhà.",
                    TaskCategory.KYC_VERIFICATION, TaskStatus.APPROVED,
                    "155 Cầu Giấy, Phường Quan Hoa, Quận Cầu Giấy, Hà Nội",
                    21.0362, 105.7891, BigDecimal.valueOf(90000),
                    "Chụp rõ số nhà và biển hiệu vào ban ngày.", true, looker3
            );

            // Tạo bằng chứng đã duyệt cho T5
            if (evidenceRepository.findByTaskIdOrderBySubmittedAtDesc(t5.getId()).isEmpty()) {
                Evidence ev5 = Evidence.builder()
                        .task(t5)
                        .shepherd(looker3)
                        .note("Nhà thuốc đang hoạt động bình thường, mở cửa từ 6h - 23h.")
                        .actualLatitude(21.0363)
                        .actualLongitude(105.7892)
                        .distanceFromTaskMeters(11.2)
                        .isGpsVerified(true)
                        .photosJson("[\"https://images.unsplash.com/photo-1586015555751-63c29994c6a6?w=800\"]")
                        .checklistResponsesJson("{\"address_correct\":true,\"is_operating\":true}")
                        .status(EvidenceStatus.APPROVED)
                        .reviewedBy(admin)
                        .reviewedAt(Instant.now().minus(1, ChronoUnit.DAYS))
                        .reviewNotes("Hình ảnh rõ nét, khớp toạ độ vệ tinh.")
                        .build();
                evidenceRepository.save(ev5);
            }

            // T6: Kiểm định bất động sản mặt phố Nguyễn Huệ (TP.HCM)
            createTaskWithEscrow(
                    clientB2B, null,
                    "Kiểm định hiện trạng bất động sản cho thuê số 68 Nguyễn Huệ",
                    "Kiểm tra mặt bằng thương mại, chụp ảnh hiện trạng bên trong và bên ngoài toà nhà.",
                    TaskCategory.ASSET_INSPECTION, TaskStatus.CREATED,
                    "68 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh",
                    10.7745, 106.7034, BigDecimal.valueOf(350000),
                    "Yêu cầu chụp tối thiểu 6 ảnh bao quát các góc tường và trần.", false, null
            );

            // T7: Khảo sát quầy bánh kẹo WinMart Liễu Giai (Hà Nội)
            createTaskWithEscrow(
                    clientB2B, null,
                    "Khảo sát trưng bày quầy bánh kẹo WinMart Liễu Giai",
                    "Chụp ảnh kệ bánh Orion, kiểm tra vị trí đặt line sản phẩm có đúng sơ đồ planogram không.",
                    TaskCategory.RETAIL_AUDIT, TaskStatus.CREATED,
                    "29 Liễu Giai, Phường Ngọc Khánh, Quận Ba Đình, Hà Nội",
                    21.0315, 105.8152, BigDecimal.valueOf(150000),
                    "Bật định vị GPS trước khi chụp.", false, null
            );

            // T8: Kiểm tra biển hiệu & giá Circle K Tân Bình (TP.HCM)
            createTaskWithEscrow(
                    clientB2B, null,
                    "Kiểm tra biển hiệu & bảng giá khuyến mại Circle K Cộng Hòa",
                    "Kiểm tra banner khuyến mãi mùa hè tại mặt tiền cửa hàng.",
                    TaskCategory.RETAIL_AUDIT, TaskStatus.CREATED,
                    "18 Cộng Hòa, Phường 4, Quận Tân Bình, TP. Hồ Chí Minh",
                    10.8012, 106.6543, BigDecimal.valueOf(110000),
                    "Chụp từ khoảng cách 5m thấy toàn bộ mặt tiền.", false, null
            );
        }

        log.info("Khởi tạo và đồng bộ dữ liệu nền tảng thực tế thành công!");
    }

    private User createUserIfNotExist(
            String email, String rawPassword, String fullName, String phone,
            Role role, Double rating, int completedTasks, BigDecimal walletBalance,
            com.imhere.backend.modules.user.KycStatus kycStatus
    ) {
        return userRepository.findByEmail(email).map(existing -> {
            if (existing.getRole() != role) {
                existing.setRole(role);
            }
            return existing;
        }).orElseGet(() -> {
            User u = User.builder()
                    .email(email)
                    .password(passwordEncoder.encode(rawPassword))
                    .fullName(fullName)
                    .phone(phone)
                    .role(role)
                    .status(UserStatus.ACTIVE)
                    .ratingScore(rating)
                    .completedTasksCount(completedTasks)
                    .kycStatus(kycStatus)
                    .build();
            User saved = userRepository.save(u);

            Wallet w = Wallet.builder()
                    .user(saved)
                    .balance(walletBalance)
                    .escrowBalance(BigDecimal.ZERO)
                    .build();
            Wallet savedWallet = walletRepository.saveAndFlush(w);

            Transaction tx = Transaction.builder()
                    .wallet(savedWallet)
                    .amount(walletBalance)
                    .type(TransactionType.DEPOSIT)
                    .status(TransactionStatus.SUCCESS)
                    .description("Nạp tiền ban đầu mở tài khoản")
                    .build();
            transactionRepository.saveAndFlush(tx);

            return saved;
        });
    }

    private Task createTaskWithEscrow(
            User client, User shepherd, String title, String description,
            TaskCategory category, TaskStatus status, String address,
            Double lat, Double lng, BigDecimal reward, String instructions, boolean isCheckedIn, User checkedInBy
    ) {
        Task task = Task.builder()
                .client(client)
                .assignedShepherd(shepherd)
                .title(title)
                .description(description)
                .category(category)
                .status(status)
                .address(address)
                .latitude(lat)
                .longitude(lng)
                .rewardAmount(reward)
                .instructions(instructions)
                .deadline(Instant.now().plus(7, ChronoUnit.DAYS))
                .isCheckedIn(isCheckedIn)
                .checkedInAt(isCheckedIn ? Instant.now().minus(2, ChronoUnit.HOURS) : null)
                .checkInLatitude(isCheckedIn ? lat : null)
                .checkInLongitude(isCheckedIn ? lng : null)
                .build();
        Task saved = taskRepository.save(task);

        // Ký quỹ từ ví của Client
        walletRepository.findByUserId(client.getId()).ifPresent(w -> {
            if (status != TaskStatus.APPROVED) {
                w.setEscrowBalance(w.getEscrowBalance().add(reward));
                Wallet updatedWallet = walletRepository.saveAndFlush(w);
                transactionRepository.save(Transaction.builder()
                        .wallet(updatedWallet)
                        .amount(reward)
                        .type(TransactionType.ESCROW_HOLD)
                        .status(TransactionStatus.SUCCESS)
                        .referenceId("TASK-" + saved.getId())
                        .description("Ký quỹ nhiệm vụ #" + saved.getId() + ": " + title)
                        .build());
            }
        });

        return saved;
    }
}
