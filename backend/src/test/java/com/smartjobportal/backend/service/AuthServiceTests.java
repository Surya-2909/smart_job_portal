package com.smartjobportal.backend.service;

import com.smartjobportal.backend.model.UserAccount;
import com.smartjobportal.backend.repository.UserAccountRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class AuthServiceTests {

    private UserAccountRepository repository;
    private AuthService authService;

    @BeforeEach
    void setUp() {
        repository = mock(UserAccountRepository.class);
        authService = new AuthService(repository, new BCryptPasswordEncoder(4));
    }

    @Test
    void registerNormalizesUsernameAndStoresOnlyPasswordHash() {
        when(repository.existsByUsername("jane.doe")).thenReturn(false);
        when(repository.save(any(UserAccount.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UserAccount account = authService.register(
                " Jane.Doe ",
                LocalDate.of(1995, 4, 12),
                "correct horse",
                "correct horse"
        );

        assertEquals("jane.doe", account.getUsername());
        assertEquals(LocalDate.of(1995, 4, 12), account.getDateOfBirth());
        assertNotEquals("correct horse", account.getPasswordHash());
        assertTrue(new BCryptPasswordEncoder().matches("correct horse", account.getPasswordHash()));
    }

    @Test
    void authenticateAcceptsUsernameRegardlessOfCase() {
        UserAccount account = new UserAccount(
                "jane.doe",
                LocalDate.of(1995, 4, 12),
                new BCryptPasswordEncoder(4).encode("correct horse")
        );
        when(repository.findByUsername("jane.doe")).thenReturn(Optional.of(account));

        assertEquals(account, authService.authenticate("Jane.Doe", "correct horse"));
    }

    @Test
    void registerRejectsDuplicateUsername() {
        when(repository.existsByUsername("jane.doe")).thenReturn(true);

        AuthException exception = assertThrows(
                AuthException.class,
                () -> authService.register(
                        "Jane.Doe",
                        LocalDate.of(1995, 4, 12),
                        "correct horse",
                        "correct horse"
                )
        );

        assertEquals(409, exception.getStatus());
        verify(repository, never()).save(any(UserAccount.class));
    }

    @Test
    void registerRejectsMismatchedPasswords() {
        AuthException exception = assertThrows(
                AuthException.class,
                () -> authService.register(
                        "jane.doe",
                        LocalDate.of(1995, 4, 12),
                        "correct horse",
                        "different horse"
                )
        );

        assertEquals(400, exception.getStatus());
        verify(repository, never()).save(any(UserAccount.class));
    }

    @Test
    void authenticateUsesGenericErrorForInvalidCredentials() {
        when(repository.findByUsername("jane.doe")).thenReturn(Optional.empty());

        AuthException exception = assertThrows(
                AuthException.class,
                () -> authService.authenticate("jane.doe", "wrong password")
        );

        assertEquals(401, exception.getStatus());
        assertEquals("Invalid username or password.", exception.getMessage());
    }

    @Test
    void updateProfilePersistsNormalizedProfileDetails() {
        UserAccount account = new UserAccount(
                "jane.doe",
                LocalDate.of(1995, 4, 12),
                "password-hash"
        );
        when(repository.findByUsername("jane.doe")).thenReturn(Optional.of(account));
        when(repository.save(account)).thenReturn(account);

        UserAccount updated = authService.updateProfile(
                "Jane.Doe",
                " Jane Doe ",
                " JANE@EXAMPLE.COM ",
                " 555-0100 ",
                " Bangalore ",
                " Java Developer ",
                " Java, React ",
                " Software Engineer ",
                " Computer Science "
        );

        assertEquals("Jane Doe", updated.getFullName());
        assertEquals("jane@example.com", updated.getEmail());
        assertEquals("555-0100", updated.getPhone());
        assertEquals("Bangalore", updated.getLocation());
        assertEquals("Java Developer", updated.getHeadline());
        assertEquals("Java, React", updated.getSkills());
        assertEquals("Software Engineer", updated.getExperience());
        assertEquals("Computer Science", updated.getEducation());
        verify(repository).save(account);
    }

    @Test
    void updateProfileRejectsInvalidEmailWithoutSaving() {
        UserAccount account = new UserAccount(
                "jane.doe",
                LocalDate.of(1995, 4, 12),
                "password-hash"
        );
        when(repository.findByUsername("jane.doe")).thenReturn(Optional.of(account));

        AuthException exception = assertThrows(
                AuthException.class,
                () -> authService.updateProfile(
                        "jane.doe",
                        "Jane Doe",
                        "invalid-email",
                        "",
                        "",
                        "",
                        "",
                        "",
                        ""
                )
        );

        assertEquals(400, exception.getStatus());
        assertEquals("Enter a valid email address.", exception.getMessage());
        verify(repository, never()).save(any(UserAccount.class));
    }
}
