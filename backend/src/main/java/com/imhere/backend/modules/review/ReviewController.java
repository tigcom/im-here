package com.imhere.backend.modules.review;

import com.imhere.backend.common.ApiResponse;
import com.imhere.backend.config.security.CustomUserDetails;
import com.imhere.backend.modules.review.dto.CreateReviewRequest;
import com.imhere.backend.modules.review.dto.ReviewResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/reviews")
@RequiredArgsConstructor
@Tag(name = "07 — Reviews & Reputation", description = "Đánh giá 2 chiều (1-5 sao) theo các tiêu chí uy tín")
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping("/tasks/{taskId}")
    @Operation(summary = "Đánh giá nhiệm vụ (Người thuê đánh giá Worker hoặc ngược lại)")
    public ResponseEntity<ApiResponse<ReviewResponse>> createReview(
            @PathVariable Long taskId,
            @Valid @RequestBody CreateReviewRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        ReviewResponse response = reviewService.createReview(taskId, userDetails.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Gửi đánh giá thành công", response));
    }

    @GetMapping("/users/{userId}")
    @Operation(summary = "Lấy toàn bộ lịch sử đánh giá của một người dùng")
    public ResponseEntity<ApiResponse<List<ReviewResponse>>> getUserReviews(
            @PathVariable Long userId
    ) {
        List<ReviewResponse> list = reviewService.getReviewsByUserId(userId);
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/tasks/{taskId}")
    @Operation(summary = "Lấy các đánh giá của một nhiệm vụ cụ thể")
    public ResponseEntity<ApiResponse<List<ReviewResponse>>> getTaskReviews(
            @PathVariable Long taskId
    ) {
        List<ReviewResponse> list = reviewService.getReviewsByTaskId(taskId);
        return ResponseEntity.ok(ApiResponse.success(list));
    }
}
