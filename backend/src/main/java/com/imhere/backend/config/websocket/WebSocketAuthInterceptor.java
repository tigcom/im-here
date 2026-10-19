package com.imhere.backend.config.websocket;

import com.imhere.backend.config.security.CustomUserDetails;
import com.imhere.backend.config.security.CustomUserDetailsService;
import com.imhere.backend.config.security.JwtTokenProvider;
import com.imhere.backend.modules.task.Task;
import com.imhere.backend.modules.task.TaskRepository;
import com.imhere.backend.modules.user.Role;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.security.Principal;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
@RequiredArgsConstructor
public class WebSocketAuthInterceptor implements ChannelInterceptor {

    private static final Pattern NOTIFICATION_DESTINATION = Pattern.compile("^/topic/notifications/(\\d+)$");
    private static final Pattern TASK_DESTINATION = Pattern.compile("^/topic/tasks/(\\d+)$");

    private final JwtTokenProvider tokenProvider;
    private final CustomUserDetailsService userDetailsService;
    private final TaskRepository taskRepository;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (accessor == null || accessor.getCommand() == null) return message;

        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            authenticate(accessor);
            return message;
        }
        if (StompCommand.SUBSCRIBE.equals(accessor.getCommand())) {
            authorizeSubscription(accessor);
            return message;
        }
        if (StompCommand.SEND.equals(accessor.getCommand())) {
            throw new IllegalArgumentException("Không hỗ trợ gửi tin nhắn qua WebSocket");
        }
        return message;
    }

    private void authenticate(StompHeaderAccessor accessor) {
        String authorization = accessor.getFirstNativeHeader("Authorization");
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            throw new IllegalArgumentException("Thiếu JWT cho kết nối WebSocket");
        }
        String token = authorization.substring(7).trim();
        if (token.isEmpty() || !tokenProvider.validateToken(token)) {
            throw new IllegalArgumentException("JWT WebSocket không hợp lệ hoặc đã hết hạn");
        }
        UserDetails details = userDetailsService.loadUserByUsername(tokenProvider.getEmailFromToken(token));
        if (!(details instanceof CustomUserDetails userDetails) || !userDetails.isEnabled()) {
            throw new IllegalArgumentException("Tài khoản không được phép kết nối WebSocket");
        }
        accessor.setUser(new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities()));
    }

    private void authorizeSubscription(StompHeaderAccessor accessor) {
        Principal principal = accessor.getUser();
        if (!(principal instanceof Authentication authentication)
                || !(authentication.getPrincipal() instanceof CustomUserDetails user)) {
            throw new IllegalArgumentException("Cần đăng nhập để đăng ký kênh WebSocket");
        }

        String destination = accessor.getDestination();
        Matcher notificationMatcher = destination == null ? null : NOTIFICATION_DESTINATION.matcher(destination);
        if (notificationMatcher != null && notificationMatcher.matches()) {
            if (!notificationMatcher.group(1).equals(String.valueOf(user.getId()))) {
                throw new IllegalArgumentException("Không có quyền nhận thông báo của người dùng khác");
            }
            return;
        }

        Matcher taskMatcher = destination == null ? null : TASK_DESTINATION.matcher(destination);
        if (taskMatcher != null && taskMatcher.matches()) {
            long taskId = Long.parseLong(taskMatcher.group(1));
            Task task = taskRepository.findById(taskId)
                    .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy nhiệm vụ"));
            boolean isParticipant = (task.getClient() != null && task.getClient().getId().equals(user.getId()))
                    || (task.getAssignedShepherd() != null && task.getAssignedShepherd().getId().equals(user.getId()))
                    || user.getUser().getRole() == Role.ROLE_ADMIN;
            if (!isParticipant) throw new IllegalArgumentException("Không có quyền tham gia phòng chat này");
            return;
        }
        throw new IllegalArgumentException("Kênh WebSocket không được phép");
    }
}
