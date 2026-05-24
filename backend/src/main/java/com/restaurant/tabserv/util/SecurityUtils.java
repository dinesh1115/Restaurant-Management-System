package com.restaurant.tabserv.util;

import com.restaurant.tabserv.exception.ApiException;
import com.restaurant.tabserv.security.AuthenticatedUser;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public final class SecurityUtils {

    private SecurityUtils() {
    }

    public static AuthenticatedUser getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof AuthenticatedUser user)) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Could not validate credentials");
        }
        return user;
    }

    public static AuthenticatedUser requireAdmin() {
        AuthenticatedUser user = getCurrentUser();
        if (!"admin".equalsIgnoreCase(user.getPrivilege())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Admin privileges required");
        }
        return user;
    }
}
