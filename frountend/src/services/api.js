import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const HOST = "http://10.8.0.2:8000"; // Update with your backend base URL

export class API {
  static api = axios.create({
    baseURL: HOST,
    withCredentials: true,
  });

  // Helper function to get auth token
  static async getToken() {
    return AsyncStorage.getItem("auth_token");
  }

  // Helper function to check if token is expired
  static isTokenExpired(token) {
    if (!token) return true;
    
    try {
      // JWT tokens are in format: header.payload.signature
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationTime = payload.exp * 1000; // Convert to milliseconds
      return Date.now() >= expirationTime;
    } catch (error) {
      console.error("Error checking token expiration:", error);
      return true; // If we can't parse the token, assume it's expired
    }
  }

  // Helper function to refresh token
  static async refreshToken() {
    try {
      // Get stored credentials
      const username = await AsyncStorage.getItem("username");
      const password = await AsyncStorage.getItem("password");
      
      if (!username || !password) {
        throw new Error("No stored credentials found");
      }
      
      // Login again to get a new token
      const response = await this.loginUser({ username, password });
      return response.access_token;
    } catch (error) {
      console.error("Error refreshing token:", error);
      throw new Error("Failed to refresh token");
    }
  }

  static async loginUser(body) {
    try {
        const response = await this.api.post('/user/login', body);
        if (response.data.access_token) {
            await AsyncStorage.setItem("auth_token", response.data.access_token);
            // Store credentials for token refresh
            await AsyncStorage.setItem("username", body.username);
            await AsyncStorage.setItem("password", body.password);
        }
        return response.data;
    } catch (error) {
        console.log("Login API Error:", error.response?.data || error.message);
        throw new Error(error.response?.data?.message || "Login failed. Please check your credentials.");
    }
  }
  
