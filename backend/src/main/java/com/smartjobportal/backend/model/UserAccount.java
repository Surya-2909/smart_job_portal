package com.smartjobportal.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;

@Document(collection = "users")
public class UserAccount {

    @Id
    private String id;

    @Indexed(unique = true)
    private String username;

    private LocalDate dateOfBirth;

    private String passwordHash;

    private String fullName;

    private String email;

    private String phone;

    private String location;

    private String headline;

    private String skills;

    private String experience;

    private String education;

    protected UserAccount() {
    }

    public UserAccount(String username, LocalDate dateOfBirth, String passwordHash) {
        this.username = username;
        this.dateOfBirth = dateOfBirth;
        this.passwordHash = passwordHash;
    }

    public String getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public LocalDate getDateOfBirth() {
        return dateOfBirth;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public String getFullName() {
        return fullName;
    }

    public String getEmail() {
        return email;
    }

    public String getPhone() {
        return phone;
    }

    public String getLocation() {
        return location;
    }

    public String getHeadline() {
        return headline;
    }

    public String getSkills() {
        return skills;
    }

    public String getExperience() {
        return experience;
    }

    public String getEducation() {
        return education;
    }

    public void updateProfile(
            String fullName,
            String email,
            String phone,
            String location,
            String headline,
            String skills,
            String experience,
            String education
    ) {
        this.fullName = fullName;
        this.email = email;
        this.phone = phone;
        this.location = location;
        this.headline = headline;
        this.skills = skills;
        this.experience = experience;
        this.education = education;
    }
}
