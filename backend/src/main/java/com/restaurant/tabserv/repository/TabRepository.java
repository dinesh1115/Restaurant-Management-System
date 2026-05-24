package com.restaurant.tabserv.repository;

import com.restaurant.tabserv.model.TabDocument;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface TabRepository extends MongoRepository<TabDocument, String> {

    Optional<TabDocument> findByName(String name);

    boolean existsByName(String name);

    void deleteByName(String name);
}
