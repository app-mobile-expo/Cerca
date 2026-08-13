import type { Capacity, PlatformRole } from "@/types/auth";

export type Permission =
  | "listing:read"
  | "listing:create"
  | "listing:update"
  | "listing:moderate"
  | "booking:request"
  | "booking:accept"
  | "review:write"
  | "review:moderate"
  | "report:resolve"
  | "user:suspend";

export type CapacityPermissions = Readonly<
  Record<Capacity, readonly Permission[]>
>;

export type PlatformPermissions = Readonly<
  Record<PlatformRole, readonly Permission[]>
>;

export interface AccessModule {
  readonly permission: Permission;
  readonly title: string;
  readonly description: string;
}
