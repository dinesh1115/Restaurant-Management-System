package com.restaurant.tabserv;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertNotNull;

class RestaurantManagementApplicationTests {

    @Test
    void applicationClassLoads() {
        assertNotNull(RestaurantManagementApplication.class);
    }
}
