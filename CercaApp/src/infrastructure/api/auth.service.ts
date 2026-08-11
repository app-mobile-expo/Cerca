import type { AuthSession } from "@/domain/entities/AuthSession";
import type { Capacity } from "@/domain/entities/Actor";

import { authSessionSchema } from "./auth.schemas";
import { httpClient } from "./httpClient";

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

export async function signIn(
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

export async function signUp(
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


export async function refreshSession(
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

export async function signOut(
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