package com.restaurant.tabserv.service;

import com.restaurant.tabserv.exception.ApiException;
import com.restaurant.tabserv.model.OrderDocument;
import com.restaurant.tabserv.model.OrderItemDocument;
import com.restaurant.tabserv.repository.OrderRepository;
import com.restaurant.tabserv.security.AuthenticatedUser;
import org.bson.types.ObjectId;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private final OrderRepository orderRepository;

    public OrderService(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    public Map<String, Object> createOrder(OrderDocument order, AuthenticatedUser user) {
        OrderDocument.OrderByInfo orderBy = new OrderDocument.OrderByInfo();
        orderBy.setUsername(user.getUsername());
        orderBy.setRole(user.getUserType());
        order.setOrderBy(orderBy);
        order.setUserName(user.getUsername());

        OrderDocument saved = orderRepository.save(order);
        Map<String, Object> response = new HashMap<>();
        response.put("order", toOrderMap(saved));
        return response;
    }

    public Map<String, Object> getOrderStatus(String orderId) {
        validateObjectId(orderId);
        OrderDocument order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Order not found."));
        return Map.of("order", toOrderMap(order));
    }

    public Map<String, String> updateOrder(String orderId, OrderDocument updated) {
        validateObjectId(orderId);
        if (!orderRepository.existsById(orderId)) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Order not found with ID: " + orderId);
        }
        updated.setId(orderId);
        orderRepository.save(updated);
        return Map.of("message", "Order updated successfully.");
    }

    public Map<String, String> cancelOrder(String orderId) {
        validateObjectId(orderId);
        OrderDocument order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Order not found."));

        if (!"ordered".equals(order.getOrderStatus())) {
            throw new ApiException(HttpStatus.BAD_REQUEST,
                    "Order cannot be cancelled as it is not in 'ordered' status.");
        }

        order.setOrderStatus("cancelled");
        orderRepository.save(order);
        return Map.of("message", "Order cancelled successfully.");
    }

    public Map<String, String> makeTakeaway(String orderId) {
        validateObjectId(orderId);
        OrderDocument order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Order not found."));

        if (!"dine-in".equals(order.getDineInTakeaway())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Only dine-in orders can be converted to takeaway.");
        }

        order.setDineInTakeaway("takeaway");
        orderRepository.save(order);
        return Map.of("message", "Order converted to takeaway successfully.");
    }

    public Map<String, Object> getAllOrders(AuthenticatedUser user) {
        List<Map<String, Object>> orders = orderRepository.findByOrderBy_Username(user.getUsername()).stream()
                .map(this::toOrderMap)
                .collect(Collectors.toList());
        return Map.of("orders", orders);
    }

    public List<Map<String, Object>> getCustomerOrders(AuthenticatedUser user) {
        return orderRepository.findOrdersForCustomer(user.getUsername(), user.getName()).stream()
                .map(order -> {
                    Map<String, Object> formatted = new HashMap<>();
                    formatted.put("order_id", order.getId());
                    formatted.put("table", order.getTable() != null ? order.getTable() : "Unknown");
                    formatted.put("customer_name", order.getCustomerName() != null ? order.getCustomerName() : "Unknown");
                    formatted.put("order_status", order.getOrderStatus() != null ? order.getOrderStatus() : "Unknown");
                    formatted.put("order_date_time",
                            order.getOrderDateTime() != null ? order.getOrderDateTime().toString() : Instant.now().toString());

                    List<Map<String, String>> dishes = new ArrayList<>();
                    if (order.getOrders() != null) {
                        for (OrderItemDocument item : order.getOrders()) {
                            Map<String, String> dish = new HashMap<>();
                            dish.put("dish", item.getItem() != null ? item.getItem() : "Unknown");
                            dish.put("status", item.getStatus() != null ? item.getStatus() : "Unknown");
                            dishes.add(dish);
                        }
                    }
                    formatted.put("dishes", dishes);
                    return formatted;
                })
                .toList();
    }

    public List<OrderDocument> findPendingOrders(int skip, int limit) {
        int page = limit > 0 ? skip / limit : 0;
        return orderRepository.findOrdersWithPendingItems(PageRequest.of(page, Math.max(limit, 1)));
    }

    public void updateDishStatus(String orderId, String dishName, String status, String cook, Instant updatedAt) {
        validateObjectId(orderId);
        OrderDocument order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Order not found."));

        boolean updated = false;
        for (OrderItemDocument item : order.getOrders()) {
            boolean statusMatch = "pending".equals(item.getStatus()) || "cooking".equals(item.getStatus());
            boolean dishMatch = dishName == null || dishName.isBlank()
                    || dishName.equals(item.getItem());
            if (statusMatch && dishMatch) {
                item.setStatus(status);
                item.setCook(cook);
                item.setUpdatedAt(updatedAt != null ? updatedAt : Instant.now());
                updated = true;
                if (dishName != null && !dishName.isBlank()) {
                    break;
                }
            }
        }

        if (!updated) {
            throw new ApiException(HttpStatus.BAD_REQUEST,
                    "No matching orders to update. Order must be in 'pending' or 'cooking' state.");
        }

        orderRepository.save(order);
    }

    private void validateObjectId(String id) {
        if (!ObjectId.isValid(id)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid order ID format.");
        }
    }

    private Map<String, Object> toOrderMap(OrderDocument order) {
        Map<String, Object> map = new HashMap<>();
        map.put("_id", order.getId());
        map.put("table", order.getTable());
        map.put("customer_name", order.getCustomerName());
        map.put("phone_number", order.getPhoneNumber());
        map.put("orders", order.getOrders());
        map.put("order_date_time", order.getOrderDateTime());
        map.put("order_status", order.getOrderStatus());
        map.put("dine_in_takeaway", order.getDineInTakeaway());
        map.put("bill_amount", order.getBillAmount());
        map.put("payment_status", order.getPaymentStatus());
        map.put("payment_mode", order.getPaymentMode());
        map.put("order_by", order.getOrderBy());
        map.put("user_name", order.getUserName());
        return map;
    }
}