  // Fetch current user details
  static async me() {
    try {
        const token = await this.getToken();
        if (!token) {
            throw new Error("No token found. Please log in.");
        }

        // Check if token is expired
        if (this.isTokenExpired(token)) {
            console.log("Token expired, refreshing...");
            const newToken = await this.refreshToken();
            if (!newToken) {
                throw new Error("Failed to refresh token");
            }
            // Use the new token
            const response = await this.api.get('/user/me', {
                headers: { Authorization: `Bearer ${newToken}` }
            });
            return response.data;
        }

        const response = await this.api.get('/user/me', {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.log("Get Current User API Error:", error.response?.data || error.message);
        throw error.response ? error.response.data : error.message;
    }
  }
  
  // Register User
  static async registerUser(body) {
      try {
        const token = await this.getToken();
        const response = await this.api.post('/user/register', body, {
          headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
      } catch (error) {
        console.log("Register User API Error:", error.response?.data || error.message);
        throw error.response?.data || "Registration failed";
      }
    }
  
    // Update User
  static async updateUser(username, password) {
      try {
        const token = await this.getToken();
        const response = await this.api.put(`/user/update/${username}`, { password }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
      } catch (error) {
        console.log("Update User API Error:", error.response?.data || error.message);
        throw error.response?.data || "Update failed";
      }
    }
  
    // Delete User
  static async deleteUser(username) {
      try {
        const token = await this.getToken();
        const response = await this.api.delete(`/user/delete/${username}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
      } catch (error) {
        console.log("Delete User API Error:", error.response?.data || error.message);
        throw error.response?.data || "Delete failed";
      }
    }
  
    // List Users
  static async listUsers() {
      try {
        const token = await this.getToken();
        const response = await this.api.get('/user/list', {
          headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
      } catch (error) {
        console.log("List Users API Error:", error.response?.data || error.message);
        throw error.response?.data || "Failed to fetch users list";
      }
    }

  // Fetch pending dishes
  static async getPendingDishes() {
    try {
      let token = await this.getToken();
      console.log("Auth Token:", token); // Debug token
      
      // Check if token is expired
      if (this.isTokenExpired(token)) {
        console.log("Token expired, refreshing...");
        token = await this.refreshToken();
        if (!token) {
          throw new Error("Failed to refresh token");
        }
      }

      console.log("Making API request to /cook/list_pending_dishes");
      const response = await this.api.get("/cook/list_pending_dishes", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("API Response:", response.data); // Log the full response

      if (!Array.isArray(response.data)) {
        console.error("Unexpected response format:", response.data);
        throw new Error("Invalid API response format.");
      }

      console.log("Number of pending dishes:", response.data.length);
      return response.data;
    } catch (error) {
      console.error("Error fetching pending dishes:", error.response?.data || error.message);
      throw new Error(error.response?.data?.detail || "Failed to fetch pending dishes.");
    }
  }

  // Update order status
  static async updateOrderStatus(orderId, dishName, newStatus, cookName) {
    try {
      let token = await this.getToken();
      
      // Check if token is expired
      if (this.isTokenExpired(token)) {
        console.log("Token expired, refreshing...");
        token = await this.refreshToken();
        if (!token) {
          throw new Error("Failed to refresh token");
        }
      }

      // Log the data being sent to the backend
      console.log("Updating order status with data:", {
        orderId,
        dishName,
        newStatus,
        cookName
      });

      // Make sure orderId is not undefined or "Unknown"
      if (!orderId || orderId === "Unknown") {
        throw new Error("Invalid order ID provided");
      }

      // Make sure dishName is not undefined or empty
      if (!dishName || dishName.trim() === "") {
        throw new Error("Invalid dish name provided");
      }

      const payload = {
        status: newStatus,
        cook: cookName,
        dish: dishName,
        updated_at: new Date().toISOString()
      };

      console.log("Sending payload to backend:", payload);
      console.log("API URL:", `${this.api.defaults.baseURL}/cook/update_order_status/${orderId}`);

      // Use axios directly to ensure the request is sent correctly
      const response = await axios.put(
        `${this.api.defaults.baseURL}/cook/update_order_status/${orderId}`,
        payload,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        }
      );

      console.log("Backend response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error updating order status:", error);
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
      }
      throw new Error(error.response?.data?.detail || "Failed to update order status.");
    }
  }

  // Place a new order
  static async placeOrder(cart, customerName, phoneNumber) {
    try {
      let token = await this.getToken();
      
      // Check if token is expired
      if (this.isTokenExpired(token)) {
        console.log("Token expired, refreshing...");
        token = await this.refreshToken();
        if (!token) {
          throw new Error("Failed to refresh token");
        }
      }

      // Transform cart items into the format expected by the backend
      const orderItems = cart.map(item => ({
        item_id: item.id,
        type: item.type,
        item: item.name,
        quantity: item.quantity,
        cost: item.price,
        status: "pending",
        addedby: "customer",
        date: new Date().toISOString(),
        takeaway: false
      }));

      // Calculate total amount
      const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      // Create order object
      const orderData = {
        customer_name: customerName,
        phone_number: phoneNumber,
        orders: orderItems,
        order_date_time: new Date().toISOString(),
        order_status: "ordered",
        dine_in_takeaway: "dine-in",
        bill_amount: totalAmount,
        payment_status: "unpaid"
      };

      console.log("Placing order with data:", orderData);

      const response = await this.api.post("/order/create", orderData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.data || !response.data.order) {
        throw new Error("Invalid response format from server");
      }

      return response.data.order;
    } catch (error) {
      console.error("Error placing order:", error.response?.data || error.message);
      throw new Error(error.response?.data?.detail || "Failed to place order.");
    }
  }

  static async getCustomerOrders() {
    try {
      const token = await this.getToken();
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await this.api.get("/order/customer/orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Customer Orders API Response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching customer orders:", error);
      if (error.response?.status === 401) {
        await this.refreshToken();
        return this.getCustomerOrders();
      }
      throw error;
    }
  }
}

// Export a default instance of the API class
export default API;