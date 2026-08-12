import { z } from "zod";

const apiErrorBodySchema = z.object({
  status: z.number(),
  code: z.string(),
  title: z.string(),
  detail: z.string(),
  traceId: z.string().optional(),
});

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    public readonly title: string,
    public readonly detail: string,
    public readonly traceId?: string,
  ) {
    super(detail);
    this.name = "ApiError";
  }
}

export function parseApiErrorBody(
  body: unknown,
  fallbackStatus: number,
): ApiError {
  const result = apiErrorBodySchema.safeParse(body);

  if (result.success) {
    const {
      status,
      code,
      title,
      detail,
      traceId,
    } = result.data;

    return new ApiError(
      status,
      code,
      title,
      detail,
      traceId,
    );
  }

  return new ApiError(
    fallbackStatus,
    "HTTP_ERROR",
    "HTTP Error",
    "The request could not be completed.",
  );
}
