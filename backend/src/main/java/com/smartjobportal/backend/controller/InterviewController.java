package com.smartjobportal.backend.controller;

import com.smartjobportal.backend.service.InterviewService;

import org.springframework.http.MediaType;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.atomic.AtomicReference;

@RestController
@RequestMapping("/api/interview")
@CrossOrigin(originPatterns = {"http://localhost:[*]", "http://127.0.0.1:[*]"})
public class InterviewController {

    private final InterviewService interviewService;

    public InterviewController(
            InterviewService interviewService) {

        this.interviewService =
                interviewService;
    }

    @PostMapping("/questions")
    public ResponseEntity<Map<String, Object>> generateQuestions(
            @RequestBody Map<String, String> request) {

        try {

            String jobTitle =
                    request.get("jobTitle");

            String company =
                    request.get("company");

            String skills =
                    request.get("skills");

            String requestedYear =
                    request.get("year");

            if (jobTitle == null ||
                    jobTitle.isBlank()) {

                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message",
                        "Job title is required"
                ));
            }

            int year;
            try {
                year = requestedYear == null || requestedYear.isBlank()
                        ? InterviewService.getPreviousInterviewYears().getFirst()
                        : Integer.parseInt(requestedYear);
            } catch (NumberFormatException e) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Year must be a valid calendar year."
                ));
            }

            List<Integer> availableYears = InterviewService.getPreviousInterviewYears();
            if (!availableYears.contains(year)) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Choose one of the three most recent completed years.",
                        "availableYears", availableYears
                ));
            }

            if (skills == null ||
                    skills.isBlank()) {

                skills =
                        "General programming skills";
            }

            AtomicReference<List<Map<String, String>>> sources = new AtomicReference<>(List.of());
            List<Map<String, Object>> questions = interviewService.generateQuestions(
                            company,
                            jobTitle,
                            skills,
                            year,
                            ignored -> { },
                            sources::set
                    );
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "company", company == null || company.isBlank() ? "Company not specified" : company,
                    "jobTitle", jobTitle,
                    "year", year,
                    "years", availableYears,
                    "questions", questions,
                    "sources", sources.get(),
                    "totalQuestions",
                    questions.size()
            ));

        } catch (Exception e) {

            System.err.println(
                    "INTERVIEW GENERATION ERROR"
            );

            e.printStackTrace();

            return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(Map.of(
                    "success", false,
                    "message",
                    e.getMessage() != null
                            ? e.getMessage()
                            : "Failed to generate questions"
            ));
        }
    }

    @PostMapping("/questions/stream")
    public ResponseEntity<?> generateQuestionsStream(
            @RequestBody Map<String, String> request) {
        String jobTitle = request.get("jobTitle");
        if (jobTitle == null || jobTitle.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Job title is required"
            ));
        }

        int year;
        try {
            String requestedYear = request.get("year");
            year = requestedYear == null || requestedYear.isBlank()
                    ? InterviewService.getPreviousInterviewYears().getFirst()
                    : Integer.parseInt(requestedYear);
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Year must be a valid calendar year."
            ));
        }

        List<Integer> availableYears = InterviewService.getPreviousInterviewYears();
        if (!availableYears.contains(year)) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Choose one of the three most recent completed years.",
                    "availableYears", availableYears
            ));
        }

        String company = request.get("company");
        String skills = request.get("skills");
        if (skills == null || skills.isBlank()) {
            skills = "General programming skills";
        }

        SseEmitter emitter = new SseEmitter(Duration.ofMinutes(35).toMillis());
        String finalSkills = skills;
        CompletableFuture.runAsync(() -> {
            try {
                List<Map<String, Object>> questions = interviewService.generateQuestions(
                        company,
                        jobTitle,
                        finalSkills,
                        year,
                        batch -> {
                            try {
                                emitter.send(SseEmitter.event()
                                        .name("batch")
                                        .data(Map.of("questions", batch)));
                            } catch (IOException e) {
                                throw new UncheckedIOException(
                                        "Could not send generated questions to the client.",
                                        e
                                );
                            }
                        },
                        sources -> {
                            try {
                                emitter.send(SseEmitter.event()
                                        .name("sources")
                                        .data(Map.of("sources", sources)));
                            } catch (IOException e) {
                                throw new UncheckedIOException(
                                        "Could not send research sources to the client.",
                                        e
                                );
                            }
                        }
                );
                emitter.send(SseEmitter.event()
                        .name("complete")
                        .data(Map.of("totalQuestions", questions.size())));
                emitter.complete();
            } catch (Exception e) {
                try {
                    emitter.send(SseEmitter.event()
                            .name("error")
                            .data(Map.of(
                                    "message",
                                    e.getMessage() == null
                                            ? "Failed to generate interview questions."
                                            : e.getMessage()
                            )));
                    emitter.complete();
                } catch (IOException sendError) {
                    emitter.completeWithError(sendError);
                }
            }
        });

        return ResponseEntity.ok()
                .contentType(MediaType.TEXT_EVENT_STREAM)
                .body(emitter);
    }
}