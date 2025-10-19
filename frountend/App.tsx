
// App.tsx
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { CookiesProvider } from "react-cookie";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import WelcomeScreen from "./app/WelcomeScreen";
import LoginScreen from "./app/Login";  
import HomeScreen from "./app/Menu";          
import RegistrationScreen from "./app/RegistrationScreen";
import DashboardScreen from "./app/DashboardScreen";
import DeleteUser from "./app/DeleteUser";
import UpdateUserScreen from "./app/UpdateUserScreen";
import CurrentUserScreen from "./app/CurrentUserScreen";
import ListUsersScreen from "./app/ListUsersScreen";
import DrawerNavigator from "./app/DrawerNavigator";

export type RootStackParamList = {
  WelcomeScreen: undefined;
  DrawerNavigator: undefined;
  Login: undefined;
  Home: undefined;
  RegistrationScreen: undefined;
  Dashboard: undefined;
  UpdateUser: undefined;
  DeleteUser: undefined;
  CurrentUser: undefined;
  ListUsers: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <CookiesProvider>
    <NavigationContainer>
      <Stack.Navigator initialRouteName="WelcomeScreen">
      <Stack.Screen name="WelcomeScreen" component={WelcomeScreen} />
      <Stack.Screen name="DrawerNavigator" component={DrawerNavigator} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="RegistrationScreen" component={RegistrationScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="UpdateUser" component={UpdateUserScreen} />
      <Stack.Screen name="DeleteUser" component={DeleteUser} />
      <Stack.Screen name="CurrentUser" component={CurrentUserScreen} />
      <Stack.Screen name="ListUsers" component={ListUsersScreen} />
      </Stack.Navigator>
    </NavigationContainer>
    </CookiesProvider>
  );
}
