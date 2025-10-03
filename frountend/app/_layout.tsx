import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { CookiesProvider } from "react-cookie";
import { RootStackParamList } from "@/app/types/navigation"; 
import { useColorScheme } from '@/hooks/useColorScheme';
import WelcomeScreen from "@/app/WelcomeScreen";
import LoginScreen from '@/app/Login';
import DashboardScreen from '@/app/DashboardScreen';
import RegistrationScreen from '@/app/RegistrationScreen';
import DeleteUser from '@/app/DeleteUser';
import ListUsersScreen from '@/app/ListUsersScreen';
import CurrentUserScreen from '@/app/CurrentUserScreen';
import UpdateUserScreen from '@/app/UpdateUserScreen';
import DrawerNavigator from "@/app/DrawerNavigator";
import CartScreen from "./CartScreen";
import OrderSummary from "./OrderSummary";
import MenuScreen from "./Menu";
import KitchenScreen from "./KitchenScreen";
import OrderConfirmation from "./OrderConfirmation";
import OrderTracking from "./OrderTracking";

SplashScreen.preventAutoHideAsync();


const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <CookiesProvider>
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="WelcomeScreen" component={WelcomeScreen} />
        <Stack.Screen name="DrawerNavigator" component={DrawerNavigator} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="DashboardScreen" component={DashboardScreen} />
        <Stack.Screen name="RegistrationScreen" component={RegistrationScreen} />
        <Stack.Screen name="DeleteUser" component={DeleteUser} />
        <Stack.Screen name="ListUsersScreen" component={ListUsersScreen} />
        <Stack.Screen name="CurrentUserScreen" component={CurrentUserScreen} />
        <Stack.Screen name="KitchenScreen" component={KitchenScreen} />
        <Stack.Screen name="UpdateUserScreen" component={UpdateUserScreen} />
        <Stack.Screen name="MenuScreen" component={MenuScreen} options={{ title: "Menu" }} />
      <Stack.Screen name="CartScreen" component={CartScreen} options={{ title: "Cart" }} />
      <Stack.Screen name="OrderSummary" component={OrderSummary} options={{ title: "Order Summary" }} />
      <Stack.Screen name="OrderConfirmation" component={OrderConfirmation} options={{ title: "Order Confirmation" }} />
      <Stack.Screen name="OrderTracking" component={OrderTracking} options={{ title: "Order Tracking" }} />
        
      </Stack.Navigator>
      <StatusBar style="auto" />
    </ThemeProvider>
    </CookiesProvider>
  );
}
