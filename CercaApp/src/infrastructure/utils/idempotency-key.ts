// Genera una clave de idempotencia única para un intento de solicitud POST (no es un secreto, solo evita duplicados)
export function generateIdempotencyKey(): string {
  const timePart = Date.now().toString(36);
  const randomPart = Math.random().toString(36).slice(2, 10);
  return `${timePart}-${randomPart}`;
}
