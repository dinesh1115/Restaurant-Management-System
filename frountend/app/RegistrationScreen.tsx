import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { LinearGradient } from "expo-linear-gradient";
import Toast from "react-native-toast-message";
import { API } from "../src/services/api";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

type RootStackParamList = {
  RegistrationScreen: undefined;
  Login: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, "RegistrationScreen">;

const RegistrationScreen: React.FC<Props> = ({ navigation }) => {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [privilege, setPrivilege] = useState("admin");
  const [table, setTable] = useState("");
  const [password, setPassword] = useState("");

  // Input validation
  const validateInputs = () => {
    if (!name || !username || !privilege || !table || !password) {
      Toast.show({
        type: "error",
        text1: "Validation Failed",
        text2: "Please fill all fields",
        position: "top",
      });
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    if (!validateInputs()) return;

    try {
      const response = await API.registerUser({ name, username, privilege, table, password });
      Toast.show({
        type: "success",
        text1: "Registration Successful",
        text2: "User registered successfully!",
        position: "top",
      });

      setName("");
      setUsername("");
      setPrivilege("admin");
      setTable("");
      setPassword("");

    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Registration Failed",
        text2: error.detail || "Something went wrong",
        position: "top",
      });
    }
  };

  return (
    <LinearGradient colors={["#ffe371", "#ffe371"]} style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.heading}>Register User</Text>
        <Text style={styles.title}>Create Your Account</Text>

        <TextInput
          placeholder="Full Name"
          value={name}
          onChangeText={setName}
          style={styles.input}
          placeholderTextColor="#5D4037"
        />
        <TextInput
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
          style={styles.input}
          placeholderTextColor="#5D4037"
        />

        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={privilege}
            onValueChange={(itemValue) => setPrivilege(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Admin" value="admin" />
            <Picker.Item label="User" value="user" />
            <Picker.Item label="Cook" value="Cook" />
          </Picker>
        </View>

        <TextInput
          placeholder="Assigned Table"
          value={table}
          onChangeText={setTable}
          style={styles.input}
          placeholderTextColor="#5D4037"
        />
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
          placeholderTextColor="#5D4037"
        />

        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>Register</Text>
        </TouchableOpacity>
      </View>
      <Toast />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    backgroundColor: "#ffe371",
  },
  card: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: "#FFFFFF",
    padding: 25,
    borderRadius: 15,
    elevation: 10,
    shadowColor: "#000000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 20,
    color: "#3E2723",
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
    textAlign: "center",
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: "#F9F9F9",
    color: "#333333",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 10,
    marginBottom: 15,
    backgroundColor: "#F9F9F9",
  },
  picker: {
    height: 50,
    color: "#333333",
  },
  button: {
    backgroundColor: "#BF360C",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
});

export default RegistrationScreen;
