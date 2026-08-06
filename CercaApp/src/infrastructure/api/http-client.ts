import { z } from 'zod';

import { sessionStorage } from '@/infrastructure/storage/secure-session-storage';

import { ApiError, ApiNetworkError } from './api-error';

// http://localhost:3000/v1 en dev · https://api.cerca.app/v1 en prod. No es un secreto, así que puede ir en EXPO_PUBLIC_*.
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:3000/v1';

// Forma mínima de un problem+json (RFC 9457): solo nos interesa el "reason" que coincide con las políticas de dominio
const problemSchema = z.object({
  reason: z.string().optional(),
  detail: z.string().optional(),
});

type RequestOptions = {
  readonly method: 'GET' | 'POST';
  readonly body?: unknown;
  readonly idempotencyKey?: string;
};

// Intenta leer el cuerpo problem+json de una respuesta fallida; si no viene o no es válido, sigue sin romper el flujo
async function readProblem(response: Response): Promise<{ reason?: string; detail?: string }> {
  try {
    const raw: unknown = await response.json();
    const result = problemSchema.safeParse(raw);
    return result.success ? result.data : {};
  } catch {
    return {};
  }
}

// Ejecuta una petición HTTP contra la API de Cerca: agrega el token de sesión, la Idempotency-Key y traduce errores
async function request(path: string, options: RequestOptions): Promise<unknown> {
  const session = await sessionStorage.read();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (session) {
    headers.Authorization = `Bearer ${session.accessToken}`;
  }

  if (options.idempotencyKey) {
    headers['Idempotency-Key'] = options.idempotencyKey;
  }

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: options.method,
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });
  } catch (cause) {
    throw new ApiNetworkError(cause);
  }

  if (!response.ok) {
    const problem = await readProblem(response);
    throw new ApiError(response.status, problem.reason, problem.detail);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

// Cliente HTTP mínimo compartido por todos los gateways de infraestructura; nunca devuelve datos tipados, solo `unknown`
export const httpClient = {
  get: (path: string): Promise<unknown> => request(path, { method: 'GET' }),
  post: (path: string, body?: unknown, idempotencyKey?: string): Promise<unknown> =>
    request(path, { method: 'POST', body, idempotencyKey }),
};
