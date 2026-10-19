package com.imhere.backend.modules.evidence;

import com.imhere.backend.modules.evidence.dto.EvidenceResponse;
import com.imhere.backend.modules.evidence.dto.ReviewEvidenceRequest;
import com.imhere.backend.modules.evidence.dto.SubmitEvidenceRequest;
import com.imhere.backend.modules.task.Task;
import com.imhere.backend.modules.task.TaskRepository;
import com.imhere.backend.modules.task.TaskStatus;
import com.imhere.backend.modules.user.Role;
import com.imhere.backend.modules.user.User;
import com.imhere.backend.modules.user.UserRepository;
import com.imhere.backend.modules.wallet.WalletService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EvidenceServiceTest {

    @Mock
    private EvidenceRepository evidenceRepository;

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private WalletService walletService;

    @Mock
    private com.imhere.backend.modules.notification.NotificationService notificationService;

    @InjectMocks
    private EvidenceServiceImpl evidenceService;

    private User client;
    private User shepherd;
    private Task assignedTask;

    @BeforeEach
    void setUp() {
        client = User.builder().id(1L).fullName("WinMart B2B").role(Role.ROLE_CLIENT).build();
        shepherd = User.builder().id(2L).fullName("Nguyễn CTV").role(Role.ROLE_SHEPHERD).build();

        assignedTask = Task.builder()
                .id(101L)
                .client(client)
                .assignedShepherd(shepherd)
                .title("Kiểm tra quầy kệ WinMart Bà Triệu")
                .status(TaskStatus.ASSIGNED)
                .isCheckedIn(true)
                .latitude(21.0116)
                .longitude(105.8505)
                .rewardAmount(BigDecimal.valueOf(120000))
                .build();
    }

    @Test
    @DisplayName("TDD [Submit Evidence - Hợp lệ GPS]: CTV nộp tại điểm thực địa sai số nhỏ -> GPS Verified = true")
    void submitEvidence_WhenNearLocation_ShouldSaveWithGpsVerifiedTrueAndTaskStatusSubmitted() {
        // Toạ độ rất gần (~50m): 21.0118, 105.8507
        SubmitEvidenceRequest req = SubmitEvidenceRequest.builder()
                .actualLatitude(21.0118)
                .actualLongitude(105.8507)
                .note("Đã chụp đủ 4 góc quầy kệ nước giải khát")
                .photosJson("[\"https://cdn.imhere.vn/evidences/photo1.jpg\"]")
                .checklistResponsesJson("{\"items\":[\"Đã kiểm tra\"]}")
                .build();

        when(taskRepository.findByIdWithLock(101L)).thenReturn(Optional.of(assignedTask));
        when(userRepository.findById(2L)).thenReturn(Optional.of(shepherd));
        when(evidenceRepository.save(any(Evidence.class))).thenAnswer(i -> {
            Evidence e = i.getArgument(0);
            e.setId(501L);
            return e;
        });

        EvidenceResponse res = evidenceService.submitEvidence(101L, 2L, req);

        assertThat(res).isNotNull();
        assertThat(res.getIsGpsVerified()).isTrue();
        assertThat(res.getStatus()).isEqualTo(EvidenceStatus.PENDING);
        assertThat(assignedTask.getStatus()).isEqualTo(TaskStatus.SUBMITTED);
        verify(taskRepository).save(assignedTask);
    }

    @Test
    @DisplayName("TDD [Submit Evidence - Nghi vấn Gian lận GPS]: Toạ độ lệch > 100m -> CustomException")
    void submitEvidence_WhenFarFromLocation_ShouldFlagGpsVerifiedFalse() {
        // Toạ độ cách xa hàng chục km: 21.1500, 105.9500
        SubmitEvidenceRequest req = SubmitEvidenceRequest.builder()
                .actualLatitude(21.1500)
                .actualLongitude(105.9500)
                .note("Báo cáo chụp từ xa")
                .photosJson("[\"https://cdn.imhere.vn/evidences/photo1.jpg\"]")
                .checklistResponsesJson("{\"items\":[\"Đã kiểm tra\"]}")
                .build();

        when(taskRepository.findByIdWithLock(101L)).thenReturn(Optional.of(assignedTask));
        when(userRepository.findById(2L)).thenReturn(Optional.of(shepherd));

        org.assertj.core.api.Assertions.assertThatThrownBy(() -> evidenceService.submitEvidence(101L, 2L, req))
                .isInstanceOf(com.imhere.backend.common.CustomException.class)
                .hasMessageContaining("nằm ngoài bán kính 100m");
    }

    @Test
    @DisplayName("TDD [Review Evidence - Duyệt]: Phê duyệt bài nộp thành công -> Giải phóng tiền ký quỹ trả CTV")
    void reviewEvidence_WhenApproved_ShouldReleaseEscrowAndApproveTask() {
        assignedTask.setStatus(TaskStatus.SUBMITTED);
        Evidence pendingEvidence = Evidence.builder()
                .id(501L)
                .task(assignedTask)
                .shepherd(shepherd)
                .status(EvidenceStatus.PENDING)
                .actualLatitude(21.0116)
                .actualLongitude(105.8505)
                .build();

        ReviewEvidenceRequest reviewReq = ReviewEvidenceRequest.builder()
                .approved(true)
                .reviewNotes("Ảnh rõ nét, dữ liệu chuẩn xác")
                .build();

        when(evidenceRepository.findByIdForUpdate(501L)).thenReturn(Optional.of(pendingEvidence));
        when(userRepository.findById(1L)).thenReturn(Optional.of(client));
        when(evidenceRepository.save(any(Evidence.class))).thenAnswer(i -> i.getArgument(0));

        EvidenceResponse res = evidenceService.reviewEvidence(501L, 1L, reviewReq);

        assertThat(res.getStatus()).isEqualTo(EvidenceStatus.APPROVED);
        assertThat(assignedTask.getStatus()).isEqualTo(TaskStatus.APPROVED);
        verify(walletService).releaseEscrow(eq(1L), eq(2L), eq(BigDecimal.valueOf(120000)), eq(101L));
    }

    @Test
    @DisplayName("TDD [Review Evidence - Từ chối]: Không đạt chất lượng -> Đổi trạng thái REJECTED và không chuyển tiền")
    void reviewEvidence_WhenRejected_ShouldNotReleaseEscrowAndMarkRejected() {
        assignedTask.setStatus(TaskStatus.SUBMITTED);
        Evidence pendingEvidence = Evidence.builder()
                .id(501L)
                .task(assignedTask)
                .shepherd(shepherd)
                .status(EvidenceStatus.PENDING)
                .actualLatitude(21.0116)
                .actualLongitude(105.8505)
                .build();

        ReviewEvidenceRequest reviewReq = ReviewEvidenceRequest.builder()
                .approved(false)
                .reviewNotes("Ảnh bị mờ, không thấy rõ nhãn giá")
                .build();

        when(evidenceRepository.findByIdForUpdate(501L)).thenReturn(Optional.of(pendingEvidence));
        when(userRepository.findById(1L)).thenReturn(Optional.of(client));
        when(evidenceRepository.save(any(Evidence.class))).thenAnswer(i -> i.getArgument(0));

        EvidenceResponse res = evidenceService.reviewEvidence(501L, 1L, reviewReq);

        assertThat(res.getStatus()).isEqualTo(EvidenceStatus.REJECTED);
        assertThat(assignedTask.getStatus()).isEqualTo(TaskStatus.ASSIGNED);
        verify(walletService, never()).releaseEscrow(any(), any(), any(), any());
    }
}
