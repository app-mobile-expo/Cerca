import type { ListingRepository, ListListingParams, ListListingsResult } from "../ports/listing.repository";

export function createListListingUseCase(repository: ListingRepository){
    return function listListings(params: ListListingParams): Promise<ListListingsResult>{
        return repository.listListings(params);
    }
}