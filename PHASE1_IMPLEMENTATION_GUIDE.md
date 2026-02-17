# CauseConnect Phase 1: Days 3-5 Implementation Guide

This document contains the complete implementation steps for the Users & Auth module.

---

## 1. User Entity

**File:** `src/main/java/com/causeconnect/user/User.java`

```java
package com.causeconnect.user;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Table(name = "users")
@Data                    // Generates getters, setters, toString, equals, hashCode
@NoArgsConstructor       // Required by JPA for creating empty objects
@AllArgsConstructor      // Generates constructor with all fields
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(unique = true, nullable = false)
    private String email;
    
    @Column(nullable = false)
    private String name;
    
    @Column(columnDefinition = "TEXT")
    private String bio;
    
    @Column(name = "avatar_url")
    private String avatarUrl;
}
```

**Explanation:** 
- `@Data` replaces all getters, setters, toString, equals, and hashCode methods
- `@NoArgsConstructor` is required because JPA needs to create empty instances via reflection
- `@AllArgsConstructor` gives you a constructor with all fields (useful for testing)

---

## 2. User Repository

**File:** `src/main/java/com/causeconnect/user/UserRepository.java`

```java
package com.causeconnect.user;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {
    
    Optional<User> findByEmail(String email);
    
    boolean existsByEmail(String email);
}
```

**Explanation:** 
- Repositories are interfaces, so no Lombok needed here
- Extending `JpaRepository` gives you free CRUD methods (save, findById, findAll, delete, etc.)
- The custom methods (`findByEmail`, `existsByEmail`) are auto-implemented by Spring based on method name

---

## 3. DTOs (Data Transfer Objects)

**File:** `src/main/java/com/causeconnect/user/UserResponse.java`

```java
package com.causeconnect.user;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    
    private UUID id;
    private String email;
    private String name;
    private String bio;
    private String avatarUrl;
    
    // Constructor to convert from Entity to DTO
    public UserResponse(User user) {
        this.id = user.getId();
        this.email = user.getEmail();
        this.name = user.getName();
        this.bio = user.getBio();
        this.avatarUrl = user.getAvatarUrl();
    }
}
```

**File:** `src/main/java/com/causeconnect/user/UserUpdateRequest.java`

```java
package com.causeconnect.user;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class UserUpdateRequest {
    
    private String name;
    private String bio;
    private String avatarUrl;
}
```

**Explanation:** 
- DTOs control what data flows in/out of your API
- `UserResponse` is what the API returns (includes conversion constructor)
- `UserUpdateRequest` is what the API receives for updates (only updatable fields)
- Using `@Data` eliminates all boilerplate for these simple data classes

---

## 4. User Service

**File:** `src/main/java/com/causeconnect/user/UserService.java`

```java
package com.causeconnect.user;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor  // Generates constructor with final fields
public class UserService {
    
    private final UserRepository userRepository;
    
    public UserResponse getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
        return new UserResponse(user);
    }
    
    public UserResponse getUserById(UUID id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found"));
        return new UserResponse(user);
    }
    
    @Transactional
    public UserResponse updateUser(String email, UserUpdateRequest request) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (request.getName() != null) {
            user.setName(request.getName());
        }
        if (request.getBio() != null) {
            user.setBio(request.getBio());
        }
        if (request.getAvatarUrl() != null) {
            user.setAvatarUrl(request.getAvatarUrl());
        }
        
        User updatedUser = userRepository.save(user);
        return new UserResponse(updatedUser);
    }
}
```

**Explanation:** 
- `@RequiredArgsConstructor` generates a constructor with all `final` fields
- This is the preferred way to do dependency injection in modern Spring (no need for `@Autowired`)
- Mark the field `final` to ensure it gets injected via constructor
- `@Transactional` ensures database changes are committed together (all or nothing)

---

## 5. User Controller

**File:** `src/main/java/com/causeconnect/user/UserController.java`

```java
package com.causeconnect.user;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {
    
    private final UserService userService;
    
    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(
            @AuthenticationPrincipal String email) {
        UserResponse user = userService.getCurrentUser(email);
        return ResponseEntity.ok(user);
    }
    
    @PatchMapping("/me")
    public ResponseEntity<UserResponse> updateCurrentUser(
            @AuthenticationPrincipal String email,
            @RequestBody UserUpdateRequest request) {
        UserResponse updatedUser = userService.updateUser(email, request);
        return ResponseEntity.ok(updatedUser);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable UUID id) {
        UserResponse user = userService.getUserById(id);
        return ResponseEntity.ok(user);
    }
}
```

