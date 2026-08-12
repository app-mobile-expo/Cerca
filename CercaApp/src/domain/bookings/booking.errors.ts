// Error base de dominio para todo lo relacionado con reservas
export class BookingDomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BookingDomainError';
  }
}

// Se lanza cuando un caso de uso intenta reservar un anuncio propio, reflejando la política canRequestBooking
export class OwnListingBookingError extends BookingDomainError {
  constructor() {
    super('A user cannot book their own listing.');
    this.name = 'OwnListingBookingError';
  }
}