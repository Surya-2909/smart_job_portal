package com.smartjobportal.backend.repository;

import com.smartjobportal.backend.model.UserAccount;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface UserAccountRepository extends MongoRepository<UserAccount, String> {

    Optional<UserAccount> findByUsername(String username);

    boolean existsByUsername(String username);
}
