package com.restaurant.tabserv.controller;

import com.restaurant.tabserv.model.MenuItemDocument;
import com.restaurant.tabserv.service.MenuService;
import com.restaurant.tabserv.util.SecurityUtils;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/menu")
public class MenuController {

    private final MenuService menuService;

    public MenuController(MenuService menuService) {
        this.menuService = menuService;
    }

    @PostMapping(value = "/items", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public MenuItemDocument createMenuItem(
            @RequestParam String name,
            @RequestParam double price,
            @RequestParam String category,
            @RequestParam(required = false) String description,
            @RequestParam(defaultValue = "true") String is_available,
            @RequestParam(required = false) MultipartFile image) throws IOException {

        SecurityUtils.requireAdmin();
        boolean available = "true".equalsIgnoreCase(is_available);
        return menuService.createItem(name, price, category, description, available, image);
    }

    @GetMapping("/items")
    public List<MenuItemDocument> getMenuItems() {
        return menuService.getAllItems();
    }

    @GetMapping("/items/{itemId}")
    public MenuItemDocument getMenuItem(@PathVariable String itemId) {
        return menuService.getItem(itemId);
    }

    @PutMapping("/items/{itemId}")
    public MenuItemDocument updateMenuItem(@PathVariable String itemId, @RequestBody MenuItemDocument item) {
        SecurityUtils.requireAdmin();
        return menuService.updateItem(itemId, item);
    }

    @DeleteMapping("/items/{itemId}")
    public Map<String, String> deleteMenuItem(@PathVariable String itemId) {
        SecurityUtils.requireAdmin();
        return menuService.deleteItem(itemId);
    }

    @GetMapping("/categories")
    public List<Map<String, Object>> getCategories() {
        return menuService.getCategories();
    }
}
