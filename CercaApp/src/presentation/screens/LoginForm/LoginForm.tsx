
import { SafeAreaView } from "react-native-safe-area-context";

import { LoginForm } from "../../components/auth/LoginForm/LoginForm";

export default function LoginScreen() {
  return (
    <SafeAreaView edges={["bottom", "left", "right"]} style={{ flex: 1 }}>
      <LoginForm />
    </SafeAreaView>
  );
}
