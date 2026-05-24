package com.restaurant.tabserv.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "orders")
public class OrderDocument {

    @Id
    @JsonProperty("_id")
    private String id;

    private String table;

    @Field("customer_name")
    @JsonProperty("customer_name")
    private String customerName;

    @Field("phone_number")
    @JsonProperty("phone_number")
    private String phoneNumber;

    private List<OrderItemDocument> orders = new ArrayList<>();

    @Field("order_date_time")
    @JsonProperty("order_date_time")
    private Instant orderDateTime;

    @Field("order_status")
    @JsonProperty("order_status")
    private String orderStatus;

    @Field("dine_in_takeaway")
    @JsonProperty("dine_in_takeaway")
    private String dineInTakeaway;

    @Field("bill_amount")
    @JsonProperty("bill_amount")
    private double billAmount;

    @Field("payment_status")
    @JsonProperty("payment_status")
    private String paymentStatus;

    @Field("payment_mode")
    @JsonProperty("payment_mode")
    private String paymentMode;

    @Field("order_by")
    @JsonProperty("order_by")
    private OrderByInfo orderBy;

    @Field("user_name")
    @JsonProperty("user_name")
    private String userName;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTable() {
        return table;
    }

    public void setTable(String table) {
        this.table = table;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public List<OrderItemDocument> getOrders() {
        return orders;
    }

    public void setOrders(List<OrderItemDocument> orders) {
        this.orders = orders;
    }

    public Instant getOrderDateTime() {
        return orderDateTime;
    }

    public void setOrderDateTime(Instant orderDateTime) {
        this.orderDateTime = orderDateTime;
    }

    public String getOrderStatus() {
        return orderStatus;
    }

    public void setOrderStatus(String orderStatus) {
        this.orderStatus = orderStatus;
    }

    public String getDineInTakeaway() {
        return dineInTakeaway;
    }

    public void setDineInTakeaway(String dineInTakeaway) {
        this.dineInTakeaway = dineInTakeaway;
    }

    public double getBillAmount() {
        return billAmount;
    }

    public void setBillAmount(double billAmount) {
        this.billAmount = billAmount;
    }

    public String getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public String getPaymentMode() {
        return paymentMode;
    }

    public void setPaymentMode(String paymentMode) {
        this.paymentMode = paymentMode;
    }

    public OrderByInfo getOrderBy() {
        return orderBy;
    }

    public void setOrderBy(OrderByInfo orderBy) {
        this.orderBy = orderBy;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public static class OrderByInfo {
        private String username;
        private String role;

        public String getUsername() {
            return username;
        }

        public void setUsername(String username) {
            this.username = username;
        }

        public String getRole() {
            return role;
        }

        public void setRole(String role) {
            this.role = role;
        }
    }
}
