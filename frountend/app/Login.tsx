import React, { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { Platform, useWindowDimensions } from "react-native";
import {
  View,
  Text,
  TextInput,
  Alert,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { API } from '../src/services/api';
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from "@/app/types/navigation";
import CookieManager from "@react-native-cookies/cookies";
import { useCookies } from "react-cookie";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

const LoginScreen: React.FC<Props> = ({}) => {
  const navigation = useNavigation(); 
  const { width } = useWindowDimensions();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [cookies, setCookie] = useCookies(["auth_token"]);

  const handleLogin = async () => {
    try {
      console.log(`Logging in with username: ${username} and password: ${password}`);
  
      const resp = await API.loginUser({ username, password });
  
      if (resp.access_token) {
        console.log(resp);

          // ✅ Store token for Web (Cookies) & Mobile (AsyncStorage)
          if (Platform.OS === "web") {
            setCookie("auth_token", resp.access_token, {
              path: "/",
              expires: new Date(2030, 11, 31), // Expire in 2030
              secure: true,
              sameSite: "strict",
            });
          } else {
            await AsyncStorage.setItem("auth_token", resp.access_token);
          }
  
        // Fetch user details
        try {
          const userDetails = await API.me();
          console.log(userDetails);
  
          // Check privilege and navigate to the appropriate screen
          if (userDetails.privilege === "admin") {
            Alert.alert("Welcome Admin", `Hello ${userDetails.name}`);
            navigation.navigate("DashboardScreen" as never);
          } else if (userDetails.privilege === "user") {
            Alert.alert("Welcome User", `Hello ${userDetails.name}`);
            navigation.navigate("MenuScreen" as never);
          } else if (userDetails.privilege === "Cook") {
            Alert.alert("Welcome Kitchen Staff", `Hello ${userDetails.name}`);
            navigation.navigate("KitchenScreen" as never);
          } else {
            Alert.alert("Error", "Unrecognized privilege level.");
          }
          
      } catch (meError) {
        console.log("Error fetching user details:", meError);
        Alert.alert("Error", "Failed to fetch user details");
      }
    } else {
      Alert.alert("Login Failed", "Invalid Username/Password");
    }
  } catch (err) {
    console.log(err);
    Alert.alert("Error", "Something went wrong. Please try again.");
  }
};
  
  return (
    
    <View style={styles.container}>
      <View style={[styles.card, { width: width > 768 ? "40%" : "90%" }]}>
        <Text style={styles.title}>Welcome to Desi Thaat.</Text>
        <Text style={styles.subtitle}>Log-in or sign-up</Text>

        {/* Username Input */}
        <TextInput
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
          style={styles.input}
          placeholderTextColor="#999"
        />

        {/* Password Input */}
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
          placeholderTextColor="#999"
        />

        {/* Login Button */}
       
          <TouchableOpacity
            style={styles.button}
            onPress={handleLogin}
           
          >
            <LinearGradient colors={["#FF6B6B", "#FF8787"]} style={styles.buttonGradient}>
              <Text style={styles.buttonText}>Login</Text>
            </LinearGradient>
          </TouchableOpacity>
     
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF3E0", // Updated to light cream shade
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: "#FFFFFF",
    padding: 32,
    borderRadius: 16,
    shadowColor: "#2D2D2D", // Charleston Green
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#2D2D2D", // Charleston Green
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#777",
    textAlign: "center",
    marginBottom: 24,
  },
  input: {
    height: 48,
    backgroundColor: "#F4F4F2",
    borderColor: "#E0E0E0",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
    color: "#2D2D2D",
  },
  button: {
    marginTop: 16,
    borderRadius: 12,
    overflow: "hidden",
  },
  buttonGradient: {
    paddingVertical: 14,
    alignItems: "center",
    borderRadius: 12,
    shadowColor: "#FF6B6B", // Light Red shadow
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  footerText: {
    textAlign: "center",
    color: "#777",
    fontSize: 14,
    marginTop: 16,
  },
  linkText: {
    color: "#FF6B6B", // Light Red for clickable links
    fontWeight: "600",
  },
});

export default LoginScreen;
