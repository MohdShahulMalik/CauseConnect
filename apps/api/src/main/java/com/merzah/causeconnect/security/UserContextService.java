package com.merzah.causeconnect.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * Service to extract user information from WorkOS JWT tokens.
 * 
 * WorkOS JWT claims include:
 * - sub: User ID
 * - email: User email address
 * - organization_id: Organization ID (if user is part of an org)
 * - role: User's role (if configured)
 * - permissions: List of permissions (if configured)
 * - first_name: User's first name (if available)
 * - last_name: User's last name (if available)
 */
@Service
public class UserContextService {

    /**
     * Get the current authenticated user from the JWT token.
     * 
     * @return Optional containing the user details, or empty if not authenticated
     */
    public Optional<WorkOSUser> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated()) {
            return Optional.empty();
        }

        Object principal = authentication.getPrincipal();
        if (!(principal instanceof Jwt)) {
            return Optional.empty();
        }

        Jwt jwt = (Jwt) principal;
        return Optional.of(extractUserFromJwt(jwt));
    }

    /**
     * Get the current user's ID from the JWT token.
     * 
     * @return User ID (sub claim), or null if not authenticated
     */
    public String getCurrentUserId() {
        return getCurrentUser().map(WorkOSUser::getId).orElse(null);
    }

    /**
     * Get the current user's email from the JWT token.
     * 
     * @return User email, or null if not authenticated
     */
    public String getCurrentUserEmail() {
        return getCurrentUser().map(WorkOSUser::getEmail).orElse(null);
    }

    /**
     * Get the current user's organization ID from the JWT token.
     * 
     * @return Organization ID, or null if not part of an organization
     */
    public String getCurrentOrganizationId() {
        return getCurrentUser().map(WorkOSUser::getOrganizationId).orElse(null);
    }

    /**
     * Extract user details from a JWT token.
     */
    private WorkOSUser extractUserFromJwt(Jwt jwt) {
        return WorkOSUser.builder()
                .id(jwt.getSubject())
                .email(jwt.getClaimAsString("email"))
                .firstName(jwt.getClaimAsString("first_name"))
                .lastName(jwt.getClaimAsString("last_name"))
                .organizationId(jwt.getClaimAsString("organization_id"))
                .role(jwt.getClaimAsString("role"))
                .permissions(jwt.getClaimAsStringList("permissions"))
                .profilePictureUrl(jwt.getClaimAsString("profile_picture_url"))
                .build();
    }

    /**
     * Represents a user authenticated via WorkOS.
     */
    public static class WorkOSUser {
        private final String id;
        private final String email;
        private final String firstName;
        private final String lastName;
        private final String organizationId;
        private final String role;
        private final List<String> permissions;
        private final String profilePictureUrl;

        private WorkOSUser(Builder builder) {
            this.id = builder.id;
            this.email = builder.email;
            this.firstName = builder.firstName;
            this.lastName = builder.lastName;
            this.organizationId = builder.organizationId;
            this.role = builder.role;
            this.permissions = builder.permissions;
            this.profilePictureUrl = builder.profilePictureUrl;
        }

        public static Builder builder() {
            return new Builder();
        }

        // Getters
        public String getId() { return id; }
        public String getEmail() { return email; }
        public String getFirstName() { return firstName; }
        public String getLastName() { return lastName; }
        public String getOrganizationId() { return organizationId; }
        public String getRole() { return role; }
        public List<String> getPermissions() { return permissions; }
        public String getProfilePictureUrl() { return profilePictureUrl; }

        public static class Builder {
            private String id;
            private String email;
            private String firstName;
            private String lastName;
            private String organizationId;
            private String role;
            private List<String> permissions;
            private String profilePictureUrl;

            public Builder id(String id) {
                this.id = id;
                return this;
            }

            public Builder email(String email) {
                this.email = email;
                return this;
            }

            public Builder firstName(String firstName) {
                this.firstName = firstName;
                return this;
            }

            public Builder lastName(String lastName) {
                this.lastName = lastName;
                return this;
            }

            public Builder organizationId(String organizationId) {
                this.organizationId = organizationId;
                return this;
            }

            public Builder role(String role) {
                this.role = role;
                return this;
            }

            public Builder permissions(List<String> permissions) {
                this.permissions = permissions;
                return this;
            }

            public Builder profilePictureUrl(String profilePictureUrl) {
                this.profilePictureUrl = profilePictureUrl;
                return this;
            }

            public WorkOSUser build() {
                return new WorkOSUser(this);
            }
        }
    }
}
