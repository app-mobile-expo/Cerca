import type {
  AuthSession,
  SignInInput,
  SignUpInput,
} from "@/types/auth";

export type { SignInInput, SignUpInput } from "@/types/auth";

export interface AuthRepository {
  signIn(input: SignInInput): Promise<AuthSession>;
  signUp(input: SignUpInput): Promise<AuthSession>;
  refreshSession(refreshToken: string): Promise<AuthSession>;
  signOut(
    accessToken: string,
    refreshToken: string,
  ): Promise<void>;
}
