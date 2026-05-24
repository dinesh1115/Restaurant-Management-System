package com.restaurant.tabserv.repository;

import com.restaurant.tabserv.model.UserDocument;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface UserRepository extends MongoRepository<UserDocument, String> {

    Optional<UserDocument> findByUsername(String username);

    boolean existsByUsername(String username);

    void deleteByUsername(String username);
}
