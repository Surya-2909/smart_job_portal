package com.smartjobportal.backend.controller;

import com.smartjobportal.backend.model.UserAccount;
import com.smartjobportal.backend.service.AuthException;
import com.smartjobportal.backend.service.AuthService;
import jakarta.servlet.http.HttpSession;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpSession;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class AuthControllerTests {

    private AuthService authService;
    private AuthController authController;

    @BeforeEach
    void setUp() {
        authService = mock(AuthService.class);
        authController = new AuthController(authService);
    }

    @Test
    void profileUpdateRequiresAnAuthenticatedSession() {
        AuthController.ProfileUpdateRequest request = new AuthController.ProfileUpdateRequest(
                "Jane Doe",
                "jane@example.com",
                "",
                "",
                "",
                "",
                "",
                ""
        );

        AuthException exception = assertThrows(
                AuthException.class,
                () -> authController.updateCurrentUser(request, new MockHttpSession())
        );

        assertEquals(401, exception.getStatus());
        verify(authService, never()).updateProfile(
                "jane.doe",
                "Jane Doe",
                "jane@example.com",
                "",
                "",
                "",
                "",
                "",
                ""
        );
    }

    @Test
    void authenticatedProfileUpdateUsesTheSessionUsername() {
        HttpSession session = new MockHttpSession();
        session.setAttribute("authenticatedUsername", "jane.doe");
        AuthController.ProfileUpdateRequest request = new AuthController.ProfileUpdateRequest(
                "Jane Doe",
                "jane@example.com",
                "",
                "",
                "",
                "",
                "",
                ""
        );
        UserAccount account = new UserAccount(
                "jane.doe",
                LocalDate.of(1995, 4, 12),
                "password-hash"
        );
        account.updateProfile("Jane Doe", "jane@example.com", "", "", "", "", "", "");
        when(authService.updateProfile(
                "jane.doe",
                "Jane Doe",
                "jane@example.com",
                "",
                "",
                "",
                "",
                "",
                ""
        )).thenReturn(account);

        var response = authController.updateCurrentUser(request, session);

        assertEquals("jane.doe", response.get("username"));
        assertEquals("Jane Doe", response.get("fullName"));
        assertEquals("jane@example.com", response.get("email"));
        verify(authService).updateProfile(
                "jane.doe",
                "Jane Doe",
                "jane@example.com",
                "",
                "",
                "",
                "",
                "",
                ""
        );
    }
}
