package com.restaurant.tabserv.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;

public final class UserDtos {

    private UserDtos() {
    }

    public record UserCreateRequest(
            @NotBlank String name,
            @NotBlank String username,
            @NotBlank String password,
            @NotBlank String privilege,
            String table
    ) {
    }

    public record UserLoginRequest(
            @NotBlank String username,
            @NotBlank String password
    ) {
    }

    public record TokenResponse(
            @JsonProperty("access_token") String accessToken,
            @JsonProperty("token_type") String tokenType
    ) {
        public static TokenResponse bearer(String accessToken) {
            return new TokenResponse(accessToken, "bearer");
        }
    }

    public record UserResponse(
            String name,
            String username,
            String privilege,
            String table
    ) {
    }
}
