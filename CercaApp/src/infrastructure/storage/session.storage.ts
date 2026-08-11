import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

import type { AuthSession } from "@/domain/entities/AuthSession";
import { authSessionSchema } from "@/infrastructure/api/auth.schemas";

const SESSION_KEY = "cerca.auth.session";

export async function saveSession(
  session: AuthSession,
): Promise<void> {
  if (Platform.OS === "web") {
    return;
  }

  await SecureStore.setItemAsync(
    SESSION_KEY,
    JSON.stringify(session),
  );
}

export async function getSession(): Promise<AuthSession | null> {
  if (Platform.OS === "web") {
    return null;
  }

  const storedSession =
    await SecureStore.getItemAsync(SESSION_KEY);

  if (!storedSession) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(storedSession);

    const result =
      authSessionSchema.safeParse(parsed);

    if (!result.success) {
      await clearSession();
      return null;
    }

    return result.data;
  } catch {
    await clearSession();
    return null;
  }
}

export async function clearSession(): Promise<void> {
  if (Platform.OS === "web") {
    return;
  }

  await SecureStore.deleteItemAsync(
    SESSION_KEY,
  );
}

