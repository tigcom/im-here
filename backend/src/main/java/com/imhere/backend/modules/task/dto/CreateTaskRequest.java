package com.imhere.backend.modules.task.dto;

import com.imhere.backend.modules.task.TaskCategory;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.Future;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateTaskRequest {
    @NotBlank(message = "Tiêu đề không được để trống")
    private String title;

    private String description;

    @NotNull(message = "Danh mục nhiệm vụ là bắt buộc")
    private TaskCategory category;

    @NotBlank(message = "Địa chỉ thực địa không được để trống")
    private String address;

    @NotNull(message = "Vĩ độ (latitude) là bắt buộc")
    @DecimalMin(value = "-90.0", message = "Vĩ độ không hợp lệ")
    @DecimalMax(value = "90.0", message = "Vĩ độ không hợp lệ")
    private Double latitude;

    @NotNull(message = "Kinh độ (longitude) là bắt buộc")
    @DecimalMin(value = "-180.0", message = "Kinh độ không hợp lệ")
    @DecimalMax(value = "180.0", message = "Kinh độ không hợp lệ")
    private Double longitude;

    @NotNull(message = "Thù lao cho CTV là bắt buộc")
    @DecimalMin(value = "10000.0", message = "Thù lao tối thiểu là 10,000 VNĐ")
    private BigDecimal rewardAmount;

    private String instructions;
    private String checklistRequirementsJson;
    private String questionsJson;
    @NotNull(message = "Hạn hoàn thành là bắt buộc")
    @Future(message = "Hạn hoàn thành phải ở tương lai")
    private Instant deadline;
}
