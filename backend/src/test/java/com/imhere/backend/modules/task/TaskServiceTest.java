package com.imhere.backend.modules.task;

import com.imhere.backend.common.CustomException;
import com.imhere.backend.modules.task.dto.CreateTaskRequest;
import com.imhere.backend.modules.task.dto.TaskResponse;
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
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TaskServiceTest {

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private WalletService walletService;

    @Mock
    private com.imhere.backend.common.RedisDistributedLock redisDistributedLock;

    @Mock
    private com.imhere.backend.modules.evidence.EvidenceRepository evidenceRepository;

    @Mock
    private TaskExpiryHandler taskExpiryHandler;

    @InjectMocks
    private TaskServiceImpl taskService;

    private User client;
    private User shepherd;
    private Task taskHanoi;
    private Task taskHcm;

    @BeforeEach
    void setUp() {
        client = User.builder().id(1L).fullName("Tập đoàn Bán lẻ").role(Role.ROLE_CLIENT).build();
        shepherd = User.builder().id(2L).fullName("Nguyễn CTV").role(Role.ROLE_SHEPHERD)
                .kycStatus(com.imhere.backend.modules.user.KycStatus.DA_DUYET)
                .bankName("Vietcombank")
                .bankAccountNumber("123456789")
                .build();

        // Task tại Hoàn Kiếm, Hà Nội
        taskHanoi = Task.builder()
                .id(101L)
                .client(client)
                .title("Khảo sát quầy kệ WinMart Tràng Tiền")
                .category(TaskCategory.RETAIL_AUDIT)
                .status(TaskStatus.CREATED)
                .address("24 Tràng Tiền, Hoàn Kiếm, Hà Nội")
                .latitude(21.0253)
                .longitude(105.8553)
                .rewardAmount(BigDecimal.valueOf(150000))
                .build();

        // Task tại Quận 1, TP.HCM (~1150km cách Hà Nội)
        taskHcm = Task.builder()
                .id(102L)
                .client(client)
                .title("Kiểm định mặt bằng Nguyễn Huệ")
                .category(TaskCategory.ASSET_INSPECTION)
                .status(TaskStatus.CREATED)
                .address("68 Nguyễn Huệ, Quận 1, TP.HCM")
                .latitude(10.7745)
                .longitude(106.7034)
                .rewardAmount(BigDecimal.valueOf(250000))
                .build();
    }

    @Test
    @DisplayName("TDD [Create Task]: Client tạo Task thành công, hệ thống ký quỹ tiền thưởng")
    void createTask_WhenValid_ShouldSaveTaskAndHoldEscrow() {
        CreateTaskRequest req = CreateTaskRequest.builder()
                .title("Khảo sát WinMart")
                .category(TaskCategory.RETAIL_AUDIT)
                .address("Tràng Tiền")
                .latitude(21.0253)
                .longitude(105.8553)
                .rewardAmount(BigDecimal.valueOf(150000))
                .build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(client));
        when(taskRepository.save(any(Task.class))).thenAnswer(invocation -> {
            Task t = invocation.getArgument(0);
            t.setId(101L);
            return t;
        });

        TaskResponse res = taskService.createTask(1L, req);

        assertThat(res).isNotNull();
        assertThat(res.getStatus()).isEqualTo(TaskStatus.CREATED);
        verify(walletService).holdEscrow(eq(1L), eq(BigDecimal.valueOf(150000)), eq(101L));
        verify(taskRepository).save(any(Task.class));
    }

    @Test
    @DisplayName("TDD [Find Nearby]: Tìm task gần toạ độ Ba Đình trong bán kính 10km chỉ lấy task Hà Nội")
    void findNearbyTasks_ShouldCalculateHaversineDistanceAndFilterByRadius() {
        // CTV ở Ba Đình: 21.0340, 105.8200
        double currentLat = 21.0340;
        double currentLng = 105.8200;
        double radiusKm = 10.0;

        when(taskRepository.findByStatus(TaskStatus.CREATED)).thenReturn(List.of(taskHanoi, taskHcm));

        List<TaskResponse> nearby = taskService.getNearbyTasks(currentLat, currentLng, radiusKm);

        assertThat(nearby).hasSize(1);
        assertThat(nearby.get(0).getId()).isEqualTo(101L);
        assertThat(nearby.get(0).getDistanceKm()).isLessThan(10.0);
    }

    @Test
    @DisplayName("TDD [Accept Task]: CTV nhận nhiệm vụ hợp lệ đổi status sang ASSIGNED")
    void acceptTask_WhenTaskCreated_ShouldAssignToShepherdAndChangeStatusToAssigned() {
        when(redisDistributedLock.acquireLock(any(), any(), any())).thenReturn(true);
        when(taskRepository.findByIdWithLock(101L)).thenReturn(Optional.of(taskHanoi));
        when(userRepository.findById(2L)).thenReturn(Optional.of(shepherd));
        when(taskRepository.save(any(Task.class))).thenAnswer(i -> i.getArgument(0));

        TaskResponse res = taskService.acceptTask(101L, 2L);

        assertThat(res.getStatus()).isEqualTo(TaskStatus.ASSIGNED);
        assertThat(res.getAssignedShepherdId()).isEqualTo(2L);
        verify(taskRepository).save(taskHanoi);
        verify(redisDistributedLock).releaseLock(any(), any());
    }

    @Test
    @DisplayName("TDD [Accept Task - Lỗi]: Nhiệm vụ đã có người nhận phải ném CustomException")
    void acceptTask_WhenAlreadyAssigned_ShouldThrowCustomException() {
        taskHanoi.setStatus(TaskStatus.ASSIGNED);
        when(redisDistributedLock.acquireLock(any(), any(), any())).thenReturn(true);
        when(taskRepository.findByIdWithLock(101L)).thenReturn(Optional.of(taskHanoi));

        assertThatThrownBy(() -> taskService.acceptTask(101L, 2L))
                .isInstanceOf(CustomException.class)
                .hasMessageContaining("Nhiệm vụ đã được người khác nhận hoặc không ở trạng thái sẵn sàng");
        verify(redisDistributedLock).releaseLock(any(), any());
    }

    @Test
    @DisplayName("TDD [Cancel Task - Client]: Client hủy task khi chưa có ai nhận -> hoàn tiền ký quỹ")
    void cancelTask_WhenClientCancelsCreatedTask_ShouldRefundEscrowAndCancelTask() {
        when(taskRepository.findByIdWithLock(101L)).thenReturn(Optional.of(taskHanoi));
        when(taskRepository.save(any(Task.class))).thenAnswer(i -> i.getArgument(0));

        TaskResponse res = taskService.cancelTask(101L, 1L, Role.ROLE_CLIENT);

        assertThat(res.getStatus()).isEqualTo(TaskStatus.CANCELLED);
        verify(walletService).refundEscrow(eq(1L), eq(BigDecimal.valueOf(150000)), eq(101L));
    }

    @Test
    @DisplayName("TDD [Cancel Task - Shepherd]: Shepherd hủy nhận việc -> trả về status CREATED")
    void cancelTask_WhenShepherdAbandonsTask_ShouldRevertStatusToCreated() {
        taskHanoi.setStatus(TaskStatus.ASSIGNED);
        taskHanoi.setAssignedShepherd(shepherd);

        when(taskRepository.findByIdWithLock(101L)).thenReturn(Optional.of(taskHanoi));
        when(taskRepository.save(any(Task.class))).thenAnswer(i -> i.getArgument(0));

        TaskResponse res = taskService.cancelTask(101L, 2L, Role.ROLE_SHEPHERD);

        assertThat(res.getStatus()).isEqualTo(TaskStatus.CREATED);
        assertThat(res.getAssignedShepherdId()).isNull();
        verify(walletService, never()).refundEscrow(any(), any(), any());
    }
}
