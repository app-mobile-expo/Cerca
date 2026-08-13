import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { useAuth } from "@/presentation/context/AuthContext";
import { Button } from "@/presentation/components/ui/Button/Button";
import { Input } from "@/presentation/components/ui/Input/Input";
import { RoleAccessPanel } from "@/presentation/components/access/RoleAccessPanel";
import type { RootStackParamList } from "@/types/navigation";

export function Home() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { logout, session } = useAuth();
  const [search, setSearch] = useState("");

  if (!session) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.navBar}>
        <View style={styles.navHeader}>
          <Text style={styles.brand}>Cerca</Text>

          <View style={styles.navActions}>
            <Pressable
              accessibilityRole="button"
              onPress={() => navigation.navigate("Profile")}
              style={styles.navButton}
            >
              <Text style={styles.navButtonText}>Profile</Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              onPress={() => { void logout(); }}
              style={styles.navButton}
            >
              <Text style={styles.navButtonText}>Sign out</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.searchRow}>
          <View style={styles.searchInput}>
            <Input
              label="Search"
              value={search}
              onChangeText={setSearch}
              placeholder="Search for services"
            />
          </View>
          <View style={styles.searchButton}>
            <Button title="Search" onPress={() => undefined} />
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <RoleAccessPanel actor={session.actor} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: "#F3F4F6", flex: 1 },
  navBar: {
    backgroundColor: "#FFFFFF",
    borderBottomColor: "#E5E7EB",
    borderBottomWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  navHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  navActions: {
    flexDirection: "row",
    flexShrink: 1,
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "flex-end",
  },
  brand: { color: "#111827", flexShrink: 1, fontSize: 20, fontWeight: "700", marginEnd: 12 },
  navButton: { backgroundColor: "#E5E7EB", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  navButtonText: { color: "#111827", fontSize: 14, fontWeight: "600" },
  searchRow: { gap: 12, marginTop: 16 },
  searchInput: { minWidth: 0 },
  searchButton: { alignSelf: "stretch" },
  content: { flexGrow: 1, paddingBottom: 24 },
});
