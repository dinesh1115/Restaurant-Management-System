import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCookies } from "react-cookie";
import { API } from "../src/services/api";
import { useNavigation } from "@react-navigation/native";

const DashboardScreen = () => {
  const navigation = useNavigation();
  const [cookies, , removeCookie] = useCookies(["auth_token"]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        let token = Platform.OS === "web" ? cookies.auth_token : await AsyncStorage.getItem("auth_token");
        if (!token) {
          Alert.alert("Unauthorized", "Please log in again.");
          navigation.navigate("Login" as never);
          return;
        }
        const userDetails = await API.me();
        setUser(userDetails);
      } catch (error) {
        console.error("Error fetching user:", error);
        Alert.alert("Error", "Failed to fetch user details.");
      }
    };

    fetchUser();
  }, [cookies.auth_token]);

  const handleLogout = async () => {
    if (Platform.OS === "web") {
      removeCookie("auth_token", { path: "/" });
    } else {
      await AsyncStorage.removeItem("auth_token");
    }
    Alert.alert("Logged out", "You have been logged out successfully.");
    navigation.navigate("Login" as never);
  };

  return (
    <View style={styles.container}>
      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>

      {/* Title */}
      <Text style={styles.title}>
        Welcome to <Text style={{ color: "#D84315" }}>Desi Thaat</Text>
      </Text>

      {/* First Row */}
      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.card, styles.registerCard]}
          onPress={() => navigation.navigate("RegistrationScreen" as never)}
        >
          <Text style={[styles.cardText, styles.centerText]}>Register User</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.card, styles.listCard]}
          onPress={() => navigation.navigate("ListUsersScreen" as never)}
        >
          <Text style={[styles.cardText, styles.centerText]}>User Management</Text>
        </TouchableOpacity>
      </View>

      {/* Current User */}
      <TouchableOpacity
        style={[styles.card, styles.currentCard]}
        onPress={() => navigation.navigate("CurrentUserScreen" as never)}
      >
        <Text style={[styles.cardText, styles.centerText]}>Current User</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffe371",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 30,
    color: "#3E2723",
  },
  row: {
    flexDirection: "row",
    gap: 20,
    marginBottom: 20,
  },
  card: {
    width: 170,
    height: 90,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  registerCard: { backgroundColor: "#BF360C" },
  listCard: { backgroundColor: "#5D4037" },
  currentCard: { backgroundColor: "#4CAF50" },
  cardText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
  },
  centerText: {
    textAlign: "center", // Centers text content
    alignSelf: "center", // Ensures the text itself is centered
  },
  logoutButton: {
    position: "absolute",
    top: 40,
    right: 20,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: "#D32F2F",
    borderRadius: 16,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  logoutButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default DashboardScreen;
