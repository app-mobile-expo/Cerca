import type { BookingId } from '@/domain/bookings/booking';

// Claves de caché jerárquicas de React Query para reservas: invalidar `lists()` cubre las vistas de cliente y proveedor
export const bookingKeys = {
  all: ['bookings'] as const,
  lists: () => [...bookingKeys.all, 'list'] as const,
  list: (role: 'customer' | 'provider') => [...bookingKeys.lists(), role] as const,
  details: () => [...bookingKeys.all, 'detail'] as const,
  detail: (id: BookingId) => [...bookingKeys.details(), id] as const,
} as const;
