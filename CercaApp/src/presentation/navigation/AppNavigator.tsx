import { createNativeStackNavigator } from "@react-navigation/native-stack";

import RegisterScreen from "../screens/RegisterForm/RegisterForm";
import LoginScreen from "../screens/LoginForm/LoginForm";

const Stack = createNativeStackNavigator()

export const AppNavigator = () =>{
    return(
    <Stack.Navigator>
      <Stack.Screen
        name="Login"
        component={LoginScreen}
      />

      <Stack.Screen
        name="Register"
        component={RegisterScreen}
      />

    </Stack.Navigator>

    )
}