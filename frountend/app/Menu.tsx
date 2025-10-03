import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { Card } from "react-native-paper";
import { Image } from "react-native";
import { API } from "../src/services/api";

type RootStackParamList = {
  CartScreen: { cart: CartItem[] };
  OrderSummary: { updatedCart: CartItem[] };
};

type MenuScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, "CartScreen">;
};

interface MenuItem {
  id: string;
  type: string;
  name: string;
  price: number;
  image: any;
}

interface CartItem extends MenuItem {
  quantity: number;
}

const menuItems: MenuItem[] = [
  { id: "1", type: "Set", name: "Normal Thali", price: 129, image: require("../assets/images/thaali1.jpg") },
  { id: "2", type: "Set", name: "Veg Thali", price: 149, image: require("../assets/images/thaali2.jpg") },
  { id: "3", type: "Set", name: "Special Thali", price: 199, image: require("../assets/images/thaali3.jpg") },
  { id: "4", type: "Set", name: "Special Desi Ghee Desi Thaat", price: 289, image: require("../assets/images/thaali4.jpg") },
  { id: "5", type: "Drinks", name: "Lemon Soda", price: 90, image: require("../assets/images/lemon_soda.jpg") },
  { id: "6", type: "Drinks", name: "Virgin Mojito", price: 110, image: require("../assets/images/virgin_mojito.jpg") },
  { id: "7", type: "Drinks", name: "Cold Coffee", price: 180, image: require("../assets/images/cold_coffee.jpg") },
  { id: "8", type: "Drinks", name: "Sweet Lassi", price: 120, image: require("../assets/images/sweet_lassi.jpg") },
  { id: "9", type: "Food", name: "Paneer Butter Masala", price: 200, image: require("../assets/images/paneer.jpg") },
  { id: "10", type: "Food", name: "Butter Naan", price: 35, image: require("../assets/images/naan.jpg") },
];

const categories = ["Set", "Drinks", "Food"];

