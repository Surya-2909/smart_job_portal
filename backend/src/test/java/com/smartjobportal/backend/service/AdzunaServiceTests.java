package com.smartjobportal.backend.service;

import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class AdzunaServiceTests {

    @Test
    void returnsDemoJobsWhenCredentialsAreMissing() {
        AdzunaService adzunaService = new AdzunaService();
        ReflectionTestUtils.setField(adzunaService, "appId", "");
        ReflectionTestUtils.setField(adzunaService, "appKey", "");

        var jobs = adzunaService.getJobs("developer", "India");

        assertNotNull(jobs);
        assertFalse(((java.util.List<?>) jobs.get("results")).isEmpty());

        var firstResult = (java.util.Map<?, ?>) ((java.util.List<?>) jobs.get("results")).get(0);
        var company = (java.util.Map<?, ?>) firstResult.get("company");
        assertEquals("InMobi", company.get("display_name"));
    }
}
