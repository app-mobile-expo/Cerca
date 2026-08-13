import type { Actor } from "@/types/auth";
import type {
  CapacityPermissions,
  Permission,
  PlatformPermissions,
} from "@/types/permissions";

export const capacityPermissions: CapacityPermissions = {
  customer: ["listing:read", "booking:request", "review:write"],
  provider: [
    "listing:read",
    "listing:create",
    "listing:update",
    "booking:request",
    "booking:accept",
    "review:write",
  ],
};

export const platformPermissions: PlatformPermissions = {
  user: [],
  moderator: [
    "listing:read",
    "listing:moderate",
    "booking:request",
    "review:write",
    "review:moderate",
    "report:resolve",
  ],
  admin: [
    "listing:read",
    "listing:create",
    "listing:update",
    "listing:moderate",
    "booking:request",
    "review:write",
    "review:moderate",
    "report:resolve",
    "user:suspend",
  ],
};


export function can(
  actor: Actor,
  permission: Permission,
): boolean {
  const fromCapacities = actor.capacities.some((capacity) =>
    capacityPermissions[capacity].includes(permission),
  );

  return (
    fromCapacities ||
    platformPermissions[actor.platformRole].includes(permission)
  );
}
