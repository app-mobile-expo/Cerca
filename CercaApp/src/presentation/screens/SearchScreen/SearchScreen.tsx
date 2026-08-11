import {
  Button,
  Text,
  View,
} from "react-native";

import { useAuth } from "@/presentation/context/AuthContext"; 

export default function SearchScreen() {
  const {
    session,
    logout,
  } = useAuth();

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: 20,
      }}
    >
      <Text>
        Bienvenido a Cerca
      </Text>

      <Text>
        User: {session?.actor.id}
      </Text>

      <Button
        title="Cerrar sesión"
        onPress={() => {
          void logout();
        }}
      />
    </View>
  );
}