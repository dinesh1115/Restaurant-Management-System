package com.restaurant.tabserv.repository;

import com.restaurant.tabserv.model.OrderDocument;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.List;

public interface OrderRepository extends MongoRepository<OrderDocument, String> {

    List<OrderDocument> findByOrderBy_Username(String username);

    @Query("{ $or: [ " +
            "{ 'customer_name': ?0 }, { 'customer_name': ?1 }, { 'user_name': ?0 } " +
            "] }")
    List<OrderDocument> findOrdersForCustomer(String username, String displayName);

    @Query("{ 'orders.status' : { $in: ['pending', 'cooking'] } }")
    List<OrderDocument> findOrdersWithPendingItems(Pageable pageable);
}
