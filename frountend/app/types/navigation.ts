import { NativeStackScreenProps } from "@react-navigation/native-stack";

export type RootStackParamList = {
    WelcomeScreen: undefined;
    Login: undefined;
    DashboardScreen: undefined;
    RegistrationScreen: undefined;
    DeleteUser: undefined;
    ListUsersScreen: undefined;
    CurrentUserScreen: undefined;
    UpdateUserScreen: undefined;
    DrawerNavigator: undefined;
    MenuScreen: undefined;
    KitchenScreen: undefined;
    CartScreen: { cart: CartItem[] };
    OrderSummary: { updatedCart: CartItem[] };
    OrderConfirmation: { orderId: string };
    OrderTracking: undefined;
};

export interface CartItem {
  id: string;
  type: string;
  name: string;
  quantity: number;
  price: number;
  image:any;
}

export type OrderSummaryProps = NativeStackScreenProps<RootStackParamList, "OrderSummary">;

  