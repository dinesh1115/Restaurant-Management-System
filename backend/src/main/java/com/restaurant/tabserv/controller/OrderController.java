package com.restaurant.tabserv.controller;

import com.restaurant.tabserv.model.OrderDocument;
import com.restaurant.tabserv.service.OrderService;
import com.restaurant.tabserv.util.SecurityUtils;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/order")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping("/create")
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> createOrder(@RequestBody OrderDocument order) {
        return orderService.createOrder(order, SecurityUtils.getCurrentUser());
    }

    @GetMapping("/status/{orderId}")
    public Map<String, Object> getOrderStatus(@PathVariable String orderId) {
        return orderService.getOrderStatus(orderId);
    }

    @PutMapping("/update/{orderId}")
    public Map<String, String> updateOrder(@PathVariable String orderId, @RequestBody OrderDocument order) {
        return orderService.updateOrder(orderId, order);
    }

    @DeleteMapping("/cancel/{orderId}")
    public Map<String, String> cancelOrder(@PathVariable String orderId) {
        return orderService.cancelOrder(orderId);
    }

    @PutMapping("/make_takeaway/{orderId}")
    public Map<String, String> makeTakeaway(@PathVariable String orderId) {
        return orderService.makeTakeaway(orderId);
    }

    @GetMapping("/all")
    public Map<String, Object> getAllOrders() {
        return orderService.getAllOrders(SecurityUtils.getCurrentUser());
    }

    @GetMapping("/customer/orders")
    public List<Map<String, Object>> getCustomerOrders() {
        return orderService.getCustomerOrders(SecurityUtils.getCurrentUser());
    }
}
