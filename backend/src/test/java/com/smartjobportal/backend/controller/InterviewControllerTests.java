package com.smartjobportal.backend.controller;

import com.smartjobportal.backend.service.InterviewService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class InterviewControllerTests {

    private InterviewService interviewService;
    private InterviewController interviewController;

    @BeforeEach
    void setUp() {
        interviewService = mock(InterviewService.class);
        interviewController = new InterviewController(interviewService);
    }

    @Test
    void rejectsRequestWithoutJobTitle() {
        ResponseEntity<Map<String, Object>> response = interviewController.generateQuestions(
                Map.of("jobTitle", " ", "year", "2025")
        );

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Job title is required", response.getBody().get("message"));
        verify(interviewService, never()).generateQuestions(
                null,
                " ",
                null,
                2025
        );
    }

    @Test
    void rejectsYearsOutsideThePreviousThreeCompletedYears() {
        int invalidYear = InterviewService.getPreviousInterviewYears().getFirst() + 1;
        ResponseEntity<Map<String, Object>> response = interviewController.generateQuestions(
                Map.of("company", "Example", "jobTitle", "Java Developer", "year", String.valueOf(invalidYear))
        );

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals(
                InterviewService.getPreviousInterviewYears(),
                response.getBody().get("availableYears")
        );
        verify(interviewService, never()).generateQuestions(
                "Example",
                "Java Developer",
                null,
                invalidYear
        );
    }

    @Test
    void rejectsInvalidStreamingRequestBeforeCreatingEventStream() {
        int invalidYear = InterviewService.getPreviousInterviewYears().getFirst() + 1;

        ResponseEntity<?> response = interviewController.generateQuestionsStream(
                Map.of(
                        "jobTitle", "Java Developer",
                        "year", String.valueOf(invalidYear)
                )
        );

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        verify(interviewService, never()).generateQuestions(
                null,
                "Java Developer",
                null,
                invalidYear
        );
    }

    @Test
    void reportsAiProviderFailuresAsBadGateway() {
        int year = InterviewService.getPreviousInterviewYears().getFirst();
        when(interviewService.generateQuestions(
                eq("Acme"),
                eq("Java Developer"),
                eq("Java"),
                eq(year),
                any(),
                any()
        ))
                .thenThrow(new RuntimeException("Ollama is unavailable"));

        ResponseEntity<Map<String, Object>> response =
                interviewController.generateQuestions(
                        Map.of(
                                "company", "Acme",
                                "jobTitle", "Java Developer",
                                "skills", "Java",
                                "year", String.valueOf(year)
                        )
                );

        assertEquals(HttpStatus.BAD_GATEWAY, response.getStatusCode());
        assertEquals(false, response.getBody().get("success"));
        assertEquals(
                "Ollama is unavailable",
                response.getBody().get("message")
        );
    }

    @Test
    void returnsGeneratedQuestionsOnSuccess() {
        int year = InterviewService.getPreviousInterviewYears().getFirst();
        List<Map<String, Object>> questions =
                List.of(Map.of("question", "What is Java?"));
        when(interviewService.generateQuestions(
                eq("Acme"),
                eq("Java Developer"),
                eq("Java"),
                eq(year),
                any(),
                any()
        ))
                .thenReturn(questions);

        ResponseEntity<Map<String, Object>> response =
                interviewController.generateQuestions(
                        Map.of(
                                "company", "Acme",
                                "jobTitle", "Java Developer",
                                "skills", "Java",
                                "year", String.valueOf(year)
                        )
                );

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(questions, response.getBody().get("questions"));
        assertEquals("Acme", response.getBody().get("company"));
        assertEquals(year, response.getBody().get("year"));
    }
}
