package com.imhere.backend.config;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class RootController {

    @GetMapping("/")
    public ResponseEntity<Map<String, Object>> root() {
        return ResponseEntity.ok(Map.of(
                "service", "Im-Here Platform Backend API",
                "status", "UP",
                "version", "2.0.0",
                "docs", "/swagger-ui.html",
                "apiBase", "/api"
        ));
    }
}
