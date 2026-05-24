package com.restaurant.tabserv.service;

import com.restaurant.tabserv.dto.CookDtos;
import com.restaurant.tabserv.exception.ApiException;
import com.restaurant.tabserv.model.OrderDocument;
import com.restaurant.tabserv.model.OrderItemDocument;
import com.restaurant.tabserv.security.AuthenticatedUser;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class CookService {

    private final OrderService orderService;

    public CookService(OrderService orderService) {
        this.orderService = orderService;
    }

    public List<Map<String, Object>> listPendingDishes(int skip, int limit) {
        List<OrderDocument> pendingOrders = orderService.findPendingOrders(skip, limit);
        List<Map<String, Object>> result = new ArrayList<>();

        for (OrderDocument order : pendingOrders) {
            List<Map<String, Object>> pendingItems = new ArrayList<>();
            if (order.getOrders() != null) {
                for (OrderItemDocument item : order.getOrders()) {
                    if ("pending".equals(item.getStatus()) || "cooking".equals(item.getStatus())) {
                        pendingItems.add(itemToMap(item));
                    }
                }
            }

            if (pendingItems.isEmpty()) {
                continue;
            }

            Map<String, Object> transformed = new HashMap<>();
            transformed.put("_id", order.getId());
            transformed.put("table", order.getTable());
            transformed.put("customer_name", order.getCustomerName() != null ? order.getCustomerName() : "");
            transformed.put("phone_number", order.getPhoneNumber() != null ? order.getPhoneNumber() : "");
            transformed.put("orders", pendingItems);
            transformed.put("order_date_time", order.getOrderDateTime());
            transformed.put("order_status", order.getOrderStatus() != null ? order.getOrderStatus() : "pending");
            transformed.put("dine_in_takeaway", order.getDineInTakeaway() != null ? order.getDineInTakeaway() : "");
            transformed.put("bill_amount", order.getBillAmount());
            transformed.put("payment_status", order.getPaymentStatus() != null ? order.getPaymentStatus() : "");
            transformed.put("payment_mode", order.getPaymentMode());

            Map<String, String> orderBy = new HashMap<>();
            if (order.getOrderBy() != null) {
                orderBy.put("username", order.getOrderBy().getUsername() != null ? order.getOrderBy().getUsername() : "");
                orderBy.put("role", order.getOrderBy().getRole() != null ? order.getOrderBy().getRole() : "");
            }
            transformed.put("order_by", orderBy);
            transformed.put("user_name", order.getUserName());
            result.add(transformed);
        }

        return result;
    }

    public Map<String, String> updateOrderStatus(
            String orderId,
            CookDtos.OrderStatusUpdateRequest update,
            AuthenticatedUser user) {

        if (!"Cook".equals(user.getUserType())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Only cooks can update orders.");
        }

        List<String> validStatuses = List.of("pending", "cooking", "ready");
        if (!validStatuses.contains(update.status())) {
            throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY,
                    "Invalid status. Must be one of: pending, cooking, ready");
        }

        orderService.updateDishStatus(
                orderId,
                update.dish(),
                update.status(),
                update.cook(),
                update.updatedAt() != null ? update.updatedAt() : Instant.now()
        );

        return Map.of("message", "Order updated successfully");
    }

    private Map<String, Object> itemToMap(OrderItemDocument item) {
        Map<String, Object> map = new HashMap<>();
        map.put("item_id", item.getItemId());
        map.put("type", item.getType());
        map.put("item", item.getItem());
        map.put("quantity", item.getQuantity());
        map.put("cost", item.getCost());
        map.put("status", item.getStatus());
        map.put("cook", item.getCook());
        map.put("instructions", item.getInstructions());
        map.put("addedby", item.getAddedby());
        map.put("date", item.getDate());
        map.put("takeaway", item.isTakeaway());
        return map;
    }
}
