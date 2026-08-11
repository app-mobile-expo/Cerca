import { NavigationContainer } from "@react-navigation/native";

import { AppNavigator } from "./src/presentation/navigation/AppNavigator";
import { AuthProvider } from "./src/presentation/context/AuthContext";

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}