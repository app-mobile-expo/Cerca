import type { Actor } from "@/types/auth";

import { actorSchema } from "../schemas/auth.schema";
import { httpClient } from "../http/httpClient";

export async function getCurrentProfile(
  accessToken: string,
): Promise<Actor> {
  const response = await httpClient("/v1/me", {
    accessToken,
  });

  return actorSchema.parse(response);
}
