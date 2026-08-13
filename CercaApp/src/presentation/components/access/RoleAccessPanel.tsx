import { StyleSheet, Text, View } from "react-native";

import { can } from "@/domain/permissions/permissionPolicy";
import { accessModules } from "@/presentation/config/accessContent";
import type { Actor, Capacity, PlatformRole } from "@/types/auth";

type RoleAccessPanelProps = {
  readonly actor: Actor;
};

const roleLabels: Readonly<Record<PlatformRole, string>> = {
  user: "User",
  moderator: "Moderator",
  admin: "Administrator",
};

const capacityLabels: Readonly<Record<Capacity, string>> = {
  customer: "Customer",
  provider: "Provider",
};

export function RoleAccessPanel({ actor }: RoleAccessPanelProps) {
  const availableModules = accessModules.filter((module) =>
    can(actor, module.permission),
  );

  const capacities = actor.capacities
    .map((capacity) => capacityLabels[capacity])
    .join(", ");

  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>{roleLabels[actor.platformRole].toUpperCase()} VIEW</Text>
      <Text style={styles.message}>
        Your available features are based on your account capabilities and platform role.
      </Text>
      <Text style={styles.capacities}>
        Capabilities: {capacities || "None"}
      </Text>

      {availableModules.map((module) => (
        <View key={module.title} style={styles.module}>
          <Text style={styles.moduleTitle}>{module.title}</Text>
          <Text style={styles.moduleDescription}>{module.description}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12, marginTop: 24, paddingHorizontal: 20 },
  eyebrow: { color: "#4F46E5", fontSize: 12, fontWeight: "700", letterSpacing: 0.8 },
  message: { color: "#374151", fontSize: 16, lineHeight: 24, marginBottom: 4 },
  capacities: { color: "#6B7280", fontSize: 14, marginBottom: 4 },
  module: { backgroundColor: "#FFFFFF", borderRadius: 12, gap: 5, padding: 16 },
  moduleTitle: { color: "#111827", fontSize: 16, fontWeight: "700" },
  moduleDescription: { color: "#4B5563", fontSize: 14, lineHeight: 20 },
});
