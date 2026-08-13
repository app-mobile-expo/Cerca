import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import {
  NativeStackNavigationProp,
} from "@react-navigation/native-stack";

import { useRegister } from "../../../hooks/useRegister";
import type { RootStackParamList } from "@/types/navigation";
import { Button } from "../../ui/Button/Button";
import { Input } from "../../ui/Input/Input";

type NavigationProp =
  NativeStackNavigationProp<RootStackParamList>;

export const RegisterForm = () => {
  const navigation =
    useNavigation<NavigationProp>();

  const {
    displayName,
    email,
    password,
    confirmPassword,
    setDisplayName,
    setEmail,
    setPassword,
    setConfirmPassword,
    handleRegister,
    error,
    isLoading,
  } = useRegister();

  const onRegister = async (): Promise<void> => {
    const registered = await handleRegister();

    if (!registered) {
      return;
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
      <View style={styles.form}>
        <Input
          label="Name"
          value={displayName}
          onChangeText={setDisplayName}
          placeholder="Your name"
        />

        <Input
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="Email@example.com"
        />

        <Input
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="********"
        />

        <Input
          label="Confirm password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="********"
        />

        {error ? (
          <Text style={styles.error}>
            {error}
          </Text>
        ) : null}

        <Button
          title={
            isLoading
              ? "Creating account..."
              : "Sign up"
          }
          onPress={() => {
            void onRegister();
          }}
        />

        <Button
          title="Do you have an account?"
          onPress={() => {
            navigation.navigate("Login");
          }}
        />
      </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  form: {
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
    gap: 16,
  },
  error: {
    color: "red",
  },
});
