package com.restaurant.tabserv.service;

import com.restaurant.tabserv.dto.UserDtos;
import com.restaurant.tabserv.exception.ApiException;
import com.restaurant.tabserv.model.UserDocument;
import com.restaurant.tabserv.repository.UserRepository;
import com.restaurant.tabserv.security.AuthenticatedUser;
import com.restaurant.tabserv.security.JwtTokenProvider;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public UserService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtTokenProvider jwtTokenProvider) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    public Map<String, String> register(UserDtos.UserCreateRequest request) {
        if (userRepository.existsByUsername(request.username())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Username already exists");
        }

        UserDocument user = new UserDocument();
        user.setName(request.name());
        user.setUsername(request.username());
        user.setHashedPassword(passwordEncoder.encode(request.password()));
        user.setPrivilege(request.privilege());
        user.setUserType(request.privilege());
        user.setTable(request.table());
        user.setDateCreated(Instant.now());
        user.setEnable(true);
        userRepository.save(user);

        return Map.of("message", "User " + request.username() + " created successfully");
    }

    public UserDtos.TokenResponse login(UserDtos.UserLoginRequest request) {
        UserDocument user = userRepository.findByUsername(request.username())
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));

        if (!passwordEncoder.matches(request.password(), user.getHashedPassword())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }

        if (Boolean.FALSE.equals(user.getEnable())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "User account is disabled");
        }

        String token = jwtTokenProvider.createAccessToken(user.getUsername(), user.getPrivilege());
        Instant now = Instant.now();
        user.setDateLastLogin(now);
        user.setTokenExpiry(now.plusSeconds(jwtTokenProvider.getAccessTokenExpireMinutes() * 60L));
        userRepository.save(user);

        return UserDtos.TokenResponse.bearer(token);
    }

    public UserDtos.UserResponse toResponse(AuthenticatedUser user) {
        return new UserDtos.UserResponse(user.getName(), user.getUsername(), user.getPrivilege(), user.getTable());
    }

    public List<UserDtos.UserResponse> listUsers() {
        return userRepository.findAll().stream()
                .map(u -> new UserDtos.UserResponse(u.getName(), u.getUsername(), u.getPrivilege(), u.getTable()))
                .toList();
    }

    public Map<String, String> deleteUser(String username) {
        UserDocument user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
        userRepository.delete(user);
        return Map.of("message", "User deleted successfully");
    }

    public Map<String, String> updateUser(String username, Map<String, Object> updates, AuthenticatedUser currentUser) {
        UserDocument user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));

        if (!"admin".equalsIgnoreCase(currentUser.getPrivilege())
                && !currentUser.getUsername().equals(username)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Permission denied");
        }

        if (updates.containsKey("name")) {
            user.setName(String.valueOf(updates.get("name")));
        }
        if (updates.containsKey("privilege")) {
            String privilege = String.valueOf(updates.get("privilege"));
            user.setPrivilege(privilege);
            user.setUserType(privilege);
        }
        if (updates.containsKey("table")) {
            user.setTable(String.valueOf(updates.get("table")));
        }
        if (updates.containsKey("password")) {
            user.setHashedPassword(passwordEncoder.encode(String.valueOf(updates.get("password"))));
        }

        userRepository.save(user);
        return Map.of("message", "User updated successfully");
    }
}
