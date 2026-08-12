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
        Welcome to Cerca
      </Text>

      <Text>
        User: {session?.actor.id}
      </Text>

      <Button
        title="Sign out"
        onPress={() => {
          void logout();
        }}
      />
    </View>
  );
}
