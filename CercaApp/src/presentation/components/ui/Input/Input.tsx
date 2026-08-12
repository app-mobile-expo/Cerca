import type { AppInputProps } from "@/types/ui";
import { TextInput, Text, View, StyleSheet } from "react-native";

export function Input({ label, value, onChangeText, placeholder, }: AppInputProps) {
    return (
        <View style={styles.container}>

            <Text style={styles.label}>{label}</Text>

            <TextInput
                style={styles.input}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor="#9CA3AF"
            />
        </View>

    );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    gap: 8,
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },

  input: {
    height: 52,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: "#FFFFFF",
    color: "#111827",
  },
});
