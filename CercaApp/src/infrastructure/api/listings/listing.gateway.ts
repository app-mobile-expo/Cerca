import { z } from "zod";
import type { ListingRepository, ListListingParams, ListListingsResult } from "@/application/listings/ports/listing.repository";
import { httpClient } from "../http-client";
import { moneySchema } from "../schemas/money.schema";


const listingSchema = z.object({
    id: z.string().min(1),
    title: z.string(),
    categoryId: z.string().min(1),
    priceFrom: moneySchema,
    status: z.string(),
    ratingAvg: z.number(),
    ratingCount: z.number(),
    distanceMeters: z.number(),
});

const listListingResponseSchema = z.object({
    items: z.array(listingSchema),
    nextCursor: z.string().nullable(),
})

function toQueryString(params: ListListingParams): string{
    const searchParams = new URLSearchParams();
    for(const[key, value] of Object.entries(params)){
        if(value !== undefined) searchParams.set(key,String(value));
    }
            return searchParams.toString();
}

export class ListingAPIGateway implements ListingRepository{
    async listListings(params: ListListingParams): Promise<ListListingsResult> {
        const qs = toQueryString(params)
        const raw = await httpClient.get(`/listings${qs ? `?${qs}`: ''}`);
     return listListingResponseSchema.parse(raw);
    }
}

export const listingGateway = new ListingAPIGateway();