package com.imhere.backend.modules.review;

import com.imhere.backend.modules.review.dto.CreateReviewRequest;
import com.imhere.backend.modules.review.dto.ReviewResponse;

import java.util.List;

public interface ReviewService {
    ReviewResponse createReview(Long taskId, Long reviewerId, CreateReviewRequest request);
    List<ReviewResponse> getReviewsByUserId(Long userId);
    List<ReviewResponse> getReviewsByTaskId(Long taskId);
}
