import { API_URL } from "@/infrastructure/config/api.config";

import { parseApiErrorBody } from "./ApiError";

type HttpOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  accessToken?: string;
};

export async function httpClient(
  path: string,
  options: HttpOptions = {},
): Promise<unknown> {
  const headers = new Headers();

  headers.set('Accept', 'application/json');

  if (options.body !== undefined) {
    headers.set('Content-Type', 'application/json');
  }

  if (options.accessToken) {
    headers.set(
      'Authorization',
      `Bearer ${options.accessToken}`,
    );
  }

  let response: Response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      method: options.method ?? 'GET',
      headers,
      body:
        options.body !== undefined
          ? JSON.stringify(options.body)
          : undefined,
    });
  } catch {
    throw new Error(
      "Could not connect to the server.",
    );
  }

  if (!response.ok) {
    const errorBody: unknown = await response
      .json()
      .catch(() => null);

    throw parseApiErrorBody(
      errorBody,
      response.status,
    );
  }

  if (response.status === 204) {
    return undefined;
  }

  return response.json();
}
