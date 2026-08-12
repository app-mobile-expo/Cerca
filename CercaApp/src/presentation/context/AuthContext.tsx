import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";

import type { SignInInput } from "@/application/ports/AuthRepository";
import {
  refreshSessionUseCase,
  signInUseCase,
  signOutUseCase,
} from "@/application/use-cases/auth.use-cases";
import type { AuthSession } from "@/domain/entities/auth/AuthSession";
import { authRepository } from "@/infrastructure/api/auth/auth.repository";
import {
  clearSession,
  getSession,
  saveSession,
} from "@/infrastructure/storage/session.storage";

type AuthContextValue = {
  session: AuthSession | null;
  isInitializing: boolean;
  login: (
    input: SignInInput,
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
          await refreshSessionUseCase(
            authRepository,
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
    input: SignInInput,
  ): Promise<boolean> => {
    try {
      const newSession =
        await signInUseCase(
          authRepository,
          input,
        );

      await saveSession(newSession);

      setSession(newSession);

      return true;
    } catch (error) {
      console.error("Login error:", error);

      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      if (session) {
        await signOutUseCase(
          authRepository,
          session.accessToken,
          session.refreshToken,
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
