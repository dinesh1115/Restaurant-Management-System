import React from "react";
import { View, Text, Button, ImageBackground, TouchableOpacity } from "react-native";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import { RootStackParamList } from "./types/navigation"; 
import { StackNavigationProp } from "@react-navigation/stack";

type WelcomeScreenNavigationProp = StackNavigationProp<RootStackParamList, "WelcomeScreen">;

export default function WelcomeScreen() {
    const navigation = useNavigation<WelcomeScreenNavigationProp>();

  return (
    <ImageBackground
      source={require("../assets/bg image.png")} 
      style={{ flex: 1, justifyContent: "center", alignItems: "center", width: "100%", height: "100%"}}
      resizeMode="cover" 
    >
      <TouchableOpacity
        onPress={() => navigation.navigate("DrawerNavigator" )}
        style={{ position: "absolute", top: 40, left: 20 }}
      >
        <MaterialIcons name="menu" size={30} color="black" />
      </TouchableOpacity>

      </ImageBackground>
    
  );
}
