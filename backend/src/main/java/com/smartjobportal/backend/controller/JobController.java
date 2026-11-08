package com.smartjobportal.backend.controller;

import com.smartjobportal.backend.service.AdzunaService;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/jobs")
@CrossOrigin(originPatterns = {"http://localhost:[*]", "http://127.0.0.1:[*]"})
public class JobController {

    private final AdzunaService adzunaService;

    public JobController(AdzunaService adzunaService) {
        this.adzunaService = adzunaService;
    }

    @GetMapping
    public Map<String, Object> getJobs(
            @RequestParam(defaultValue = "software developer") String keyword,
            @RequestParam(defaultValue = "India") String location
    ) {

        return adzunaService.getJobs(keyword, location);
    }
}