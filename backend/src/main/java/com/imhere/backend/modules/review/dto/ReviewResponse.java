package com.imhere.backend.modules.review.dto;

import com.imhere.backend.modules.review.Review;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewResponse {
    private Long id;
    private Long taskId;
    private String taskTitle;
    private Long reviewerId;
    private String reviewerName;
    private String reviewerAvatar;
    private Long revieweeId;
    private String revieweeName;
    private Integer ratingStars;
    private Integer punctualScore;
    private Integer honestyScore;
    private Integer qualityScore;
    private Integer communicationScore;
    private String comment;
    private Instant createdAt;

    public static ReviewResponse fromEntity(Review review) {
        return ReviewResponse.builder()
                .id(review.getId())
                .taskId(review.getTask() != null ? review.getTask().getId() : null)
                .taskTitle(review.getTask() != null ? review.getTask().getTitle() : null)
                .reviewerId(review.getReviewer() != null ? review.getReviewer().getId() : null)
                .reviewerName(review.getReviewer() != null ? review.getReviewer().getFullName() : null)
                .reviewerAvatar(review.getReviewer() != null ? review.getReviewer().getAvatarUrl() : null)
                .revieweeId(review.getReviewee() != null ? review.getReviewee().getId() : null)
                .revieweeName(review.getReviewee() != null ? review.getReviewee().getFullName() : null)
                .ratingStars(review.getRatingStars())
                .punctualScore(review.getPunctualScore())
                .honestyScore(review.getHonestyScore())
                .qualityScore(review.getQualityScore())
                .communicationScore(review.getCommunicationScore())
                .comment(review.getComment())
                .createdAt(review.getCreatedAt())
                .build();
    }
}
