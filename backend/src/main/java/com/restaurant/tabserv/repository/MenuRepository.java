package com.restaurant.tabserv.repository;

import com.restaurant.tabserv.model.MenuItemDocument;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface MenuRepository extends MongoRepository<MenuItemDocument, String> {
}
