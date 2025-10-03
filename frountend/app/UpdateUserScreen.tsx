import React, { useState } from "react";
import { View, TextInput, Button, Alert, StyleSheet, Text } from "react-native";
import { useRoute, RouteProp } from "@react-navigation/native";
import { API } from "../src/services/api";
import { SafeAreaView } from "react-native";

// Define the expected params for this screen
type UpdateUserScreenParams = {
  username: string;
};

// Define the route type
type RouteProps = RouteProp<{ UpdateUser: UpdateUserScreenParams }, "UpdateUser">;

const UpdateUserScreen = ({ navigation }: any) => {
  const route = useRoute<RouteProps>();
  const username = route.params?.username;

  const [name, setName] = useState("");
  const [privilege, setPrivilege] = useState("");
  const [password, setPassword] = useState("");
  const [table, setTable] = useState("");

  const handleUpdate = async () => {
    if (!username) {
      Alert.alert("Error", "Username is required.");
      return;
    }

    if (!name || !privilege || !password || !table) {
      Alert.alert("Error", "All fields must be filled.");
      return;
    }

    try {
      await API.updateUser(username, { name, username, privilege, password, table });
      Alert.alert("Success", "User updated successfully!");
      navigation.goBack();
    } catch (error: any) {
      Alert.alert("Error", error.response?.data?.detail || error.message || "Update failed.");
    }
  };

  return (
    <View style={styles.container}>
       <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <View style={styles.card}>
        <Text style={styles.heading}>Update User</Text>
        <TextInput
          style={styles.input}
          placeholder="Name"
          value={name}
          onChangeText={setName}
          placeholderTextColor="#aaa"
        />
        <TextInput
          style={styles.input}
          placeholder="Privilege"
          value={privilege}
          onChangeText={setPrivilege}
          placeholderTextColor="#aaa"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          placeholderTextColor="#aaa"
        />
        <TextInput
          style={styles.input}
          placeholder="Table"
          value={table}
          onChangeText={setTable}
          placeholderTextColor="#aaa"
        />
        <View style={styles.buttonContainer}>
          <Button title="Update" onPress={handleUpdate} color="#4CAF50" />
        </View>
      </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center", // Centers vertically
    alignItems: "center", // Centers horizontally
    backgroundColor: "#ffe371",
  },

  card: {
    width: "90%", // Take most of the screen width
    maxWidth: 400, // Limit width for larger screens
    backgroundColor: "#fff", // Card background
    borderRadius: 16, // Rounded corners
    padding: 24, // Internal padding
    shadowColor: "#000", // Shadow for iOS
    shadowOffset: { width: 0, height: 4 }, // Shadow direction
    shadowOpacity: 0.2, // Shadow opacity for iOS
    shadowRadius: 6, // Shadow blur for iOS
    elevation: 5, // Shadow for Android
    alignItems: "center", // Center align content
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
    textAlign: "center",
  },
  input: {
    width: "100%",
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: "#fff",
    fontSize: 16,
    color: "#333",
    textAlign: "center", // Center text inside the input
  },
  buttonContainer: {
    marginTop: 16,
    width: "100%",
  },
});

export default UpdateUserScreen;
