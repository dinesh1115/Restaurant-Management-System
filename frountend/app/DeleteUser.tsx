import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import { useWindowDimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { API } from "../src/services/api";
import Toast from "react-native-toast-message";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

type RootStackParamList = {
  DeleteUser: undefined;
  DashboardScreen: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, "DeleteUser">;

const DeleteUser: React.FC<Props> = ({ navigation }) => {
  const { width } = useWindowDimensions();
  const [username, setUsername] = useState("");

  const handleDelete = async () => {
    try {
      await API.deleteUser(username);
      Toast.show({
        type: "success",
        text1: "Success",
        text2: "User deleted successfully!",
      });
      setUsername("");

      // Navigate to Dashboard after 2 seconds
      setTimeout(() => {
        navigation.navigate("DashboardScreen");
      }, 2000);
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.response?.data?.detail || "Deletion failed.",
      });
    }
  };

  return (
    <LinearGradient colors={["#FF6F61", "#FF914D"]} style={styles.container}>
      <View style={[styles.card, { width: width > 768 ? "50%" : "85%" }]}>
        <Text style={styles.title}>Delete User</Text>
        <TextInput
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
          style={styles.input}
          placeholderTextColor="#aaa"
        />
        <TouchableOpacity style={styles.button} onPress={handleDelete}>
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>

      {/* Toast Message Component */}
      <Toast />
    </LinearGradient>
  );
};

// 🔹 Styles (No changes)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffe371",
  },
  card: {
    width: "85%",
    maxWidth: 500,
    backgroundColor: "white",
    padding: 40,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 7,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 25,
    color: "#FF6F61",
  },
  input: {
    height: 55,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 16,
    marginBottom: 16,
    backgroundColor: "#FFF8F3",
    fontSize: 18,
    color: "#333",
  },
  button: {
    backgroundColor: "#FF6F61",
    paddingVertical: 18,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 16,
  },
  buttonText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
});

export default DeleteUser;
