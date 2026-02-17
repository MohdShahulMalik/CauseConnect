package com.merzah.causeconnect.controller;

import com.merzah.causeconnect.security.UserContextService;
import com.merzah.causeconnect.security.UserContextService.WorkOSUser;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

/**
 * Authentication Controller
 * 
 * Provides endpoints to test authentication and retrieve current user information.
 * All endpoints in this controller require authentication (except health check).
 */
@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final UserContextService userContextService;

    public AuthController(UserContextService userContextService) {
        this.userContextService = userContextService;
    }

    /**
     * Get the current authenticated user's profile.
     * 
     * @return User details from the JWT token
     */
    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getCurrentUser() {
        WorkOSUser user = userContextService.getCurrentUser().orElse(null);
        
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of(
                "error", "Not authenticated",
                "message", "No valid authentication token found"
            ));
        }

        Map<String, Object> response = new HashMap<>();
        response.put("id", user.getId());
        response.put("email", user.getEmail());
        response.put("firstName", user.getFirstName());
        response.put("lastName", user.getLastName());
        response.put("organizationId", user.getOrganizationId());
        response.put("role", user.getRole());
        response.put("permissions", user.getPermissions());
        response.put("profilePictureUrl", user.getProfilePictureUrl());

        return ResponseEntity.ok(response);
    }

    /**
     * Check authentication status.
     * Useful for mobile app to verify token validity on app startup.
     * 
     * @return Authentication status
     */
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getAuthStatus() {
        WorkOSUser user = userContextService.getCurrentUser().orElse(null);
        
        Map<String, Object> response = new HashMap<>();
        response.put("authenticated", user != null);
        
        if (user != null) {
            response.put("userId", user.getId());
            response.put("email", user.getEmail());
        }

        return ResponseEntity.ok(response);
    }
}
