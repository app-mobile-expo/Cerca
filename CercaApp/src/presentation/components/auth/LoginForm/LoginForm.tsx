import { Text, View, StyleSheet } from "react-native";
import { useLogin } from "../../../hooks/useLogin";
import { Button } from "../../ui/Button/Button";
import { Input } from "../../ui/Input/Input";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "@/types/navigation";


export const LoginForm = () => {
    
    type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

    const navigation = useNavigation<NavigationProp>();

    const { email, password, setEmail, setPassword, handleLogin, error } = useLogin();

    return (
        <View style={styles.container}>
            <View style={styles.form}>
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

                {error ? (
                    <Text style={styles.error}>
                        {error}
                    </Text>
                ) : null}

                <Button
                    title="Login"
                    onPress={handleLogin}
                />

                <Button

                    title="Don't you have an account?"
                    onPress={() => {
                        navigation.navigate("Register")
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
