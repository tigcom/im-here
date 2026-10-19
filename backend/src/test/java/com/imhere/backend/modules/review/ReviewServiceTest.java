package com.imhere.backend.modules.review;

import com.imhere.backend.common.CustomException;
import com.imhere.backend.modules.review.dto.CreateReviewRequest;
import com.imhere.backend.modules.review.dto.ReviewResponse;
import com.imhere.backend.modules.task.Task;
import com.imhere.backend.modules.task.TaskRepository;
import com.imhere.backend.modules.task.TaskStatus;
import com.imhere.backend.modules.user.Role;
import com.imhere.backend.modules.user.User;
import com.imhere.backend.modules.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReviewServiceTest {

    @Mock
    private ReviewRepository reviewRepository;

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private ReviewServiceImpl reviewService;

    private User hirer;
    private User worker;
    private Task completedTask;

    @BeforeEach
    void setUp() {
        hirer = User.builder().id(1L).fullName("Nguyễn Văn A (Hirer)").role(Role.ROLE_CLIENT).ratingScore(5.0).build();
        worker = User.builder().id(2L).fullName("Trần Thị B (Worker)").role(Role.ROLE_SHEPHERD).ratingScore(5.0).build();

        completedTask = Task.builder()
                .id(101L)
                .client(hirer)
                .assignedShepherd(worker)
                .title("Giao nhận hàng tại Tràng Tiền")
                .status(TaskStatus.APPROVED)
                .build();
    }

    @Test
    @DisplayName("Hirer đánh giá Worker 5 sao cho nhiệm vụ đã hoàn thành")
    void createReview_WhenHirerReviewsWorker_ShouldSaveSuccessfullyAndRecalculateRating() {
        CreateReviewRequest req = new CreateReviewRequest();
        req.setRatingStars(5);
        req.setPunctualScore(5);
        req.setHonestyScore(5);
        req.setQualityScore(5);
        req.setCommunicationScore(5);
        req.setComment("Làm việc rất cẩn thận, đúng giờ.");

        when(taskRepository.findById(101L)).thenReturn(Optional.of(completedTask));
        when(reviewRepository.findByTaskIdAndReviewerId(101L, 1L)).thenReturn(Optional.empty());
        when(reviewRepository.save(any(Review.class))).thenAnswer(i -> {
            Review r = i.getArgument(0);
            r.setId(1L);
            return r;
        });

        Review savedReview = Review.builder()
                .ratingStars(5)
                .reviewee(worker)
                .build();
        when(reviewRepository.findByRevieweeIdOrderByCreatedAtDesc(2L)).thenReturn(List.of(savedReview));
        when(userRepository.findById(2L)).thenReturn(Optional.of(worker));

        ReviewResponse res = reviewService.createReview(101L, 1L, req);

        assertThat(res).isNotNull();
        assertThat(res.getRatingStars()).isEqualTo(5);
        assertThat(res.getReviewerId()).isEqualTo(1L);
        assertThat(res.getRevieweeId()).isEqualTo(2L);
        verify(reviewRepository).save(any(Review.class));
        verify(userRepository).save(worker);
    }

    @Test
    @DisplayName("Ném lỗi khi đánh giá nhiệm vụ chưa hoàn thành")
    void createReview_WhenTaskNotApproved_ShouldThrowException() {
        completedTask.setStatus(TaskStatus.ASSIGNED);
        when(taskRepository.findById(101L)).thenReturn(Optional.of(completedTask));

        CreateReviewRequest req = new CreateReviewRequest();
        req.setRatingStars(5);

        assertThatThrownBy(() -> reviewService.createReview(101L, 1L, req))
                .isInstanceOf(CustomException.class)
                .hasMessageContaining("Chỉ có thể đánh giá sau khi nhiệm vụ đã hoàn thành");
    }

    @Test
    @DisplayName("Ném lỗi khi đánh giá lại lần 2 cho cùng 1 nhiệm vụ")
    void createReview_WhenAlreadyReviewed_ShouldThrowConflictException() {
        when(taskRepository.findById(101L)).thenReturn(Optional.of(completedTask));
        when(reviewRepository.findByTaskIdAndReviewerId(101L, 1L)).thenReturn(Optional.of(new Review()));

        CreateReviewRequest req = new CreateReviewRequest();
        req.setRatingStars(5);

        assertThatThrownBy(() -> reviewService.createReview(101L, 1L, req))
                .isInstanceOf(CustomException.class)
                .hasMessageContaining("Bạn đã đánh giá nhiệm vụ này rồi");
    }
}
