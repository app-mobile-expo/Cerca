
import { SafeAreaView } from "react-native-safe-area-context";

import { RegisterForm } from "../../components/auth/RegisterForm/RegisterForm";

export default function RegisterScreen() {
  return (
    <SafeAreaView edges={["bottom", "left", "right"]} style={{ flex: 1 }}>
      <RegisterForm />
    </SafeAreaView>
  );
}
