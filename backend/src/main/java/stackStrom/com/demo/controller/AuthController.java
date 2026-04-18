package com.retail.ordering.controller;

import com.retail.ordering.dto.AuthDtos;
import com.retail.ordering.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * AuthController — public authentication endpoints.
 *
 * POST /api/auth/register → Register new user (role = USER)
 * POST /api/auth/login → Login, returns JWT with userId + role
 */
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    @Autowired
    private AuthService authService;

    /**
     * POST /api/auth/register
     *
     * Body:
     * {
     * "name": "Ritu",
     * "email": "ritu@example.com",
     * "password": "secret123"
     * }
     */
    @PostMapping("/register")
    public ResponseEntity<AuthDtos.AuthResponse> register(
            @RequestBody AuthDtos.RegisterRequest request) {
        AuthDtos.AuthResponse response = authService.register(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    /**
     * POST /api/auth/login
     *
     * Body:
     * {
     * "email": "ritu@example.com",
     * "password": "secret123"
     * }
     *
     * Response includes:
     * {
     * "token": "<JWT>",
     * "userId": 1,
     * "name": "Ritu",
     * "email": "ritu@example.com",
     * "role": "USER"
     * }
     */
    @PostMapping("/login")
    public ResponseEntity<AuthDtos.AuthResponse> login(
            @RequestBody AuthDtos.LoginRequest request) {
        AuthDtos.AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/success")
    public ResponseEntity<AuthDtos.AuthResponse> success(Authentication authentication) {
        return ResponseEntity.ok(authService.getAuthenticatedUser(authentication.getName()));
    }
}
