package com.smartjobportal.backend.controller;

import com.smartjobportal.backend.model.UserAccount;
import com.smartjobportal.backend.service.AuthException;
import com.smartjobportal.backend.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(
        originPatterns = {"http://localhost:[*]", "http://127.0.0.1:[*]"},
        allowCredentials = "true"
)
public class AuthController {

    private static final String SESSION_USERNAME = "authenticatedUsername";

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(
            @RequestBody RegisterRequest request,
            HttpServletRequest servletRequest
    ) {
        UserAccount account = authService.register(
                request.username(),
                request.dateOfBirth(),
                request.password(),
                request.confirmPassword()
        );
        establishSession(servletRequest, account.getUsername());

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(publicAccount(account));
    }

    @PostMapping("/login")
    public Map<String, Object> login(
            @RequestBody LoginRequest request,
            HttpServletRequest servletRequest
    ) {
        UserAccount account = authService.authenticate(request.username(), request.password());
        establishSession(servletRequest, account.getUsername());
        return publicAccount(account);
    }

    @GetMapping("/me")
    public Map<String, Object> currentUser(HttpSession session) {
        return publicAccount(authService.findByUsername(authenticatedUsername(session)));
    }

    @PutMapping("/me")
    public Map<String, Object> updateCurrentUser(
            @RequestBody ProfileUpdateRequest request,
            HttpSession session
    ) {
        UserAccount account = authService.updateProfile(
                authenticatedUsername(session),
                request.fullName(),
                request.email(),
                request.phone(),
                request.location(),
                request.headline(),
                request.skills(),
                request.experience(),
                request.education()
        );
        return publicAccount(account);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        return ResponseEntity.noContent().build();
    }

    @ExceptionHandler(AuthException.class)
    public ResponseEntity<Map<String, String>> handleAuthException(AuthException exception) {
        return ResponseEntity.status(exception.getStatus())
                .body(Map.of("message", exception.getMessage()));
    }

    private static void establishSession(HttpServletRequest request, String username) {
        HttpSession existingSession = request.getSession(false);
        if (existingSession != null) {
            existingSession.invalidate();
        }

        request.getSession(true).setAttribute(SESSION_USERNAME, username);
    }

    private static String authenticatedUsername(HttpSession session) {
        Object username = session.getAttribute(SESSION_USERNAME);
        if (!(username instanceof String authenticatedUsername)) {
            throw new AuthException("You are not signed in.", 401);
        }
        return authenticatedUsername;
    }

    private static Map<String, Object> publicAccount(UserAccount account) {
        Map<String, Object> publicAccount = new LinkedHashMap<>();
        publicAccount.put("username", account.getUsername());
        publicAccount.put("dateOfBirth", account.getDateOfBirth());
        publicAccount.put("fullName", account.getFullName());
        publicAccount.put("email", account.getEmail());
        publicAccount.put("phone", account.getPhone());
        publicAccount.put("location", account.getLocation());
        publicAccount.put("headline", account.getHeadline());
        publicAccount.put("skills", account.getSkills());
        publicAccount.put("experience", account.getExperience());
        publicAccount.put("education", account.getEducation());
        return publicAccount;
    }

    public record RegisterRequest(
            String username,
            LocalDate dateOfBirth,
            String password,
            String confirmPassword
    ) {
    }

    public record LoginRequest(String username, String password) {
    }

    public record ProfileUpdateRequest(
            String fullName,
            String email,
            String phone,
            String location,
            String headline,
            String skills,
            String experience,
            String education
    ) {
    }
}
