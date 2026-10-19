package com.imhere.backend.modules.chat;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.imhere.backend.modules.task.Task;
import com.imhere.backend.modules.user.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

@Entity
@Table(name = "messages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Task task;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "password"})
    private User sender;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @Column
    private String mediaUrl;

    @CreationTimestamp
    @Column(updatable = false)
    private Instant createdAt;
}
