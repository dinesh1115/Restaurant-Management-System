import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API } from './src/services/api';

const HOST = "http://10.8.0.2:8000"; // Update with your backend base URL

// Create axios instance
const api = axios.create({
  baseURL: HOST,
  withCredentials: true,
});

// Test function to update order status
const testUpdateOrderStatus = async () => {
  try {
    // First, get pending dishes to find a valid order ID and dish name
    console.log("Fetching pending dishes...");
    const pendingDishes = await API.getPendingDishes();
    console.log("Pending dishes:", pendingDishes);
    
    if (pendingDishes.length === 0) {
      console.log("No pending dishes found. Please place an order first.");
      return;
    }
    
    // Get the first pending dish
    const firstDish = pendingDishes[0];
    const orderId = firstDish.order_id;
    const dishName = firstDish.dish;
    
    console.log("Using order ID:", orderId);
    console.log("Using dish name:", dishName);
    
    // Get user details for the cook name
    const userDetails = await API.me();
    const cookName = userDetails?.name || "Test Cook";
    
    console.log("Using cook name:", cookName);
    
    // Create the payload
    const payload = {
      status: "cooking",
      cook: cookName,
      dish: dishName,
      updated_at: new Date().toISOString()
    };
    
    console.log("Sending payload:", payload);
    
    // Get the token
    const token = await API.getToken();
    console.log("Token:", token);
    
    // Make the API call
    const response = await axios.put(
      `${API.api.defaults.baseURL}/cook/update_order_status/${orderId}`,
      payload,
      {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      }
    );
    
    console.log("Backend response:", response.data);
    console.log("Order status updated successfully!");
  } catch (error) {
    console.error("Error updating order status:", error);
    if (error.response) {
      console.error("Error response data:", error.response.data);
      console.error("Error response status:", error.response.status);
    }
  }
};

// Run the test
testUpdateOrderStatus();

// Export the test function
export default testUpdateOrderStatus; 