import { BookingStatus } from './booking-status';

export type BookingId = string;
export type ListingId = string;
export type UserId = string;

export interface Booking {
  readonly id: BookingId;
  readonly listingId: ListingId;
  readonly customerId: UserId;
  readonly providerId: UserId;
  readonly status: BookingStatus;
  readonly reviewId: string | null;
}