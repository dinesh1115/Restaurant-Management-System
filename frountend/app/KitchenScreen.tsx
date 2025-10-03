import React, { useEffect, useState } from "react";
import { View, Text, Button, ActivityIndicator, FlatList, Alert, StyleSheet, TouchableOpacity, RefreshControl } from "react-native";
import { API } from "../src/services/api"; // Updated import statement
import { useNavigation } from "@react-navigation/native";

interface PendingDish {
  table: string;
  order_id: string;
  dish: string;
  status: string;
}

interface GroupedOrder {
  order_id: string;
  table: string;
  customer_name: string;
  dishes: PendingDish[];
  status: string;
}

const Kitchen = () => {
  const navigation = useNavigation();
  const [pendingDishes, setPendingDishes] = useState<PendingDish[]>([]);
  const [groupedOrders, setGroupedOrders] = useState<GroupedOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  // Fetch pending dishes
  const fetchPendingDishes = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await API.getPendingDishes();
      console.log("Pending Dishes Response:", response);

      if (!Array.isArray(response)) {
        throw new Error("Invalid data format received.");
      }
      
      // Log each dish to check the order_id
      response.forEach((dish, index) => {
        console.log(`Dish ${index}:`, dish);
        if (!dish.order_id || dish.order_id === "Unknown") {
          console.warn(`Dish ${index} has invalid order_id:`, dish.order_id);
        }
      });
      
      setPendingDishes(response as PendingDish[]);
      
      // Group orders by order_id
      const grouped = groupOrdersByOrderId(response as PendingDish[]);
      console.log("Grouped orders:", grouped);
      setGroupedOrders(grouped);
      
    } catch (err: any) {
      console.error("Error fetching pending dishes:", err);
      setError(err.message || "Failed to fetch pending dishes.");
      
      // If token is invalid, redirect to login
      if (err.message.includes("Could not validate credentials") || 
          err.message.includes("token") || 
          err.message.includes("unauthorized")) {
        Alert.alert(
          "Session Expired", 
          "Your session has expired. Please log in again.",
          [{ text: "OK", onPress: () => navigation.navigate("Login" as never) }]
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Group orders by order_id
  const groupOrdersByOrderId = (dishes: PendingDish[]): GroupedOrder[] => {
    const orderMap = new Map<string, GroupedOrder>();
    
    dishes.forEach(dish => {
      if (!orderMap.has(dish.order_id)) {
        orderMap.set(dish.order_id, {
          order_id: dish.order_id,
          table: dish.table,
          customer_name: "Customer", // This would come from the backend in a real app
          dishes: [],
          status: "pending"
        });
      }
      
      const order = orderMap.get(dish.order_id)!;
      order.dishes.push(dish);
    });
    
    return Array.from(orderMap.values());
  };

  // Handle pull-to-refresh
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchPendingDishes().finally(() => setRefreshing(false));
  }, []);

  // Update order status
  const handleUpdateOrderStatus = async (orderId: string, dishName: string, newStatus: string) => {
    if (!orderId) {
      Alert.alert("Error", "Invalid order ID.");
      return;
    }

    // Log the data being sent to the API
    console.log("Updating order status:", {
      orderId,
      dishName,
      newStatus
    });

    try {
      // Get the current user's name for the cook field
      const userDetails = await API.me();
      const cookName = userDetails?.name || "Unknown Cook";
      
      console.log("Using cook name:", cookName);
      
      // Use the API.updateOrderStatus method instead of making the API call directly
      await API.updateOrderStatus(orderId, dishName, newStatus, cookName);
      
      Alert.alert("Success", `Dish "${dishName}" marked as ${newStatus}.`);
      fetchPendingDishes();
    } catch (err: any) {
      console.error("Error updating order status:", err);
      Alert.alert("Error", err.message || "Failed to update order status.");
      
      // If token is invalid, redirect to login
      if (err.message.includes("Could not validate credentials") || 
          err.message.includes("token") || 
          err.message.includes("unauthorized")) {
        Alert.alert(
          "Session Expired", 
          "Your session has expired. Please log in again.",
          [{ text: "OK", onPress: () => navigation.navigate("Login" as never) }]
        );
      }
    }
  };

  useEffect(() => {
    fetchPendingDishes();
  }, []);

  const renderOrderItem = ({ item }: { item: GroupedOrder }) => (
    <View style={styles.orderItem}>
      <View style={styles.orderHeader}>
        <View style={styles.orderIdContainer}>
          <Text style={styles.orderIdLabel}>Token #</Text>
          <Text style={styles.orderIdValue}>{item.order_id.substring(0, 8)}</Text>
        </View>
        <View style={styles.orderInfoContainer}>
          <Text style={styles.orderTable}>Table: {item.table || "Unknown"}</Text>
          <Text style={styles.customerName}>Customer: {item.customer_name}</Text>
        </View>
        <View style={styles.orderTimeContainer}>
          <Text style={styles.orderTimeLabel}>Time</Text>
          <Text style={styles.orderTimeValue}>{new Date().toLocaleTimeString()}</Text>
        </View>
      </View>
      
      <View style={styles.dishesContainer}>
        <Text style={styles.dishesTitle}>Dishes:</Text>
        {item.dishes.map((dish, index) => (
          <View key={index} style={styles.dishItem}>
            <View style={styles.dishHeader}>
              <Text style={styles.dishName}>• {dish.dish}</Text>
              <View style={[
                styles.statusBadge, 
                dish.status === "pending" ? styles.pendingBadge : 
                dish.status === "cooking" ? styles.cookingBadge : 
                styles.readyBadge
              ]}>
                <Text style={styles.statusBadgeText}>
                  {dish.status === "pending" ? "Pending" : 
                   dish.status === "cooking" ? "Cooking" : 
                   "Ready"}
                </Text>
              </View>
            </View>
            
            <TouchableOpacity 
              style={[
                styles.statusButton, 
                dish.status === "pending" ? styles.pendingButton : 
                dish.status === "cooking" ? styles.cookingButton : 
                styles.readyButton
              ]}
              onPress={() => {
                // Log the order ID and dish name for debugging
                console.log("Order ID:", item.order_id);
                console.log("Dish name:", dish.dish);
                
                // Cycle through statuses: pending -> cooking -> ready
                let newStatus;
                if (dish.status === "pending") {
                  newStatus = "cooking";
                } else if (dish.status === "cooking") {
                  newStatus = "ready";
                } else {
                  newStatus = "pending";
                }
                
                // Ensure we're passing the correct order ID
                if (item.order_id && item.order_id !== "Unknown") {
                  handleUpdateOrderStatus(item.order_id, dish.dish, newStatus);
                } else {
                  Alert.alert("Error", "Invalid order ID. Cannot update status.");
                }
              }}
            >
              <Text style={styles.statusButtonText}>
                {dish.status === "pending" ? "Start Cooking" : 
                 dish.status === "cooking" ? "Mark Ready" : 
                 "Reset to Pending"}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Kitchen Management</Text>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={fetchPendingDishes}
        >
          <Text style={styles.refreshButtonText}>Refresh</Text>
        </TouchableOpacity>
      </View>

      {loading && <ActivityIndicator size="large" color="#4CAF50" />}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <FlatList
        data={groupedOrders}
        keyExtractor={(item) => item.order_id}
        renderItem={renderOrderItem}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#4CAF50"]}
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: "#f5f5f5",
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  listContainer: {
    paddingBottom: 20,
  },
  orderItem: {
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
  orderTable: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 2,
  },
  customerName: {
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
    marginBottom: 8,
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
    marginBottom: 5,
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
    backgroundColor: "#4CAF50",
  },
  readyBadge: {
    backgroundColor: "#2196F3",
  },
  statusBadgeText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 12,
  },
  statusButton: {
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 5,
    width: "100%",
  },
  pendingButton: {
    backgroundColor: "#FFA500", // Orange for pending
  },
  cookingButton: {
    backgroundColor: "#4CAF50", // Green for cooking
  },
  readyButton: {
    backgroundColor: "#2196F3", // Blue for ready
  },
  statusButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
  errorText: {
    color: "red",
    marginBottom: 10,
    textAlign: "center",
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
});

export default Kitchen;