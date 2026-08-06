// Error problem+json (RFC 9457) que devolvió el servidor, con el motivo legible por máquina si el backend lo mandó
export class ApiError extends Error {
  readonly status: number;
  readonly reason?: string;

  constructor(status: number, reason?: string, detail?: string) {
    super(detail ?? `API request failed with status ${status}`);
    this.name = 'ApiError';
    this.status = status;
    this.reason = reason;
  }
}

// Error de red: la petición nunca llegó al servidor (sin conexión, timeout, avión a mitad de vuelo)
export class ApiNetworkError extends Error {
  constructor(cause?: unknown) {
    super('Network request failed');
    this.name = 'ApiNetworkError';
    this.cause = cause;
  }
}
