import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";

import type { AuthSession } from "@/domain/entities/AuthSession";
import {
  refreshSession,
  signIn,
  signOut,
} from "@/infrastructure/api/auth.service";
import {
  clearSession,
  getSession,
  saveSession,
} from "@/infrastructure/storage/session.storage";

type LoginInput = {
  email: string;
  password: string;
};

type AuthContextValue = {
  session: AuthSession | null;
  isInitializing: boolean;
  login: (
    input: LoginInput,
  ) => Promise<boolean>;
  logout: () => Promise<void>;
};

const AuthContext =
  createContext<AuthContextValue | undefined>(
    undefined,
  );

export function AuthProvider({
  children,
}: PropsWithChildren) {
  const [session, setSession] =
    useState<AuthSession | null>(null);

  const [isInitializing, setIsInitializing] =
    useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const storedSession =
          await getSession();

        if (!storedSession) {
          return;
        }

        const newSession =
          await refreshSession(
            storedSession.refreshToken,
          );

        await saveSession(newSession);

        setSession(newSession);
      } catch (error) {
        console.error(
          "Could not restore session:",
          error,
        );

        await clearSession();
        setSession(null);
      } finally {
        setIsInitializing(false);
      }
    };

    void restoreSession();
  }, []);

  const login = async (
    input: LoginInput,
  ): Promise<boolean> => {
    try {
      const newSession =
        await signIn(input);

      await saveSession(newSession);

      setSession(newSession);

      console.log("Login successful");

      return true;
    } catch (error) {
      console.error("Login error:", error);

      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      if (session) {
        await signOut(
          session.refreshToken,
          session.accessToken,
        );
      }
    } catch (error) {
      console.error(
        "Server logout failed:",
        error,
      );
    } finally {
      await clearSession();
      setSession(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        isInitializing,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider",
    );
  }

  return context;
}