**Explanation:** 
- `@RestController` combines `@Controller` + `@ResponseBody` (returns JSON automatically)
- `@RequestMapping("/users")` sets the base path for all endpoints in this controller
- `@AuthenticationPrincipal` extracts the email we set in the JWT filter
- `@RequestBody` tells Spring to convert JSON to our Java object
- `@PathVariable` extracts values from the URL (like the UUID in `/users/{id}`)

---

## 6. JWT Authentication Filter

**File:** `src/main/java/com/causeconnect/security/JwtAuthenticationFilter.java`

```java
package com.causeconnect.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
@RequiredArgsConstructor
@Slf4j  // Provides a 'log' variable for logging
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    
    private final WorkOsJwtValidator jwtValidator;
    
    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        
        String authHeader = request.getHeader("Authorization");
        
        // If no Authorization header or doesn't start with "Bearer ", skip this filter
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }
        
        String token = authHeader.substring(7); // Remove "Bearer " prefix
        
        try {
            // Validate token and get email
            String email = jwtValidator.validateAndGetEmail(token);
            
            // Create Spring Security authentication object
            UsernamePasswordAuthenticationToken authentication = 
                new UsernamePasswordAuthenticationToken(
                    email,           // Principal (the user identity)
                    null,            // Credentials (not needed for JWT)
                    Collections.emptyList()  // Authorities/roles (empty for now)
                );
            
            // Store authentication in the security context
            SecurityContextHolder.getContext().setAuthentication(authentication);
            
        } catch (Exception e) {
            log.error("JWT validation failed: {}", e.getMessage());
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }
        
        // Continue to the next filter/controller
        filterChain.doFilter(request, response);
    }
}
```

**Explanation:** 
- Extends `OncePerRequestFilter` to run once per HTTP request
- `@Slf4j` gives you a `log` variable for logging (replaces `LoggerFactory.getLogger()`)
- Extracts the JWT from `Authorization: Bearer <token>` header
- Validates the token with WorkOS and extracts the user's email
- Creates a Spring Security authentication object with the email as the principal
- Sets it in the SecurityContext so controllers can access it via `@AuthenticationPrincipal`
- If validation fails, returns 401 Unauthorized

---

## 7. WorkOS JWT Validator

**File:** `src/main/java/com/causeconnect/security/WorkOsJwtValidator.java`

```java
package com.causeconnect.security;

import com.workos.WorkOS;
import com.workos.usermanagement.models.User;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class WorkOsJwtValidator {
    
    private final WorkOS workos;
    private final String clientId;
    
    public WorkOsJwtValidator(
            @Value("${workos.api.key}") String apiKey,
            @Value("${workos.client.id}") String clientId) {
        this.workos = new WorkOS(apiKey);
        this.clientId = clientId;
    }
    
    public String validateAndGetEmail(String accessToken) {
        try {
            log.debug("Validating token with WorkOS");
            
            User user = workos.userManagement().authenticateWithToken(
                accessToken, 
                clientId
            );
            
            log.debug("Token valid for user: {}", user.getEmail());
            return user.getEmail();
            
        } catch (Exception e) {
            log.error("Token validation failed: {}", e.getMessage());
            throw new RuntimeException("Invalid token", e);
        }
    }
}
```

**Explanation:** 
- `@Component` marks this as a Spring bean (auto-detectable for injection)
- `@Value` injects values from `application.properties`
- Creates a WorkOS client instance with your API key
- `authenticateWithToken()` validates the JWT with WorkOS servers
- Returns the user's email from the validated token
- Wraps errors in RuntimeException for the filter to catch

---

## 8. Security Configuration

**File:** `src/main/java/com/causeconnect/security/SecurityConfig.java`

```java
package com.causeconnect.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {
    
    private final JwtAuthenticationFilter jwtFilter;
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // Disable CSRF (not needed for stateless JWT APIs)
            .csrf(csrf -> csrf.disable())
            
            // No sessions - each request is independent (stateless)
            .sessionManagement(session -> 
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            
            // Define which endpoints need authentication
            .authorizeHttpRequests(auth -> auth
                // Public endpoint - anyone can view user profiles
                .requestMatchers(HttpMethod.GET, "/users/{id}").permitAll()
                
                // Protected endpoints - need valid JWT
                .requestMatchers("/users/me", "/users/me/**").authenticated()
                
                // All other requests need authentication
                .anyRequest().authenticated()
            )
            
            // Add our JWT filter before Spring's default authentication filter
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
}
```

