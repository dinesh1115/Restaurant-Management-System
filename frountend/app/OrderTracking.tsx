import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity } from "react-native";
import { API } from "../src/services/api";
import { useNavigation } from "@react-navigation/native";

interface Order {
  order_id: string;
  table: string;
  customer_name: string;
  dishes: {
    dish: string;
    status: string;
  }[];
  order_status: string;
  order_date_time: string;
}

const OrderTracking = () => {
  const navigation = useNavigation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await API.getCustomerOrders();
      console.log("Customer Orders Response:", response);
      
      if (!Array.isArray(response)) {
        throw new Error("Invalid data format received");
      }
      
      setOrders(response as Order[]);
    } catch (err: any) {
      console.error("Error fetching orders:", err);
      setError(err.message || "Failed to fetch orders");
      
      if (err.message.includes("Could not validate credentials") || 
          err.message.includes("token") || 
          err.message.includes("unauthorized")) {
        navigation.navigate("Login" as never);
      }
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchOrders().finally(() => setRefreshing(false));
  }, []);

  useEffect(() => {
    fetchOrders();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "#FFA500";
      case "cooking":
        return "#FFA500";
      case "ready":
        return "#4CAF50";
      case "completed":
        return "#2196F3";
      default:
        return "#666";
    }
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return styles.pendingBadge;
      case "cooking":
        return styles.cookingBadge;
      case "ready":
        return styles.readyBadge;
      case "completed":
        return styles.completedBadge;
      default:
        return {};
    }
  };

  const renderOrderItem = ({ item }: { item: Order }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <View style={styles.orderIdContainer}>
          <Text style={styles.orderIdLabel}>Token #</Text>
          <Text style={styles.orderIdValue}>{item.order_id.substring(0, 8)}</Text>
        </View>
        <View style={styles.orderInfoContainer}>
          <Text style={styles.tableInfo}>Table: {item.table}</Text>
          <Text style={styles.customerInfo}>Customer: {item.customer_name}</Text>
        </View>
        <View style={styles.orderTimeContainer}>
          <Text style={styles.orderTimeLabel}>Time</Text>
          <Text style={styles.orderTimeValue}>
            {new Date(item.order_date_time).toLocaleTimeString()}
          </Text>
        </View>
      </View>

      <View style={styles.dishesContainer}>
        <Text style={styles.dishesTitle}>Ordered Items:</Text>
        {item.dishes.map((dish, index) => (
          <View key={index} style={styles.dishItem}>
            <View style={styles.dishHeader}>
              <Text style={styles.dishName}>• {dish.dish}</Text>
              <View style={[styles.statusBadge, getStatusBadgeStyle(dish.status)]}>
                <Text style={styles.statusBadgeText}>
                  {dish.status}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.orderStatusContainer}>
        <Text style={styles.orderStatusLabel}>Overall Status:</Text>
        <View style={[styles.statusBadge, getStatusBadgeStyle(item.order_status)]}>
          <Text style={styles.statusBadgeText}>
            {item.order_status}
          </Text>
        </View>
      </View>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Your Orders</Text>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={fetchOrders}
        >
          <Text style={styles.refreshButtonText}>Refresh</Text>
        </TouchableOpacity>
      </View>
      
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No orders found</Text>
          <TouchableOpacity 
            style={styles.menuButton}
            onPress={() => navigation.navigate("Menu" as never)}
          >
            <Text style={styles.menuButtonText}>Go to Menu</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item.order_id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#4CAF50"]}
            />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 15,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  refreshButton: {
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 8,
    minWidth: 80,
    alignItems: "center",
  },
  refreshButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  listContainer: {
    paddingBottom: 20,
  },
  orderCard: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    backgroundColor: "#fff",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  orderIdContainer: {
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    padding: 8,
    borderRadius: 8,
    minWidth: 80,
  },
  orderIdLabel: {
    fontSize: 12,
    color: "#666",
  },
  orderIdValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  orderInfoContainer: {
    flex: 1,
    marginLeft: 10,
  },
  tableInfo: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 2,
  },
  customerInfo: {
    fontSize: 14,
    color: "#666",
  },
  orderTimeContainer: {
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    padding: 8,
    borderRadius: 8,
    minWidth: 80,
  },
  orderTimeLabel: {
    fontSize: 12,
    color: "#666",
  },
  orderTimeValue: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  dishesContainer: {
    marginBottom: 10,
  },
  dishesTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  dishItem: {
    marginBottom: 12,
    padding: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#eee",
  },
  dishHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dishName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    flex: 1,
  },
  dishStatus: {
    fontSize: 14,
    color: "#666",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 10,
  },
  pendingBadge: {
    backgroundColor: "#FFA500",
  },
  cookingBadge: {
    backgroundColor: "#FFA500",
  },
  readyBadge: {
    backgroundColor: "#4CAF50",
  },
  completedBadge: {
    backgroundColor: "#2196F3",
  },
  statusBadgeText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 12,
  },
  orderStatusContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },
  orderStatusLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  orderStatus: {
    fontSize: 16,
    fontWeight: "bold",
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginTop: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 18,
    color: "#666",
    marginBottom: 20,
  },
  menuButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  menuButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default OrderTracking; 