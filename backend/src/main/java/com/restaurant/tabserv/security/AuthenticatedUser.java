package com.restaurant.tabserv.security;

import com.restaurant.tabserv.model.UserDocument;

public class AuthenticatedUser {

    private final String id;
    private final String name;
    private final String username;
    private final String privilege;
    private final String userType;
    private final String table;

    public AuthenticatedUser(UserDocument user, String tokenUserType) {
        this.id = user.getId();
        this.name = user.getName();
        this.username = user.getUsername();
        this.privilege = user.getPrivilege() != null ? user.getPrivilege() : tokenUserType;
        this.userType = tokenUserType != null ? tokenUserType : user.getPrivilege();
        this.table = user.getTable();
    }

    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getUsername() {
        return username;
    }

    public String getPrivilege() {
        return privilege;
    }

    public String getUserType() {
        return userType;
    }

    public String getTable() {
        return table;
    }
}