**Explanation:** 
- `@Configuration` marks this as a configuration class
- `@EnableWebSecurity` enables Spring Security's web security support
- `SecurityFilterChain` defines the security rules (replaces old `WebSecurityConfigurerAdapter`)
- **CSRF disabled**: Not needed for APIs that use JWT (stateless)
- **Stateless sessions**: No HTTP sessions stored on server (each request carries JWT)
- **Authorization rules**: 
  - `GET /users/{id}` is public (view any profile)
  - `/users/me/**` requires authentication (only view your own data)
  - Everything else requires auth
- **Filter order**: JWT filter runs before Spring's authentication to set up the security context

---

## 9. Application Properties

**File:** `src/main/resources/application.properties`

```properties
# ===========================================
# Database Configuration
# ===========================================
spring.datasource.url=jdbc:postgresql://localhost:5432/causeconnect
spring.datasource.username=postgres
spring.datasource.password=your_password_here
spring.datasource.driver-class-name=org.postgresql.Driver

# ===========================================
# JPA / Hibernate Configuration
# ===========================================
# 'update' = auto-create/update tables based on entities
spring.jpa.hibernate.ddl-auto=update
# Show SQL queries in console (good for debugging)
spring.jpa.show-sql=true
# Use PostgreSQL dialect
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
# Format SQL nicely in logs
spring.jpa.properties.hibernate.format_sql=true

# ===========================================
# WorkOS Configuration
# ===========================================
workos.api.key=sk_test_your_workos_api_key_here
workos.client.id=client_your_client_id_here

# ===========================================
# Server Configuration
# ===========================================
server.port=8080

# ===========================================
# Logging
# ===========================================
logging.level.com.causeconnect=DEBUG
```

---

## 10. pom.xml Dependencies

Make sure your `pom.xml` has these dependencies:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 
                             https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.0</version>
        <relativePath/>
    </parent>
    
    <groupId>com.causeconnect</groupId>
    <artifactId>causeconnect</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <name>causeconnect</name>
    
    <properties>
        <java.version>17</java.version>
    </properties>
    
    <dependencies>
        <!-- Spring Boot Starters -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-security</artifactId>
        </dependency>
        
        <!-- Database -->
        <dependency>
            <groupId>org.postgresql</groupId>
            <artifactId>postgresql</artifactId>
            <scope>runtime</scope>
        </dependency>
        
        <!-- Lombok -->
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>
        
        <!-- WorkOS SDK -->
        <dependency>
            <groupId>com.workos</groupId>
            <artifactId>workos</artifactId>
            <version>3.0.0</version>
        </dependency>
    </dependencies>
    
    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
                <configuration>
                    <excludes>
                        <exclude>
                            <groupId>org.projectlombok</groupId>
                            <artifactId>lombok</artifactId>
                        </exclude>
                    </excludes>
                </configuration>
            </plugin>
        </plugins>
    </build>
</project>
```

---

## Directory Structure

```
src/main/java/com/causeconnect/
├── CauseConnectApplication.java
├── user/
│   ├── User.java                  # Lombok entity
│   ├── UserRepository.java        # JPA repository
│   ├── UserService.java           # Business logic
│   ├── UserController.java        # REST endpoints
│   ├── UserResponse.java          # Output DTO
│   └── UserUpdateRequest.java     # Input DTO
└── security/
    ├── JwtAuthenticationFilter.java   # JWT validation filter
    ├── WorkOsJwtValidator.java        # WorkOS integration
    └── SecurityConfig.java            # Security rules

src/main/resources/
└── application.properties         # Configuration
```

---

## Testing Steps

1. **Start PostgreSQL** and create database `causeconnect`
2. **Run the app**: `./mvnw spring-boot:run` (or use your IDE)
3. **Database check**: Hibernate auto-creates the `users` table
4. **Insert test user**:
   ```sql
   INSERT INTO users (id, email, name, bio, avatar_url) 
   VALUES (gen_random_uuid(), 'test@example.com', 'Test User', NULL, NULL);
   ```
5. **Test public endpoint**: `curl http://localhost:8080/users/{uuid}`
6. **Test protected endpoint** (needs WorkOS token): `curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:8080/users/me`

The Lombok version reduces ~200 lines of boilerplate code compared to writing everything manually!
