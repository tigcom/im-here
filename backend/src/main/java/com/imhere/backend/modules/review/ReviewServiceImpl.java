package com.imhere.backend.modules.review;

import com.imhere.backend.common.CustomException;
import com.imhere.backend.modules.review.dto.CreateReviewRequest;
import com.imhere.backend.modules.review.dto.ReviewResponse;
import com.imhere.backend.modules.task.Task;
import com.imhere.backend.modules.task.TaskRepository;
import com.imhere.backend.modules.task.TaskStatus;
import com.imhere.backend.modules.user.User;
import com.imhere.backend.modules.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public ReviewResponse createReview(Long taskId, Long reviewerId, CreateReviewRequest request) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new CustomException("Không tìm thấy nhiệm vụ #" + taskId, HttpStatus.NOT_FOUND));

        if (task.getStatus() != TaskStatus.APPROVED) {
            throw new CustomException("Chỉ có thể đánh giá sau khi nhiệm vụ đã hoàn thành và nghiệm thu", HttpStatus.BAD_REQUEST);
        }

        // Xác định đối tượng đánh giá và đối tượng được đánh giá
        boolean isHirer = task.getClient() != null && task.getClient().getId().equals(reviewerId);
        boolean isWorker = task.getAssignedShepherd() != null && task.getAssignedShepherd().getId().equals(reviewerId);

        if (!isHirer && !isWorker) {
            throw new CustomException("Bạn không phải người thuê hoặc người nhận của nhiệm vụ này", HttpStatus.FORBIDDEN);
        }

        User reviewer = isHirer ? task.getClient() : task.getAssignedShepherd();
        User reviewee = isHirer ? task.getAssignedShepherd() : task.getClient();

        if (reviewee == null) {
            throw new CustomException("Không tìm thấy đối phương để đánh giá", HttpStatus.BAD_REQUEST);
        }

        // Kiểm tra đã đánh giá trước đó chưa
        if (reviewRepository.findByTaskIdAndReviewerId(taskId, reviewerId).isPresent()) {
            throw new CustomException("Bạn đã đánh giá nhiệm vụ này rồi", HttpStatus.CONFLICT);
        }

        Review review = Review.builder()
                .task(task)
                .reviewer(reviewer)
                .reviewee(reviewee)
                .ratingStars(request.getRatingStars())
                .punctualScore(request.getPunctualScore())
                .honestyScore(request.getHonestyScore())
                .qualityScore(request.getQualityScore())
                .communicationScore(request.getCommunicationScore())
                .comment(request.getComment())
                .build();

        Review saved = reviewRepository.save(review);

        // Tính toán lại điểm trung bình cho reviewee
        updateUserAverageRating(reviewee.getId());

        return ReviewResponse.fromEntity(saved);
    }

    private void updateUserAverageRating(Long userId) {
        List<Review> userReviews = reviewRepository.findByRevieweeIdOrderByCreatedAtDesc(userId);
        if (!userReviews.isEmpty()) {
            double avg = userReviews.stream()
                    .mapToInt(Review::getRatingStars)
                    .average()
                    .orElse(0.0);
            double roundedAvg = Math.round(avg * 10.0) / 10.0;

            userRepository.findById(userId).ifPresent(user -> {
                user.setRatingScore(roundedAvg);
                userRepository.save(user);
            });
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReviewResponse> getReviewsByUserId(Long userId) {
        return reviewRepository.findByRevieweeIdOrderByCreatedAtDesc(userId).stream()
                .map(ReviewResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReviewResponse> getReviewsByTaskId(Long taskId) {
        return reviewRepository.findByTaskId(taskId).stream()
                .map(ReviewResponse::fromEntity)
                .collect(Collectors.toList());
    }
}
