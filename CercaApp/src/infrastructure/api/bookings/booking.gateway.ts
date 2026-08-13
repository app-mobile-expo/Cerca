import { z } from 'zod';

import type { BookingRepository } from '@/application/bookings/ports/booking.repository';
import type { Booking, BookingId, ListingId } from '@/domain/bookings/booking';

import { httpClient } from '../http-client';

// Espejo exacto de BookingStatus (unión discriminada) para validar lo que manda el backend antes de confiar en ello
const bookingStatusSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('requested'), requestedAt: z.string() }),
  z.object({ kind: z.literal('accepted'), acceptedAt: z.string(), scheduledFor: z.string() }),
  z.object({ kind: z.literal('declined'), reason: z.string() }),
  z.object({ kind: z.literal('completed'), completedAt: z.string() }),
  z.object({ kind: z.literal('cancelled'), cancelledBy: z.string(), at: z.string() }),
]);

// Espejo exacto de la entidad Booking del dominio
const bookingSchema = z.object({
  id: z.string().min(1),
  listingId: z.string().min(1),
  customerId: z.string().min(1),
  providerId: z.string().min(1),
  status: bookingStatusSchema,
  reviewId: z.string().nullable(),
});

const bookingListSchema = z.array(bookingSchema);

// Implementa BookingRepository contra la API REST de Cerca: cada respuesta se valida con Zod antes de llegar a application
export class BookingApiGateway implements BookingRepository {
  // Crea la reserva enviando la Idempotency-Key para que un reintento de red no genere dos reservas en el servidor
  async requestBooking(listingId: ListingId, idempotencyKey: string): Promise<Booking> {
    const raw = await httpClient.post('/bookings', { listingId }, idempotencyKey);
    return bookingSchema.parse(raw);
  }

  // Trae el detalle de una reserva y valida que tenga exactamente la forma que el dominio espera
  async getBooking(id: BookingId): Promise<Booking> {
    const raw = await httpClient.get(`/bookings/${id}`);
    return bookingSchema.parse(raw);
  }

  // Lista las reservas del actor filtradas por su lado en la relación (cliente o proveedor)
  async listBookings(role: 'customer' | 'provider'): Promise<readonly Booking[]> {
    const raw = await httpClient.get(`/bookings?role=${role}`);
    return bookingListSchema.parse(raw);
  }
}

export const bookingGateway = new BookingApiGateway();
