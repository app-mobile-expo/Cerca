import {
  ActivityIndicator,
  View,
} from "react-native";
import {
  createNativeStackNavigator,
} from "@react-navigation/native-stack";

import LoginScreen from "../screens/LoginForm/LoginForm";
import RegisterScreen from "../screens/RegisterForm/RegisterForm";
import SearchScreen from "../screens/SearchScreen/SearchScreen";

import { useAuth } from "../context/AuthContext";
import type { RootStackParamList } from "./types/RootStackParamList";

const Stack =
  createNativeStackNavigator<RootStackParamList>();

export const AppNavigator = () => {
  const {
    session,
    isInitializing,
  } = useAuth();

  if (isInitializing) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack.Navigator>
      {session ? (
        <Stack.Screen
          name="Search"
          component={SearchScreen}
        />
      ) : (
        <>
          <Stack.Screen
            name="Login"
            component={LoginScreen}
          />

          <Stack.Screen
            name="Register"
            component={RegisterScreen}
          />
        </>
      )}
    </Stack.Navigator>
  );
};