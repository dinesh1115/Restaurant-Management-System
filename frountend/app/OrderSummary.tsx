import React, { useState } from "react";
import { View, Text, TextInput, ActivityIndicator, StyleSheet, TouchableOpacity } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { API } from "../src/services/api"; // Updated import statement
import { RootStackParamList } from "./types/navigation"; 

type OrderSummaryProps = NativeStackScreenProps<RootStackParamList, "OrderSummary">;

const OrderSummary: React.FC<OrderSummaryProps> = ({ route, navigation }) => {
  const { updatedCart } = route.params;
  const [loading, setLoading] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const totalAmount = updatedCart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handlePlaceOrder = async () => {
    if (updatedCart.length === 0) {
      alert("No items in the cart");
      return;
    }
    if (!customerName.trim() || !phoneNumber.trim()) {
      alert("Please enter customer name and phone number.");
      return;
    }
    if (!/^\d{10}$/.test(phoneNumber)) {
      alert("Please enter a valid 10-digit phone number.");
      return;
    }

    setLoading(true);
    try {
      console.log("Placing order...");
      const response = await API.placeOrder(updatedCart, customerName, phoneNumber);
      console.log("Response:", response);

      if (response && typeof response === "object" && response._id) {
        console.log("Order ID:", response._id);
        navigation.navigate("OrderConfirmation", { orderId: response._id });
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Order Error:", error)
      alert("Order failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Order Summary</Text>

      {/* Customer Info Card */}
      <View style={styles.customerInfoCard}>
        <Text style={styles.cardTitle}>Customer Details</Text>

        <Text style={styles.inputLabel}>Customer Name</Text>
        <TextInput
          style={styles.inputField}
          placeholder="Enter Customer Name"
          value={customerName}
          onChangeText={setCustomerName}
        />

        <Text style={styles.inputLabel}>Phone Number</Text>
        <TextInput
          style={styles.inputField}
          placeholder="Enter Phone Number"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
          maxLength={10}
        />
      </View>

      {/* Order Items */}
      {updatedCart.length === 0 ? (
        <Text style={styles.emptyText}>No items in your order.</Text>
      ) : (
        updatedCart.map((item) => (
          <View key={item.id} style={styles.itemContainer}>
            <Text style={styles.itemName}>
              {item.name} <Text style={styles.itemCategory}>({item.type})</Text>
            </Text>
            <Text style={styles.itemDetails}>
              <Text style={styles.boldText}>{item.quantity}</Text> x ₹
              <Text style={styles.boldText}>{item.price}</Text> = ₹
              <Text style={styles.boldText}>{item.quantity * item.price}</Text>
            </Text>
          </View>
        ))
      )}

      <Text style={styles.totalAmount}>
        Total: ₹<Text style={styles.boldText}>{totalAmount}</Text>
      </Text>

      {loading ? (
        <ActivityIndicator size="large" color="#d9534f" style={{ marginTop: 20 }} />
      ) : (
        <TouchableOpacity style={styles.placeOrderButton} onPress={handlePlaceOrder}>
          <Text style={styles.placeOrderText}>Confirm Order</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#ffe371",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  customerInfoCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#555",
    marginTop: 5,
  },
  inputField: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginTop: 5,
    backgroundColor: "#f9f9f9",
  },
  itemContainer: {
    flexDirection: "column",
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: "#fff",
    marginBottom: 10,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  itemCategory: {
    fontSize: 14,
    fontStyle: "italic",
    color: "#777",
  },
  itemDetails: {
    fontSize: 14,
    color: "#555",
    marginTop: 5,
  },
  boldText: {
    fontWeight: "bold",
    color: "#000",
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginVertical: 20,
  },
  placeOrderButton: {
    backgroundColor: "#d9534f",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  placeOrderText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  emptyText: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginTop: 20,
  },
});

export default OrderSummary;
