package com.pharmalovo.backend.service;

import com.pharmalovo.backend.dto.AuthResponse;
import com.pharmalovo.backend.dto.LoginRequest;
import com.pharmalovo.backend.dto.RegisterRequest;
import com.pharmalovo.backend.model.Profile;
import com.pharmalovo.backend.model.User;
import com.pharmalovo.backend.model.UserRole;
import com.pharmalovo.backend.repository.ProfileRepository;
import com.pharmalovo.backend.repository.UserRepository;
import com.pharmalovo.backend.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // 1) Prevent duplicate accounts by email or username (full name).
        if (userRepository.existsByEmailOrName(request.getEmail().toLowerCase(), request.getName())) {
            throw new IllegalArgumentException("User already exists. Please sign in instead.");
        }

        // 2) Parse and validate the requested role.
        UserRole role = parseRole(request.getRole());
        // 3) Enforce role-specific required fields for pharmacy owners.
        validateRoleSpecificFields(role, request);

        // 4) Hash the password before saving to the database.
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail().toLowerCase())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .pharmacyName(role == UserRole.PHARMACY_OWNER ? request.getPharmacyName() : null)
                .pharmacyAddress(role == UserRole.PHARMACY_OWNER ? request.getPharmacyAddress() : null)
                .phone(role == UserRole.PHARMACY_OWNER ? request.getPhone() : null)
                .build();

        // 5) Save user and return role-based redirect information.
        User saved = userRepository.save(user);

        // 6) Create corresponding profile
        Profile profile = Profile.builder()
                .id(saved.getId())
                .fullName(saved.getName())
                .role(Profile.UserRole.valueOf(saved.getRole().name()))
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        profileRepository.save(profile);

        String token = jwtUtil.generateToken(saved.getId(), saved.getEmail(), saved.getRole().name().toLowerCase());
        return new AuthResponse(
                "Registration successful",
                saved.getId(),
                saved.getName(),
                saved.getRole().name().toLowerCase(),
                token,
                role == UserRole.PHARMACY_OWNER ? "/pharmacy-owner/dashboard" : "/customer/dashboard"
        );
    }

    public AuthResponse login(LoginRequest request) {
        // 1) Look up the user by email (case-insensitive).
        User user = userRepository.findByEmail(request.getEmail().toLowerCase())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

        // 2) Verify the password against the stored hash.
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        // 3) Return role-based redirect information.
        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole().name().toLowerCase());
        return new AuthResponse(
                "Login successful",
                user.getId(),
                user.getName(),
                user.getRole().name().toLowerCase(),
                token,
                user.getRole() == UserRole.PHARMACY_OWNER ? "/pharmacy-owner/dashboard" : "/customer/dashboard"
        );
    }

    private UserRole parseRole(String role) {
        if (role == null) {
            throw new IllegalArgumentException("Role is required");
        }
        String normalized = role.trim().toUpperCase();
        return switch (normalized) {
            case "CUSTOMER" -> UserRole.CUSTOMER;
            case "PHARMACY_OWNER" -> UserRole.PHARMACY_OWNER;
            default -> throw new IllegalArgumentException("Role must be customer or pharmacy_owner");
        };
    }

    private void validateRoleSpecificFields(UserRole role, RegisterRequest request) {
        if (role == UserRole.PHARMACY_OWNER) {
            if (isBlank(request.getPharmacyName()) || isBlank(request.getPharmacyAddress()) || isBlank(request.getPhone())) {
                throw new IllegalArgumentException("Pharmacy name, address, and phone are required for pharmacy owners");
            }
        }
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
