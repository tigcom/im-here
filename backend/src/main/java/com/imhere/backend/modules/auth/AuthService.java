package com.imhere.backend.modules.auth;

import com.imhere.backend.modules.auth.dto.AuthResponse;
import com.imhere.backend.modules.auth.dto.LoginRequest;
import com.imhere.backend.modules.auth.dto.RegisterRequest;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
}
