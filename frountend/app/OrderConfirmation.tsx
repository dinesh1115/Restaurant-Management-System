import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "./types/navigation";

type OrderConfirmationRouteProp = RouteProp<RootStackParamList, "OrderConfirmation">;

const OrderConfirmation = () => {
  const route = useRoute<OrderConfirmationRouteProp>();
  const navigation = useNavigation();
  const { orderId } = route.params;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Order Confirmed!</Text>
        <Text style={styles.orderId}>Order ID: {orderId}</Text>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.button}
            onPress={() => navigation.navigate("OrderTracking" as never)}
          >
            <Text style={styles.buttonText}>Track Order</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.menuButton]}
            onPress={() => navigation.navigate("MenuScreen" as never)}
          >
            <Text style={styles.buttonText}>Back to Menu</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  orderId: {
    fontSize: 18,
    marginBottom: 30,
    color: "#666",
  },
  buttonContainer: {
    width: "100%",
    gap: 15,
  },
  button: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  menuButton: {
    backgroundColor: "#2196F3",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default OrderConfirmation;
