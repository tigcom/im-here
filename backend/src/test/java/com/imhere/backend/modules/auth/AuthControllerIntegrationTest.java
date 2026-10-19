package com.imhere.backend.modules.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.imhere.backend.modules.auth.dto.LoginRequest;
import com.imhere.backend.modules.auth.dto.RegisterRequest;
import com.imhere.backend.modules.user.Role;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("TDD [Integration Test]: Đăng ký -> Đăng nhập -> Lấy thông tin cá nhân qua JWT thành công")
    void fullAuthFlow_ShouldSucceed() throws Exception {
        // 1. Đăng ký
        RegisterRequest regReq = RegisterRequest.builder()
                .email("integration.shepherd@imhere.vn")
                .password("Password123")
                .fullName("CTV Test TDD")
                .phone("0981112233")
                .build();

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(regReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.token").isNotEmpty());

        // 2. Đăng nhập
        LoginRequest loginReq = LoginRequest.builder()
                .email("integration.shepherd@imhere.vn")
                .password("Password123")
                .build();

        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.token").isNotEmpty())
                .andReturn();

        String responseJson = loginResult.getResponse().getContentAsString();
        String token = objectMapper.readTree(responseJson).path("data").path("token").asText();

        // 3. Gọi endpoint bảo vệ với token Bearer
        mockMvc.perform(get("/api/auth/me")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.email").value("integration.shepherd@imhere.vn"))
                .andExpect(jsonPath("$.data.fullName").value("CTV Test TDD"));
    }
}
