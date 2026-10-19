package com.imhere.backend.modules.evidence;

import com.imhere.backend.common.CustomException;
import com.imhere.backend.modules.evidence.dto.EvidenceResponse;
import com.imhere.backend.modules.evidence.dto.ReviewEvidenceRequest;
import com.imhere.backend.modules.evidence.dto.SubmitEvidenceRequest;
import com.imhere.backend.modules.task.Task;
import com.imhere.backend.modules.task.TaskRepository;
import com.imhere.backend.modules.task.TaskServiceImpl;
import com.imhere.backend.modules.task.TaskStatus;
import com.imhere.backend.modules.user.User;
import com.imhere.backend.modules.user.UserRepository;
import com.imhere.backend.modules.wallet.WalletService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.Duration;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EvidenceServiceImpl implements EvidenceService {

    private final EvidenceRepository evidenceRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final WalletService walletService;
    private final com.imhere.backend.modules.notification.NotificationService notificationService;

    private static final double MAX_ALLOWED_DISTANCE_METERS = 100.0;

    @org.springframework.scheduling.annotation.Scheduled(fixedDelayString = "${imhere.evidence.auto-approve-interval-ms:300000}")
    @Transactional
    public void autoApproveExpiredEvidence() {
        Instant cutoff = Instant.now().minus(Duration.ofHours(24));
        List<Evidence> expiredEvidences = evidenceRepository.findByStatusAndSubmittedAtBefore(EvidenceStatus.PENDING, cutoff);
        for (Evidence evidence : expiredEvidences) {
            try {
                Task task = evidence.getTask();
                if (task != null && task.getStatus() == TaskStatus.SUBMITTED && evidence.getStatus() == EvidenceStatus.PENDING) {
                    evidence.setStatus(EvidenceStatus.APPROVED);
                    evidence.setReviewedAt(Instant.now());
                    evidence.setReviewNotes("Hệ thống tự động nghiệm thu sau 24 giờ người đăng không phản hồi");
                    task.setStatus(TaskStatus.APPROVED);

                    walletService.releaseEscrow(
                            task.getClient().getId(),
                            task.getAssignedShepherd().getId(),
                            task.getRewardAmount(),
                            task.getId()
                    );
                    evidenceRepository.save(evidence);
                    taskRepository.save(task);

                    if (task.getAssignedShepherd() != null) {
                        notificationService.sendNotification(
                                task.getAssignedShepherd(),
                                "Nhiệm vụ đã được tự động nghiệm thu!",
                                String.format("Nhiệm vụ #%d \"%s\" đã tự động hoàn thành sau 24h. Thù lao đã chuyển vào ví của bạn.", task.getId(), task.getTitle()),
                                com.imhere.backend.modules.notification.NotificationType.TASK_APPROVED,
                                "/looker/listing/" + task.getId() + "/execute"
                        );
                    }
                }
            } catch (Exception ignored) {
            }
        }
    }

    @Override
    @Transactional
    public EvidenceResponse submitEvidence(Long taskId, Long shepherdId, SubmitEvidenceRequest request) {
        Task task = taskRepository.findByIdWithLock(taskId)
                .orElseThrow(() -> new CustomException("Không tìm thấy nhiệm vụ", HttpStatus.NOT_FOUND));

        if (task.getAssignedShepherd() == null || !task.getAssignedShepherd().getId().equals(shepherdId)) {
            throw new CustomException("Chỉ CTV được phân công mới có quyền nộp báo cáo thực địa", HttpStatus.FORBIDDEN);
        }

        User shepherd = userRepository.findById(shepherdId)
                .orElseThrow(() -> new CustomException("Không tìm thấy CTV", HttpStatus.NOT_FOUND));

        if (shepherd.getStatus() == com.imhere.backend.modules.user.UserStatus.BLOCKED) {
            throw new CustomException("Tài khoản của bạn đã bị khóa, không thể nộp báo cáo", HttpStatus.FORBIDDEN);
        }

        if (task.getDeadline() != null && Instant.now().isAfter(task.getDeadline())) {
            throw new CustomException("Nhiệm vụ này đã quá hạn nộp báo cáo (Deadline: " + task.getDeadline() + ")", HttpStatus.BAD_REQUEST);
        }

        if (request.getPhotosJson() == null || request.getPhotosJson().isBlank()
                || request.getChecklistResponsesJson() == null || request.getChecklistResponsesJson().isBlank()) {
            throw new CustomException("Bắt buộc nộp ảnh bằng chứng và checklist hoàn thành", HttpStatus.BAD_REQUEST);
        }

        // Validate cấu trúc JSON của photos: phải là một mảng JSON chứa ít nhất 1 URL ảnh hợp lệ
        com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
        try {
            com.fasterxml.jackson.databind.JsonNode photosNode = mapper.readTree(request.getPhotosJson());
            if (!photosNode.isArray() || photosNode.isEmpty()) {
                throw new CustomException("Bắt buộc tải lên ít nhất 1 ảnh bằng chứng thực địa hợp lệ", HttpStatus.BAD_REQUEST);
            }
            boolean hasValidPhoto = false;
            for (com.fasterxml.jackson.databind.JsonNode photoItem : photosNode) {
                if (photoItem.isTextual() && !photoItem.asText().isBlank()) {
                    hasValidPhoto = true;
                    break;
                }
            }
            if (!hasValidPhoto) {
                throw new CustomException("Danh sách ảnh bằng chứng không chứa đường dẫn ảnh hợp lệ", HttpStatus.BAD_REQUEST);
            }
        } catch (com.fasterxml.jackson.core.JsonProcessingException e) {
            throw new CustomException("Định dạng dữ liệu ảnh (photosJson) không đúng chuẩn JSON", HttpStatus.BAD_REQUEST);
        }

        // Validate cấu trúc JSON của checklist: phải là JSON object hoặc array hợp lệ
        try {
            com.fasterxml.jackson.databind.JsonNode checklistNode = mapper.readTree(request.getChecklistResponsesJson());
            if (checklistNode == null || checklistNode.isNull() || (checklistNode.isContainerNode() && checklistNode.isEmpty())) {
                throw new CustomException("Dữ liệu checklist hoàn thành không được để trống", HttpStatus.BAD_REQUEST);
            }
        } catch (com.fasterxml.jackson.core.JsonProcessingException e) {
            throw new CustomException("Định dạng dữ liệu checklist không đúng chuẩn JSON", HttpStatus.BAD_REQUEST);
        }

        if (!Boolean.TRUE.equals(task.getIsCheckedIn())) {
            throw new CustomException("Bạn chưa hoàn tất Chặng 1 (Check-in GPS tại địa điểm trong bán kính 100m). Vui lòng check-in trước khi nộp báo cáo.", HttpStatus.BAD_REQUEST);
        }

        // Tính khoảng cách lệch giữa vị trí nộp thực tế và mục tiêu nhiệm vụ (đổi ra mét)
        double distanceKm = TaskServiceImpl.calculateHaversineDistance(
                task.getLatitude(), task.getLongitude(),
                request.getActualLatitude(), request.getActualLongitude()
        );
        double distanceMeters = distanceKm * 1000.0;
        boolean isGpsVerified = distanceMeters <= MAX_ALLOWED_DISTANCE_METERS;
        if (!isGpsVerified) {
            throw new CustomException("Tọa độ nộp báo cáo nằm ngoài bán kính 100m của địa điểm nhiệm vụ", HttpStatus.BAD_REQUEST);
        }

        Evidence evidence = Evidence.builder()
                .task(task)
                .shepherd(shepherd)
                .note(request.getNote())
                .actualLatitude(request.getActualLatitude())
                .actualLongitude(request.getActualLongitude())
                .distanceFromTaskMeters(distanceMeters)
                .isGpsVerified(isGpsVerified)
                .photosJson(request.getPhotosJson())
                .checklistResponsesJson(request.getChecklistResponsesJson())
                .status(EvidenceStatus.PENDING)
                .build();

        Evidence saved = evidenceRepository.save(evidence);

        // Chuyển trạng thái Task sang SUBMITTED
        task.setStatus(TaskStatus.SUBMITTED);
        task.setRejectionReason(null);
        taskRepository.save(task);

        // Bắn thông báo Socket Real-time cho Người thuê (Client)
        if (task.getClient() != null) {
            notificationService.sendNotification(
                    task.getClient(),
                    "Có báo cáo kết quả mới!",
                    String.format("Người nhận việc đã nộp báo cáo cho nhiệm vụ #%d \"%s\". Vui lòng vào nghiệm thu.", task.getId(), task.getTitle()),
                    com.imhere.backend.modules.notification.NotificationType.TASK_SUBMITTED,
                    "/client/campaigns/" + task.getId() + "/review"
            );
        }

        for (User admin : userRepository.findByRole(com.imhere.backend.modules.user.Role.ROLE_ADMIN)) {
            notificationService.sendNotification(
                    admin,
                    "Báo cáo cần kiểm duyệt",
                    String.format("Nhiệm vụ #%d “%s” vừa có báo cáo mới cần kiểm tra.", task.getId(), task.getTitle()),
                    com.imhere.backend.modules.notification.NotificationType.TASK_SUBMITTED,
                    "/admin/qa"
            );
        }

        return EvidenceResponse.fromEntity(saved);
    }

    @Override
    @Transactional
    public EvidenceResponse reviewEvidence(Long evidenceId, Long reviewerId, ReviewEvidenceRequest request) {
        Evidence evidence = evidenceRepository.findByIdForUpdate(evidenceId)
                .orElseThrow(() -> new CustomException("Không tìm thấy hồ sơ bằng chứng", HttpStatus.NOT_FOUND));

        User reviewer = userRepository.findById(reviewerId)
                .orElseThrow(() -> new CustomException("Không tìm thấy người kiểm duyệt", HttpStatus.NOT_FOUND));

        Task task = evidence.getTask();

        if ((evidence.getStatus() != EvidenceStatus.PENDING && evidence.getStatus() != EvidenceStatus.QA_PASSED)
                || task.getStatus() != TaskStatus.SUBMITTED) {
            throw new CustomException("Bằng chứng này đã được xử lý hoặc nhiệm vụ không còn chờ nghiệm thu", HttpStatus.CONFLICT);
        }

        // Kiểm tra quyền: Người tạo nhiệm vụ HOẶC Quản trị viên mới được nghiệm thu
        boolean isOwner = task.getClient() != null && task.getClient().getId().equals(reviewerId);
        boolean isAdmin = reviewer.getRole() == com.imhere.backend.modules.user.Role.ROLE_ADMIN;
        if (!isOwner && !isAdmin) {
            throw new CustomException("Chỉ người tạo nhiệm vụ này hoặc Quản trị viên mới có quyền nghiệm thu", HttpStatus.FORBIDDEN);
        }

        evidence.setReviewedBy(reviewer);
        evidence.setReviewedAt(Instant.now());
        evidence.setReviewNotes(request.getReviewNotes());

        if (Boolean.TRUE.equals(request.getApproved())) {
            if (isAdmin && !isOwner) {
                // Admin kiểm duyệt QA chất lượng hình ảnh / GPS -> Đánh dấu QA_PASSED
                evidence.setStatus(EvidenceStatus.QA_PASSED);
                // Giữ nguyên trạng thái SUBMITTED để người thuê (Client) nghiệm thu và giải ngân
                task.setStatus(TaskStatus.SUBMITTED);
                task.setRejectionReason(null);

                // Thông báo cho Người thuê (Client) biết kết quả đã qua kiểm định QA
                if (task.getClient() != null) {
                    notificationService.sendNotification(
                            task.getClient(),
                            "Báo cáo đã qua kiểm duyệt QA!",
                            String.format("Báo cáo nhiệm vụ #%d \"%s\" đã được Quản trị viên duyệt đạt chuẩn. Vui lòng vào nghiệm thu giải ngân.", task.getId(), task.getTitle()),
                            com.imhere.backend.modules.notification.NotificationType.TASK_SUBMITTED,
                            "/client/campaigns/" + task.getId() + "/review"
                    );
                }
            } else {
                // Người thuê (Client) nghiệm thu chính thức -> APPROVED & Giải phóng thù lao từ Escrow
                evidence.setStatus(EvidenceStatus.APPROVED);
                task.setStatus(TaskStatus.APPROVED);
                task.setRejectionReason(null);

                // Kích hoạt giải phóng ký quỹ trả thù lao cho Shepherd
                walletService.releaseEscrow(
                        task.getClient().getId(),
                        task.getAssignedShepherd().getId(),
                        task.getRewardAmount(),
                        task.getId()
                );

                // Bắn thông báo Socket Real-time cho Shepherd
                if (task.getAssignedShepherd() != null) {
                    notificationService.sendNotification(
                            task.getAssignedShepherd(),
                            "Nhiệm vụ đã được nghiệm thu!",
                            String.format("Nhiệm vụ #%d \"%s\" đã được xác nhận. Thù lao đã chuyển vào ví của bạn.", task.getId(), task.getTitle()),
                            com.imhere.backend.modules.notification.NotificationType.TASK_APPROVED,
                            "/looker/listing/" + task.getId() + "/execute"
                    );
                }
            }
        } else {
            if (request.getReviewNotes() == null || request.getReviewNotes().isBlank()) {
                throw new CustomException("Bắt buộc nêu lý do khi yêu cầu làm lại báo cáo", HttpStatus.BAD_REQUEST);
            }
            evidence.setStatus(EvidenceStatus.REJECTED);
            task.setStatus(TaskStatus.ASSIGNED);
            task.setRejectionReason(request.getReviewNotes().trim());

            if (task.getAssignedShepherd() != null) {
                notificationService.sendNotification(
                        task.getAssignedShepherd(),
                        "Báo cáo cần chỉnh sửa",
                        String.format("Báo cáo nhiệm vụ #%d chưa đạt: %s", task.getId(), request.getReviewNotes().trim()),
                        com.imhere.backend.modules.notification.NotificationType.TASK_SUBMITTED,
                        "/looker/listing/" + task.getId() + "/execute"
                );
            }
        }

        taskRepository.save(task);
        Evidence updated = evidenceRepository.save(evidence);

        return EvidenceResponse.fromEntity(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EvidenceResponse> getEvidencesByTaskId(Long taskId, Long requesterId) {
        Task task = taskRepository.findByIdWithAssociations(taskId)
                .orElseThrow(() -> new CustomException("Không tìm thấy nhiệm vụ", HttpStatus.NOT_FOUND));
        User requester = userRepository.findById(requesterId)
                .orElseThrow(() -> new CustomException("Không tìm thấy người dùng", HttpStatus.NOT_FOUND));
        boolean participant = (task.getClient() != null && task.getClient().getId().equals(requesterId))
                || (task.getAssignedShepherd() != null && task.getAssignedShepherd().getId().equals(requesterId))
                || requester.getRole() == com.imhere.backend.modules.user.Role.ROLE_ADMIN;
        if (!participant) {
            throw new CustomException("Bạn không có quyền xem bằng chứng của nhiệm vụ này", HttpStatus.FORBIDDEN);
        }
        return evidenceRepository.findByTaskIdOrderBySubmittedAtDesc(taskId).stream()
                .map(EvidenceResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<EvidenceResponse> getPendingEvidences() {
        return evidenceRepository.findByStatus(EvidenceStatus.PENDING).stream()
                .map(EvidenceResponse::fromEntity)
                .collect(Collectors.toList());
    }
}
