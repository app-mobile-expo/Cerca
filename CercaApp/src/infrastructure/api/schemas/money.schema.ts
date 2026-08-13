import { z } from "zod";

export const moneySchema = z.object({
    amountMinor: z.number(),
    currency: z.string(),
})