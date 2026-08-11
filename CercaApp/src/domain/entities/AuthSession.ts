import type { Actor } from './Actor';

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  actor: Actor;
}