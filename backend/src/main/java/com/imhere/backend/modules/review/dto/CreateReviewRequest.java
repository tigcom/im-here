package com.imhere.backend.modules.review.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateReviewRequest {
    @NotNull(message = "Số sao đánh giá không được để trống")
    @Min(value = 1, message = "Số sao tối thiểu là 1")
    @Max(value = 5, message = "Số sao tối đa là 5")
    private Integer ratingStars;

    @Min(1) @Max(5)
    private Integer punctualScore = 5; // Đúng giờ

    @Min(1) @Max(5)
    private Integer honestyScore = 5; // Trung thực

    @Min(1) @Max(5)
    private Integer qualityScore = 5; // Chất lượng công việc

    @Min(1) @Max(5)
    private Integer communicationScore = 5; // Giao tiếp

    private String comment;
}
