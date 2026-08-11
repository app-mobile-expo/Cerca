import { useLogin } from "../../../hooks/useLogin";
import { Button } from "../../ui/Button/Button";
import { Input } from "../../ui/Input/Input";
import { View, StyleSheet } from "react-native";


export const LoginForm = () => {

    const { email, password, setEmail, setPassword, handleLogin } = useLogin()

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

                <Button
                    title="Login"
                    onPress={handleLogin}
                />
            </View>

        </View>
    )
}

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
});