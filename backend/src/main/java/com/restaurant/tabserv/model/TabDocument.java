package com.restaurant.tabserv.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

@Document(collection = "tabs")
public class TabDocument {

    @Id
    @JsonProperty("id")
    private String id;

    private String name;
    private String user;
    private Integer table;

    @Field("waiter_request")
    @JsonProperty("waiter_request")
    private boolean waiterRequest;

    @Field("waiter_text")
    @JsonProperty("waiter_text")
    private String waiterText;

    @Field("support_request")
    @JsonProperty("support_request")
    private boolean supportRequest;

    @Field("support_text")
    @JsonProperty("support_text")
    private String supportText;

    @Field("user_type")
    @JsonProperty("user_type")
    private String userType;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getUser() {
        return user;
    }

    public void setUser(String user) {
        this.user = user;
    }

    public Integer getTable() {
        return table;
    }

    public void setTable(Integer table) {
        this.table = table;
    }

    public boolean isWaiterRequest() {
        return waiterRequest;
    }

    public void setWaiterRequest(boolean waiterRequest) {
        this.waiterRequest = waiterRequest;
    }

    public String getWaiterText() {
        return waiterText;
    }

    public void setWaiterText(String waiterText) {
        this.waiterText = waiterText;
    }

    public boolean isSupportRequest() {
        return supportRequest;
    }

    public void setSupportRequest(boolean supportRequest) {
        this.supportRequest = supportRequest;
    }

    public String getSupportText() {
        return supportText;
    }

    public void setSupportText(String supportText) {
        this.supportText = supportText;
    }

    public String getUserType() {
        return userType;
    }

    public void setUserType(String userType) {
        this.userType = userType;
    }
}
