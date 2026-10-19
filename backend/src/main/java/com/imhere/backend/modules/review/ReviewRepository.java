package com.imhere.backend.modules.review;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByRevieweeIdOrderByCreatedAtDesc(Long revieweeId);
    List<Review> findByTaskId(Long taskId);
    Optional<Review> findByTaskIdAndReviewerId(Long taskId, Long reviewerId);
}
