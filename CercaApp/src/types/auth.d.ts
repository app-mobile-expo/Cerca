export type Capacity = "customer" | "provider";

export type PlatformRole = "user" | "moderator" | "admin";

/** Authenticated account details returned by the API at GET /me. */
export interface Actor {
  readonly id: string;
  readonly capacities: readonly Capacity[];
  readonly platformRole: PlatformRole;
}

export interface AuthSession {
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly actor: Actor;
}

export interface SignInInput {
  readonly email: string;
  readonly password: string;
}

export interface SignUpInput extends SignInInput {
  readonly displayName: string;
  readonly capacities?: readonly Capacity[];
}
