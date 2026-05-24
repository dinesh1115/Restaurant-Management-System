package com.restaurant.tabserv.controller;

import com.restaurant.tabserv.dto.UserDtos;
import com.restaurant.tabserv.security.AuthenticatedUser;
import com.restaurant.tabserv.service.UserService;
import com.restaurant.tabserv.util.SecurityUtils;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/user")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public Map<String, String> register(@Valid @RequestBody UserDtos.UserCreateRequest request) {
        SecurityUtils.requireAdmin();
        return userService.register(request);
    }

    @PostMapping("/login")
    public UserDtos.TokenResponse login(@Valid @RequestBody UserDtos.UserLoginRequest request) {
        return userService.login(request);
    }

    @GetMapping("/me")
    public UserDtos.UserResponse me() {
        return userService.toResponse(SecurityUtils.getCurrentUser());
    }

    @GetMapping("/list")
    public List<UserDtos.UserResponse> listUsers() {
        SecurityUtils.requireAdmin();
        return userService.listUsers();
    }

    @DeleteMapping("/delete/{username}")
    public Map<String, String> deleteUser(@PathVariable String username) {
        SecurityUtils.requireAdmin();
        return userService.deleteUser(username);
    }

    @PutMapping("/update/{username}")
    public Map<String, String> updateUser(
            @PathVariable String username,
            @RequestBody Map<String, Object> updates) {
        AuthenticatedUser currentUser = SecurityUtils.getCurrentUser();
        return userService.updateUser(username, updates, currentUser);
    }
}
