import type { AccessModule } from "@/types/permissions";

export const accessModules: readonly AccessModule[] = [
  {
    permission: "listing:read",
    title: "Available services",
    description: "Search and view service listings.",
  },
  {
    permission: "listing:create",
    title: "Create a listing",
    description: "Create and publish service listings.",
  },
  {
    permission: "listing:update",
    title: "My listings",
    description: "Review and update your own listings.",
  },
  {
    permission: "booking:request",
    title: "Request a booking",
    description: "Send a booking request for a service.",
  },
  {
    permission: "booking:accept",
    title: "Manage bookings",
    description: "Accept booking requests for your listings.",
  },
  {
    permission: "review:write",
    title: "Write reviews",
    description: "Review completed bookings when you are eligible.",
  },
  {
    permission: "listing:moderate",
    title: "Listing moderation",
    description: "Review listings that require moderation.",
  },
  {
    permission: "review:moderate",
    title: "Review moderation",
    description: "Moderate reviews submitted by the community.",
  },
  {
    permission: "report:resolve",
    title: "Community reports",
    description: "Review and resolve submitted reports.",
  },
  {
    permission: "user:suspend",
    title: "User management",
    description: "Suspend accounts when platform policy requires it.",
  },
];
