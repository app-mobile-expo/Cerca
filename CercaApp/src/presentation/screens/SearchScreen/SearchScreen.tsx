import {
  Button,
  Text,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { useAuth } from "@/presentation/context/AuthContext";
import type { RootStackParamList } from "@/types/navigation";

export default function SearchScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
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
        title="My profile"
        onPress={() => {
          navigation.navigate("Profile");
        }}
      />

      <Button
        title="Sign out"
        onPress={() => {
          void logout();
        }}
      />
    </View>
  );
}
