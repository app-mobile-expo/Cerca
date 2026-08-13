import type { Listing } from "@/domain/listings/listing";


export interface ListListingParams{
    readonly lat?: number;
    readonly lng?: number;
    readonly cityId?: string;
    readonly categoryId?: string;
    readonly query?: string;
    readonly radiusKm?: number;
    readonly cursor?: string;
    readonly limit?: number;
}

export interface ListListingsResult{
    readonly items: readonly Listing[];
    readonly nextCursor: string | null;
}

export interface ListingRepository{
    listListings(params: ListListingParams): Promise<ListListingsResult>
}