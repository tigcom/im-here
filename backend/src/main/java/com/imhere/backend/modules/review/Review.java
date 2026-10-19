package com.imhere.backend.modules.review;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.imhere.backend.modules.task.Task;
import com.imhere.backend.modules.user.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

@Entity
@Table(name = "reviews")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Task task;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewer_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "password"})
    private User reviewer; // Người đánh giá

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewee_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "password"})
    private User reviewee; // Người được đánh giá

    @Column(nullable = false)
    private Integer ratingStars; // 1 - 5 sao tổng quan

    @Column
    private Integer punctualScore; // Đúng giờ (1 - 5)

    @Column
    private Integer honestyScore; // Trung thực (1 - 5)

    @Column
    private Integer qualityScore; // Chất lượng bằng chứng / Làm đúng yêu cầu (1 - 5)

    @Column
    private Integer communicationScore; // Giao tiếp (1 - 5)

    @Column(columnDefinition = "TEXT")
    private String comment; // Nhận xét chi tiết

    @CreationTimestamp
    @Column(updatable = false)
    private Instant createdAt;
}
