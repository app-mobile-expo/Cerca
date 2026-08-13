import {ListListingParams} from "@/application/listings/ports/listing.repository";

export const listingKeys = {
    all: ['listings'] as const,
    lists: () => [...listingKeys.all, 'list'] as const,
    list: (params: ListListingParams) => [...listingKeys.lists(), params] as const,
}



