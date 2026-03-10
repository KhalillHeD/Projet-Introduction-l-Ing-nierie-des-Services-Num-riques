package com.pharmalovo.backend.security;

import com.pharmalovo.backend.model.User;
import com.pharmalovo.backend.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

/**
 * JWT Authentication middleware.
 *
 * Validates JWT tokens from Authorization header and sets user context.
 */
@Component
public class AuthenticationMiddleware extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    public AuthenticationMiddleware(JwtUtil jwtUtil, UserRepository userRepository) {
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return request.getRequestURI().startsWith("/api/auth/") ||
               request.getRequestURI().startsWith("/api/medications") && request.getMethod().equals("GET");
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            try {
                if (!jwtUtil.isTokenExpired(token)) {
                    UUID userId = jwtUtil.extractUserId(token);
                    String role = jwtUtil.extractRole(token);
                    String email = jwtUtil.extractUsername(token);

                    // Verify user exists
                    User user = userRepository.findById(userId).orElse(null);
                    if (user != null && user.getEmail().equals(email)) {
                        request.setAttribute("userId", userId);
                        request.setAttribute("userRole", role);
                        request.setAttribute("userEmail", email);

                        // Set SecurityContext for @PreAuthorize
                        UserDetails userDetails = org.springframework.security.core.userdetails.User.builder()
                                .username(email)
                                .password("")
                                .authorities(new SimpleGrantedAuthority("ROLE_" + role.toUpperCase()))
                                .build();
                        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                                userDetails, null, userDetails.getAuthorities());
                        SecurityContextHolder.getContext().setAuthentication(auth);
                    }
                }
            } catch (Exception e) {
                // Invalid token, continue without authentication
            }
        }

        filterChain.doFilter(request, response);
    }
}
