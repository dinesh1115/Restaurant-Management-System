import React from "react";
import { createDrawerNavigator, DrawerItem } from "@react-navigation/drawer";
import { View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import MenuScreen from "./Menu";
import CategoriesScreen from "./Categories";
import LoginScreen from "./Login";

const Drawer = createDrawerNavigator();

export default function DrawerNavigator() {
 

  return (
    <Drawer.Navigator
      initialRouteName="Menu"
      screenOptions={{
        // Custom Drawer Label Style
        drawerLabelStyle: {
          fontSize: 24, // Increase font size for better visibility
          fontWeight: "bold", // Make text bold
          color: "#ffffff", // Set label text color
        },
        drawerStyle: {
          backgroundColor: "#bf9056", // Dark background to match a sophisticated theme
        },
        drawerActiveBackgroundColor: "#ff5757", // Highlight active item with a themed color
        drawerActiveTintColor: "#ffffff", // Active text color
        drawerInactiveTintColor: "#cccccc", // Inactive text color
      }}
    >
      <Drawer.Screen
        name="Menu"
        component={MenuScreen}
        options={{
          drawerIcon: ({ color, size }) => <MaterialIcons name="menu" color={color} size={size} />,
        }}
      />
      <Drawer.Screen
        name="Categories"
        component={CategoriesScreen}
        options={{
          drawerIcon: ({ color, size }) => <MaterialIcons name="category" color={color} size={size} />,
        }}
      />
      <Drawer.Screen
        name="Login"
        component={LoginScreen}
        options={{
          drawerIcon: ({ color, size }) => <MaterialIcons name="login" color={color} size={size} />,
        }}
      />
    </Drawer.Navigator>
  );
}