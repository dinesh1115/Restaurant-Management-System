package com.restaurant.tabserv.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.Instant;

public final class CookDtos {

    private CookDtos() {
    }

    public record OrderStatusUpdateRequest(
            String status,
            String cook,
            String dish,
            @JsonProperty("updated_at") Instant updatedAt
    ) {
    }
}
