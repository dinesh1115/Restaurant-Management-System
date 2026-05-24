package com.restaurant.tabserv.controller;

import com.restaurant.tabserv.dto.CookDtos;
import com.restaurant.tabserv.service.CookService;
import com.restaurant.tabserv.util.SecurityUtils;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/cook")
public class CookController {

    private final CookService cookService;

    public CookController(CookService cookService) {
        this.cookService = cookService;
    }

    @GetMapping("/list_pending_dishes")
    public List<Map<String, Object>> listPendingDishes(
            @RequestParam(defaultValue = "0") int skip,
            @RequestParam(defaultValue = "10") int limit) {
        return cookService.listPendingDishes(skip, limit);
    }

    @PutMapping("/update_order_status/{orderId}")
    public Map<String, String> updateOrderStatus(
            @PathVariable String orderId,
            @RequestBody CookDtos.OrderStatusUpdateRequest update) {
        return cookService.updateOrderStatus(orderId, update, SecurityUtils.getCurrentUser());
    }
}
