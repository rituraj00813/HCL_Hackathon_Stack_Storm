package com.retail.ordering.service;

import com.retail.ordering.dto.AuthDtos;
import com.retail.ordering.exception.InvalidOrderException;
import com.retail.ordering.model.User;
import com.retail.ordering.repository.UserRepository;
import com.retail.ordering.security.JwtUtils;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;


@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtils jwtUtil;

    // ── REGISTER ──────────────────────────────────────────────────────────────
    public AuthDtos.AuthResponse register(AuthDtos.RegisterRequest request) {

        // Validate fields
        if (request.getName() == null || request.getName().isBlank()) {
            throw new InvalidOrderException("Name is required.");
        }
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            throw new InvalidOrderException("Email is required.");
        }
        if (request.getPassword() == null || request.getPassword().length() < 6) {
            throw new InvalidOrderException("Password must be at least 6 characters.");
        }

        // Check email uniqueness
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new InvalidOrderException("Email already registered: " + request.getEmail());
        }

        // Build user — role is always USER on self-registration
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword())); // BCrypt hash
        user.setRole("USER"); // hardcoded — cannot register as ADMIN

        User saved = userRepository.save(user);

        // Generate JWT
        String token = jwtUtil.generateToken(saved.getId(), saved.getEmail(), saved.getRole());

        return new AuthDtos.AuthResponse(
                token,
                saved.getId(),
                saved.getName(),
                saved.getEmail(),
                saved.getRole());
    }

    // ── LOGIN ─────────────────────────────────────────────────────────────────
    public AuthDtos.AuthResponse login(AuthDtos.LoginRequest request) {

        // Find user by email
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new InvalidOrderException("Invalid email or password."));

        if (!isValidPassword(request.getPassword(), user)) {
            throw new InvalidOrderException("Invalid email or password.");
        }

        // Generate JWT with userId and role
        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole());

        return new AuthDtos.AuthResponse(
                token,
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole());
    }

    public AuthDtos.AuthResponse getAuthenticatedUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new InvalidOrderException("Authenticated user not found."));

        return new AuthDtos.AuthResponse(
                null,
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole());
    }

    private boolean isValidPassword(String rawPassword, User user) {
        String storedPassword = user.getPassword();

        if (storedPassword != null && storedPassword.startsWith("$2")) {
            return passwordEncoder.matches(rawPassword, storedPassword);
        }

        // Legacy fallback for plain-text seeded/admin passwords.
        if (storedPassword != null && storedPassword.equals(rawPassword)) {
            user.setPassword(passwordEncoder.encode(rawPassword));
            userRepository.save(user);
            return true;
        }

        return false;
    }
}
