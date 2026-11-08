package com.smartjobportal.backend.service;

import com.smartjobportal.backend.model.UserAccount;
import com.smartjobportal.backend.repository.UserAccountRepository;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.Locale;

@Service
public class AuthService {

    private static final int MAX_BCRYPT_PASSWORD_BYTES = 72;

    private final UserAccountRepository userAccountRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(
            UserAccountRepository userAccountRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userAccountRepository = userAccountRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public UserAccount register(
            String username,
            LocalDate dateOfBirth,
            String password,
            String confirmPassword
    ) {
        String normalizedUsername = normalizeUsername(username);

        if (dateOfBirth == null || !dateOfBirth.isBefore(LocalDate.now())) {
            throw new AuthException("Enter a valid date of birth.", 400);
        }

        validatePassword(password);
        if (!password.equals(confirmPassword)) {
            throw new AuthException("Passwords do not match.", 400);
        }

        if (userAccountRepository.existsByUsername(normalizedUsername)) {
            throw new AuthException("That username is already taken.", 409);
        }

        UserAccount account = new UserAccount(
                normalizedUsername,
                dateOfBirth,
                passwordEncoder.encode(password)
        );

        try {
            return userAccountRepository.save(account);
        } catch (DuplicateKeyException exception) {
            throw new AuthException("That username is already taken.", 409);
        }
    }

    public UserAccount authenticate(String username, String password) {
        String normalizedUsername = normalizeUsername(username);
        if (password == null || password.isBlank()) {
            throw invalidCredentials();
        }

        UserAccount account = userAccountRepository.findByUsername(normalizedUsername)
                .orElseThrow(AuthService::invalidCredentials);

        if (!passwordEncoder.matches(password, account.getPasswordHash())) {
            throw invalidCredentials();
        }

        return account;
    }

    public UserAccount findByUsername(String username) {
        return userAccountRepository.findByUsername(normalizeUsername(username))
                .orElseThrow(AuthService::invalidCredentials);
    }

    public UserAccount updateProfile(
            String username,
            String fullName,
            String email,
            String phone,
            String location,
            String headline,
            String skills,
            String experience,
            String education
    ) {
        UserAccount account = findByUsername(username);
        account.updateProfile(
                requiredProfileValue(fullName, "Full name", 100),
                normalizeEmail(email),
                optionalProfileValue(phone, "Phone", 30),
                optionalProfileValue(location, "Location", 120),
                optionalProfileValue(headline, "Professional headline", 180),
                optionalProfileValue(skills, "Skills", 1000),
                optionalProfileValue(experience, "Experience", 3000),
                optionalProfileValue(education, "Education", 3000)
        );
        return userAccountRepository.save(account);
    }

    private static String normalizeEmail(String email) {
        String normalized = requiredProfileValue(email, "Email", 254).toLowerCase(Locale.ROOT);
        if (!normalized.matches("[^\\s@]+@[^\\s@]+\\.[^\\s@]+")) {
            throw new AuthException("Enter a valid email address.", 400);
        }
        return normalized;
    }

    private static String requiredProfileValue(String value, String fieldName, int maxLength) {
        if (value == null || value.isBlank()) {
            throw new AuthException(fieldName + " is required.", 400);
        }
        String normalized = value.trim();
        if (normalized.length() > maxLength) {
            throw new AuthException(fieldName + " must be no more than " + maxLength + " characters.", 400);
        }
        return normalized;
    }

    private static String optionalProfileValue(String value, String fieldName, int maxLength) {
        if (value == null || value.isBlank()) {
            return "";
        }
        String normalized = value.trim();
        if (normalized.length() > maxLength) {
            throw new AuthException(fieldName + " must be no more than " + maxLength + " characters.", 400);
        }
        return normalized;
    }

    private static String normalizeUsername(String username) {
        if (username == null) {
            throw new AuthException("Enter a username.", 400);
        }

        String normalized = username.trim().toLowerCase(Locale.ROOT);
        if (!normalized.matches("[a-z0-9._-]{3,30}")) {
            throw new AuthException(
                    "Username must be 3–30 characters using letters, numbers, dots, underscores, or hyphens.",
                    400
            );
        }

        return normalized;
    }

    private static void validatePassword(String password) {
        if (password == null || password.length() < 8) {
            throw new AuthException("Password must be at least 8 characters.", 400);
        }
        if (password.getBytes(StandardCharsets.UTF_8).length > MAX_BCRYPT_PASSWORD_BYTES) {
            throw new AuthException("Password must be no more than 72 UTF-8 bytes.", 400);
        }
    }

    private static AuthException invalidCredentials() {
        return new AuthException("Invalid username or password.", 401);
    }
}
