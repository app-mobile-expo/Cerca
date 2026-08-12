import { StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import {
  NativeStackNavigationProp,
} from "@react-navigation/native-stack";

import { useRegister } from "../../../hooks/useRegister";
import type { RootStackParamList } from "../../../navigation/types/RootStackParamList";
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

  const onRegister = async () => {
    const session = await handleRegister();

    if (!session) return;

    navigation.navigate("Login");
  };

  return (
    <View style={styles.container}>
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
          onPress={onRegister}
        />

        <Button
          title="Do you have an account?"
          onPress={() => {
            navigation.navigate("Login");
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
