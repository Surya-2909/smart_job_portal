package com.smartjobportal.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.util.UriComponentsBuilder;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

@Service
public class AdzunaService {

    @Value("${adzuna.app-id}")
    private String appId;

    @Value("${adzuna.app-key}")
    private String appKey;

    private final RestClient restClient = RestClient.create();

    public Map<String, Object> getJobs(String keyword, String location) {
        if (appId == null || appId.isBlank() || appKey == null || appKey.isBlank()) {
            return demoJobs(keyword, location);
        }

        var uri = UriComponentsBuilder
                .fromUriString("https://api.adzuna.com/v1/api/jobs/in/search/1")
                .queryParam("app_id", appId)
                .queryParam("app_key", appKey)
                .queryParam("results_per_page", 20)
                .queryParam("what", keyword)
                .queryParam("where", location)
                .queryParam("content-type", "application/json")
                .build()
                .encode()
                .toUri();

        return restClient
                .get()
                .uri(uri)
                .retrieve()
                .body(new ParameterizedTypeReference<Map<String, Object>>() {});
    }

    private Map<String, Object> demoJobs(String keyword, String location) {
        String searchKeyword = (keyword == null || keyword.isBlank()) ? "software developer" : keyword;
        String searchLocation = (location == null || location.isBlank()) ? "India" : location;

        return Map.of(
                "results", List.of(
                        Map.of(
                                "id", "demo-1",
                                "title", "Senior " + searchKeyword + " Engineer",
                                "description", "Build and ship scalable product experiences for a modern SaaS platform.",
                                "company", Map.of("display_name", "InMobi"),
                                "location", Map.of("display_name", searchLocation),
                                "salary_min", 1800000,
                                "salary_max", 2600000,
                                "contract_time", "Full Time",
                                "category", Map.of("label", "Engineering"),
                                "redirect_url", "https://example.com/jobs/demo-1"
                        ),
                        Map.of(
                                "id", "demo-2",
                                "title", "Full Stack Developer",
                                "description", "Work across backend services and modern frontend interfaces in a fast-moving team.",
                                "company", Map.of("display_name", "PayPal"),
                                "location", Map.of("display_name", "Bangalore"),
                                "salary_min", 1600000,
                                "salary_max", 2400000,
                                "contract_time", "Full Time",
                                "category", Map.of("label", "Software Development"),
                                "redirect_url", "https://example.com/jobs/demo-2"
                        ),
                        Map.of(
                                "id", "demo-3",
                                "title", "Java Backend Engineer",
                                "description", "Design resilient APIs, optimize performance, and support product delivery.",
                                "company", Map.of("display_name", "Infosys"),
                                "location", Map.of("display_name", "Hyderabad"),
                                "salary_min", 1400000,
                                "salary_max", 2200000,
                                "contract_time", "Full Time",
                                "category", Map.of("label", "Backend Engineering"),
                                "redirect_url", "https://example.com/jobs/demo-3"
                        )
                )
        );
    }
}