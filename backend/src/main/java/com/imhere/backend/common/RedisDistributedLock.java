package com.imhere.backend.common;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.time.Duration;

/**
 * Tiện ích Khóa phân tán (Distributed Lock) dựa trên Redis SETNX
 * Đảm bảo chỉ 1 thread/worker thực thi critical section tại 1 thời điểm.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class RedisDistributedLock {

    private final StringRedisTemplate stringRedisTemplate;

    /**
     * Thử lấy khóa
     * @param lockKey Key khóa (VD: lock:task:123)
     * @param lockValue Giá trị định danh worker (VD: workerId hoặc UUID)
     * @param expireTime Thời gian tự giải phóng khóa nếu crash (TTL)
     * @return true nếu lấy khóa thành công, false nếu khóa đang bị giữ
     */
    public boolean acquireLock(String lockKey, String lockValue, Duration expireTime) {
        try {
            Boolean success = stringRedisTemplate.opsForValue().setIfAbsent(lockKey, lockValue, expireTime);
            return Boolean.TRUE.equals(success);
        } catch (Exception e) {
            log.warn("Redis không khả dụng, bỏ qua Redis lock và dựa vào DB Lock fallback: {}", e.getMessage());
            return true; // Fallback graceful: không làm chết luồng nếu Redis đang offline
        }
    }

    /**
     * Giải phóng khóa
     * @param lockKey Key khóa
     * @param lockValue Giá trị định danh người giữ khóa
     */
    public void releaseLock(String lockKey, String lockValue) {
        try {
            String currentValue = stringRedisTemplate.opsForValue().get(lockKey);
            if (lockValue.equals(currentValue)) {
                stringRedisTemplate.delete(lockKey);
            }
        } catch (Exception e) {
            log.warn("Lỗi khi giải phóng Redis lock: {}", e.getMessage());
        }
    }
}
