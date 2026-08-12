export type BookingStatus =
  | { readonly kind: 'requested'; readonly requestedAt: string }
  | { readonly kind: 'accepted'; readonly acceptedAt: string; readonly scheduledFor: string }
  | { readonly kind: 'declined'; readonly reason: string }
  | { readonly kind: 'completed'; readonly completedAt: string }
  | { readonly kind: 'cancelled'; readonly cancelledBy: string; readonly at: string };