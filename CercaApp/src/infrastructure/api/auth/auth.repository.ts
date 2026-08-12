import type { AuthRepository } from "@/application/ports/AuthRepository";
import type {
  SignInInput,
  SignUpInput,
} from "@/application/ports/AuthRepository";
import type { AuthSession } from "@/domain/entities/auth/AuthSession";

import { authSessionSchema } from "@/infrastructure/api/schemas/auth.schema";

import { httpClient } from "../http/httpClient";

async function signIn(
  input: SignInInput,
): Promise<AuthSession> {
  const response = await httpClient(
    "/v1/auth/sign-in",
    {
      method: "POST",
      body: input,
    },
  );

  return authSessionSchema.parse(response);
}

async function signUp(
  input: SignUpInput,
): Promise<AuthSession> {
  const response = await httpClient(
    "/v1/auth/sign-up",
    {
      method: "POST",
      body: input,
    },
  );

  return authSessionSchema.parse(response);
}


async function refreshSession(
  refreshToken: string,
): Promise<AuthSession> {
  const response = await httpClient(
    "/v1/auth/refresh",
    {
      method: "POST",
      body: {
        refreshToken,
      },
    },
  );

  return authSessionSchema.parse(response);
}

async function signOut(
  accessToken: string,
  refreshToken: string,
): Promise<void> {
  await httpClient(
    "/v1/auth/sign-out",
    {
      method: "POST",
      accessToken,
      body: {
        refreshToken,
      },
    },
  );
}

export const authRepository: AuthRepository = {
  signIn,
  signUp,
  refreshSession,
  signOut,
};
