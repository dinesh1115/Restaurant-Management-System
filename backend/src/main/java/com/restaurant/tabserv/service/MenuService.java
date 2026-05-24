package com.restaurant.tabserv.service;

import com.restaurant.tabserv.exception.ApiException;
import com.restaurant.tabserv.model.MenuItemDocument;
import com.restaurant.tabserv.repository.MenuRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class MenuService {

    private final MenuRepository menuRepository;
    private final Path uploadDir;

    public MenuService(
            MenuRepository menuRepository,
            @Value("${app.upload.menu-images-dir}") String uploadDirPath) throws IOException {
        this.menuRepository = menuRepository;
        this.uploadDir = Paths.get(uploadDirPath).toAbsolutePath().normalize();
        Files.createDirectories(this.uploadDir);
    }

    public MenuItemDocument createItem(
            String name,
            double price,
            String category,
            String description,
            boolean isAvailable,
            MultipartFile image) throws IOException {

        MenuItemDocument item = new MenuItemDocument();
        item.setName(name);
        item.setPrice(price);
        item.setCategory(category);
        item.setDescription(description != null ? description : "");
        item.setAvailable(isAvailable);
        item.setDateCreated(Instant.now());

        if (image != null && !image.isEmpty()) {
            String extension = getExtension(image.getOriginalFilename());
            String filename = System.currentTimeMillis() + "." + extension;
            Path target = uploadDir.resolve(filename);
            Files.copy(image.getInputStream(), target);
            item.setImageUrl("/uploads/menu_images/" + filename);
        }

        MenuItemDocument saved = menuRepository.save(item);
        saved.setId(saved.getId());
        return saved;
    }

    public List<MenuItemDocument> getAllItems() {
        return menuRepository.findAll().stream()
                .peek(item -> item.setId(item.getId()))
                .toList();
    }

    public MenuItemDocument getItem(String itemId) {
        return menuRepository.findById(itemId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Menu item not found"));
    }

    public MenuItemDocument updateItem(String itemId, MenuItemDocument update) {
        MenuItemDocument existing = menuRepository.findById(itemId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Menu item not found"));

        existing.setName(update.getName());
        existing.setPrice(update.getPrice());
        existing.setCategory(update.getCategory());
        existing.setDescription(update.getDescription());
        existing.setAvailable(update.isAvailable());
        existing.setDateUpdated(Instant.now());

        return menuRepository.save(existing);
    }

    public Map<String, String> deleteItem(String itemId) {
        if (!menuRepository.existsById(itemId)) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Menu item not found");
        }
        menuRepository.deleteById(itemId);
        return Map.of("status", "success", "message", "Menu item deleted successfully");
    }

    public List<Map<String, Object>> getCategories() {
        Map<String, List<MenuItemDocument>> categories = new HashMap<>();
        for (MenuItemDocument item : menuRepository.findAll()) {
            categories.computeIfAbsent(item.getCategory(), k -> new ArrayList<>()).add(item);
        }

        List<Map<String, Object>> result = new ArrayList<>();
        for (Map.Entry<String, List<MenuItemDocument>> entry : categories.entrySet()) {
            Map<String, Object> category = new HashMap<>();
            category.put("name", entry.getKey());
            category.put("items", entry.getValue());
            result.add(category);
        }
        return result;
    }

    private String getExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "jpg";
        }
        return filename.substring(filename.lastIndexOf('.') + 1);
    }
}
