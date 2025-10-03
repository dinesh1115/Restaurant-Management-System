import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { API } from "../src/services/api";

// Define User type
type User = {
  name: string;
  username: string;
  privilege: string;
  table: string;
};

const CurrentUserScreen = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch current user on component mount
  useEffect(() => {
    let isMounted = true;

    const fetchCurrentUser = async () => {
      setLoading(true);
      try {
        const user: User = await API.me();
        if (isMounted) {
          setCurrentUser(user);
        }
      } catch (error: any) {
        Alert.alert(
          "Error",
          error.response?.data?.detail || "Failed to load current user."
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchCurrentUser();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <LinearGradient colors={["#ffe371", "#ffe371"]} style={styles.container}>
      {/* User Info */}
      {loading ? (
        <ActivityIndicator size="large" color="#FF6F61" />
      ) : (
        <View style={styles.card}>
          {currentUser ? (
            <>
              <Text style={styles.header}>Current User</Text>
              <UserDetail label="Name" value={currentUser.name} />
              <UserDetail label="Username" value={currentUser.username} />
              <UserDetail label="Privilege" value={currentUser.privilege} />
              <UserDetail label="Table" value={currentUser.table} />
            </>
          ) : (
            <Text style={styles.noUser}>No user logged in.</Text>
          )}
        </View>
      )}
    </LinearGradient>
  );
};

// Component to display user details in a rectangle box
const UserDetail = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.detailBox}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#ffe371",
  },
  card: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 20,
    width: "90%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FF6F61",
    textAlign: "center",
    marginBottom: 16,
  },
  detailBox: {
    backgroundColor: "#FFEBE8",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#FF6F61",
    width: "100%",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#444",
  },
  value: {
    fontSize: 16,
    fontWeight: "400",
    color: "#777",
    marginTop: 4,
  },
  noUser: {
    fontSize: 18,
    color: "#FF6F61",
    textAlign: "center",
    fontWeight: "500",
  },
});

export default CurrentUserScreen;
