package com.merzah.causeconnect.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Spring Security Configuration for WorkOS JWT Authentication.
 * 
 * Configures the application as an OAuth2 Resource Server that validates
 * JWT tokens issued by WorkOS AuthKit.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Value("${workos.jwt.issuer-uri:https://api.workos.com/sso}")
    private String issuerUri;

    @Value("${workos.jwt.jwk-set-uri:https://api.workos.com/.well-known/jwks.json}")
    private String jwkSetUri;

    /**
     * Configures the security filter chain for JWT authentication.
     * 
     * Public endpoints:
     * - /actuator/health - Health checks
     * - /actuator/info - Application info
     * - /swagger-ui/** - API documentation UI
     * - /v3/api-docs/** - OpenAPI docs
     * 
     * All other endpoints require authentication.
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> 
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .authorizeHttpRequests(auth -> auth
                // Public endpoints
                .requestMatchers("/actuator/health", "/actuator/info").permitAll()
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
                // Require authentication for all other requests
                .anyRequest().authenticated()
            )
            .oauth2ResourceServer(oauth2 -> oauth2
                .jwt(jwt -> jwt
                    .decoder(jwtDecoder())
                    .jwtAuthenticationConverter(jwtAuthenticationConverter())
                )
            );

        return http.build();
    }

    /**
     * JWT Decoder configured to validate tokens from WorkOS.
     * Uses the JWKS endpoint to fetch public keys for signature verification.
     */
    @Bean
    public JwtDecoder jwtDecoder() {
        return NimbusJwtDecoder.withJwkSetUri(jwkSetUri).build();
    }

    /**
     * Converts JWT claims to Spring Security authorities.
     * 
     * WorkOS JWT claims structure:
     * - sub: User ID
     * - email: User email
     * - organization_id: Organization ID (if applicable)
     * - role: User role (if applicable)
     * - permissions: Array of permissions (if applicable)
     */
    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtGrantedAuthoritiesConverter authoritiesConverter = new JwtGrantedAuthoritiesConverter();
        authoritiesConverter.setAuthorityPrefix("ROLE_");
        authoritiesConverter.setAuthoritiesClaimName("roles");

        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(authoritiesConverter);
        converter.setPrincipalClaimName("sub");

        return converter;
    }
}
