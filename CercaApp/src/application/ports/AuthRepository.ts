import type { AuthSession } from "@/domain/entities/auth/AuthSession";
import type { Capacity } from "@/domain/entities/auth/Actor";

export type SignInInput = {
  email: string;
  password: string;
};

export type SignUpInput = {
  email: string;
  password: string;
  displayName: string;
  capacities?: Capacity[];
};

export interface AuthRepository {
  signIn(input: SignInInput): Promise<AuthSession>;
  signUp(input: SignUpInput): Promise<AuthSession>;
  refreshSession(refreshToken: string): Promise<AuthSession>;
  signOut(
    accessToken: string,
    refreshToken: string,
  ): Promise<void>;
}
