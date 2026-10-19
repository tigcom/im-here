package com.imhere.backend.modules.task;

import com.imhere.backend.common.ApiResponse;
import com.imhere.backend.config.security.CustomUserDetails;
import com.imhere.backend.modules.task.dto.CreateTaskRequest;
import com.imhere.backend.modules.task.dto.TaskResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tasks")
@RequiredArgsConstructor
@Tag(name = "03 — Tasks & Geo-Matching", description = "Quản lý nhiệm vụ thực địa và thuật toán định vị khoảng cách GPS")
public class TaskController {

    private final TaskService taskService;

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Tạo nhiệm vụ thực địa mới (Ký quỹ tự động từ ví người dùng)")
    public ResponseEntity<ApiResponse<TaskResponse>> createTask(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody CreateTaskRequest request
    ) {
        TaskResponse response = taskService.createTask(userDetails.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tạo nhiệm vụ thành công", response));
    }

    @GetMapping
    @Operation(summary = "Lấy danh sách tất cả nhiệm vụ (có thể lọc theo trạng thái)")
    public ResponseEntity<ApiResponse<List<TaskResponse>>> getAllTasks(
            @RequestParam(required = false) TaskStatus status
    ) {
        List<TaskResponse> tasks = taskService.getAllTasks(status);
        return ResponseEntity.ok(ApiResponse.success(tasks));
    }

    @GetMapping("/nearby")
    @Operation(summary = "Tìm nhiệm vụ lân cận theo toạ độ GPS (Bán kính km - Haversine Formula)")
    public ResponseEntity<ApiResponse<List<TaskResponse>>> getNearbyTasks(
            @RequestParam Double lat,
            @RequestParam Double lng,
            @RequestParam(defaultValue = "10.0") Double radiusKm
    ) {
        List<TaskResponse> nearby = taskService.getNearbyTasks(lat, lng, radiusKm);
        return ResponseEntity.ok(ApiResponse.success(nearby));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Xem chi tiết nhiệm vụ")
    public ResponseEntity<ApiResponse<TaskResponse>> getTaskById(
            @PathVariable Long id,
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lng
    ) {
        TaskResponse response = taskService.getTaskById(id, lat, lng);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/{id}/accept")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Người dùng nhận nhiệm vụ thực địa (không thể tự nhận việc của chính mình)")
    public ResponseEntity<ApiResponse<TaskResponse>> acceptTask(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        TaskResponse response = taskService.acceptTask(id, userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success("Nhận nhiệm vụ thành công", response));
    }

    @PostMapping("/{id}/check-in")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Chặng 1: Check-in tại địa điểm thực tế (Yêu cầu khoảng cách <= 100m)")
    public ResponseEntity<ApiResponse<TaskResponse>> checkIn(
            @PathVariable Long id,
            @RequestParam Double latitude,
            @RequestParam Double longitude,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        TaskResponse response = taskService.checkInTask(id, userDetails.getId(), latitude, longitude);
        return ResponseEntity.ok(ApiResponse.success("Check-in GPS tại địa điểm thành công", response));
    }

    @PostMapping("/{id}/cancel")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Hủy nhiệm vụ")
    public ResponseEntity<ApiResponse<TaskResponse>> cancelTask(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        TaskResponse response = taskService.cancelTask(id, userDetails.getId(), userDetails.getUser().getRole());
        return ResponseEntity.ok(ApiResponse.success("Hủy thành công", response));
    }

    @PostMapping("/{id}/dispute")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Quản trị viên can thiệp xử lý tranh chấp (Cưỡng chế hủy/hoàn tiền hoặc giải ngân)")
    public ResponseEntity<ApiResponse<TaskResponse>> resolveDispute(
            @PathVariable Long id,
            @RequestParam String resolution,
            @RequestParam String note,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        TaskResponse response = taskService.resolveDispute(id, userDetails.getId(), resolution, note);
        return ResponseEntity.ok(ApiResponse.success("Xử lý tranh chấp thành công", response));
    }

    @GetMapping("/my-created")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Danh sách nhiệm vụ do người dùng hiện tại đăng thuê")
    public ResponseEntity<ApiResponse<List<TaskResponse>>> getMyCreatedTasks(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        List<TaskResponse> tasks = taskService.getTasksByClient(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success(tasks));
    }

    @GetMapping("/my-assigned")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Danh sách nhiệm vụ người dùng hiện tại đã nhận làm")
    public ResponseEntity<ApiResponse<List<TaskResponse>>> getMyAssignedTasks(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        List<TaskResponse> tasks = taskService.getTasksByShepherd(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success(tasks));
    }
}