const MenuScreen: React.FC<MenuScreenProps> = ({ navigation }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("Set");
  const [orderType, setOrderType] = useState<"dine-in" | "takeaway">("dine-in");
  const [loading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);

  // Fetch user info on component mount
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        setLoading(true);
        const userData = await API.me();
        setUserInfo(userData);
        console.log("User info loaded:", userData);
      } catch (error) {
        console.error("Error fetching user info:", error);
        Alert.alert("Error", "Failed to load user information. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  const updateCart = (item: MenuItem, action: "increase" | "decrease") => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.id === item.id);
      if (existingItem) {
        if (action === "increase") {
          return prevCart.map((cartItem) =>
            cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem
          );
        } else {
          return existingItem.quantity === 1
            ? prevCart.filter((cartItem) => cartItem.id !== item.id)
            : prevCart.map((cartItem) =>
                cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity - 1 } : cartItem
              );
        }
      } else {
        return action === "increase" ? [...prevCart, { ...item, quantity: 1 }] : prevCart;
      }
    });
  };

  const getQuantity = (itemId: string) => {
    const item = cart.find((cartItem) => cartItem.id === itemId);
    return item ? item.quantity : 0;
  };

  const handleGoToCart = () => {
    if (cart.length === 0) {
      Alert.alert("Empty Cart", "Please add items to your cart first.");
      return;
    }
    navigation.navigate("CartScreen", { cart });
  };

  const handleQuickOrder = async () => {
    if (cart.length === 0) {
      Alert.alert("Empty Cart", "Please add items to your cart first.");
      return;
    }

    // For quick order, we'll use a default customer name and phone number
    // In a real app, you might want to prompt the user for this information
    const defaultCustomerName = userInfo?.name || "Guest";
    const defaultPhoneNumber = "1234567890";

    try {
      setLoading(true);
      const response = await API.placeOrder(cart, defaultCustomerName, defaultPhoneNumber);
      console.log("Order placed successfully:", response);
      
      // Clear the cart after successful order
      setCart([]);
      
      // Navigate to order confirmation
      navigation.navigate("OrderSummary", { updatedCart: cart });
    } catch (error) {
      console.error("Error placing order:", error);
      Alert.alert("Order Failed", "Failed to place your order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#d9534f" />
        <Text style={styles.loadingText}>Loading menu...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Menu</Text>
      
      {/* Dine-In / Takeaway Selection Buttons */}
      <View style={styles.orderTypeContainer}>
        <TouchableOpacity
          onPress={() => setOrderType("dine-in")}
          style={[
            styles.orderTypeButton,
            { backgroundColor: orderType === "dine-in" ? "#28a745" : "#ddd" }
          ]}
        >
          <Text style={[
            styles.orderTypeText,
            { color: orderType === "dine-in" ? "#fff" : "#000" }
          ]}>Dine-In</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setOrderType("takeaway")}
          style={[
            styles.orderTypeButton,
            { backgroundColor: orderType === "takeaway" ? "#d9534f" : "#ddd" }
          ]}
        >
          <Text style={[
            styles.orderTypeText,
            { color: orderType === "takeaway" ? "#fff" : "#000" }
          ]}>Takeaway</Text>
        </TouchableOpacity>
      </View>  

      {/* Category Selection */}
      <View style={styles.categoryContainer}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            onPress={() => setSelectedCategory(category)}
            style={[
              styles.categoryButton,
              { backgroundColor: selectedCategory === category ? "#333" : "#ddd" }
            ]}
          >
            <Text style={[
              styles.categoryText,
              { color: selectedCategory === category ? "#fff" : "#000" }
            ]}>{category}</Text>
          </TouchableOpacity>
        ))}
      </View>
      
      {/* Menu Items */}
      <FlatList
        data={menuItems.filter((item) => item.type === selectedCategory)}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.menuRow}
        renderItem={({ item }) => (
          <Card style={styles.menuCard}>
            <Image source={item.image} style={styles.menuImage} />
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemName}>{item.name}</Text>
              <Text style={styles.menuItemPrice}>₹{item.price}</Text>
              <View style={styles.quantityContainer}>
                <TouchableOpacity
                  style={[styles.quantityButton, styles.decreaseButton]}
                  onPress={() => updateCart(item, "decrease")}
                  disabled={getQuantity(item.id) === 0}
                >
                  <Text style={styles.quantityButtonText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.quantityText}>{getQuantity(item.id)}</Text>
                <TouchableOpacity
                  style={[styles.quantityButton, styles.increaseButton]}
                  onPress={() => updateCart(item, "increase")}
                >
                  <Text style={styles.quantityButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Card>
        )}
      />
      
      {/* Cart Actions */}
      {cart.length > 0 && (
        <View style={styles.cartActionsContainer}>
          <Text style={styles.cartSummary}>
            {cart.length} item{cart.length !== 1 ? 's' : ''} • 
            ₹{cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)}
          </Text>
          <View style={styles.cartButtonsContainer}>
            <TouchableOpacity
              onPress={handleGoToCart}
              style={[styles.cartButton, styles.viewCartButton]}
            >
              <Text style={styles.cartButtonText}>View Cart</Text>
            </TouchableOpacity>
        <TouchableOpacity
              onPress={handleQuickOrder}
              style={[styles.cartButton, styles.quickOrderButton]}
        >
              <Text style={styles.cartButtonText}>Quick Order</Text>
        </TouchableOpacity>
          </View>
      </View>
    )}
  </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#ffe371",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffe371",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#333",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
    color: "#333",
  },
  orderTypeContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 15,
  },
  orderTypeButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginHorizontal: 5,
  },
  orderTypeText: {
    fontWeight: "bold",
  },
  categoryContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 15,
  },
  categoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginHorizontal: 5,
  },
  categoryText: {
    fontWeight: "bold",
  },
  menuRow: {
    justifyContent: "space-between",
  },
  menuCard: {
    width: "48%",
    margin: "1%",
    borderRadius: 10,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  menuImage: {
    width: "100%",
    height: 150,
    resizeMode: "cover",
  },
  menuItemContent: {
    padding: 10,
    alignItems: "center",
  },
  menuItemName: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    color: "#333",
  },
  menuItemPrice: {
    fontSize: 14,
    color: "#777",
    textAlign: "center",
    marginTop: 5,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  quantityButton: {
    padding: 6,
    borderRadius: 5,
    marginHorizontal: 5,
    width: 30,
    alignItems: "center",
  },
  decreaseButton: {
    backgroundColor: "#d9534f",
  },
  increaseButton: {
    backgroundColor: "#28a745",
  },
  quantityButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  quantityText: {
    fontSize: 16,
    fontWeight: "bold",
    minWidth: 20,
    textAlign: "center",
  },
  cartActionsContainer: {
    marginVertical: 10,
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cartSummary: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
    color: "#333",
  },
  cartButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cartButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 5,
  },
  viewCartButton: {
    backgroundColor: "#007bff",
  },
  quickOrderButton: {
    backgroundColor: "#28a745",
  },
  cartButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default MenuScreen;
