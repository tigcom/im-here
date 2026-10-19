package com.imhere.backend.modules.task;

import com.imhere.backend.modules.task.dto.CreateTaskRequest;
import com.imhere.backend.modules.task.dto.TaskResponse;
import com.imhere.backend.modules.user.Role;

import java.util.List;

public interface TaskService {
    TaskResponse createTask(Long clientId, CreateTaskRequest request);
    TaskResponse getTaskById(Long taskId, Double currentLat, Double currentLng);
    List<TaskResponse> getAllTasks(TaskStatus status);
    List<TaskResponse> getNearbyTasks(Double latitude, Double longitude, Double radiusKm);
    TaskResponse acceptTask(Long taskId, Long shepherdId);
    TaskResponse checkInTask(Long taskId, Long shepherdId, Double latitude, Double longitude);
    TaskResponse cancelTask(Long taskId, Long userId, Role userRole);
    TaskResponse resolveDispute(Long taskId, Long adminId, String resolution, String note);
    List<TaskResponse> getTasksByClient(Long clientId);
    List<TaskResponse> getTasksByShepherd(Long shepherdId);
}
