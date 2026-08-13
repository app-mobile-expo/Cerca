import {useInfiniteQuery, useQuery} from '@tanstack/react-query';

import { createListListingUseCase } from '@/application/listings/use-cases/list-listings';

import type { ListListingParams } from '@/application/listings/ports/listing.repository';

import { listingGateway } from '@/infrastructure/api/listings/listing.gateway';

import { listingKeys } from './listing-keys';

type ListingFilters = Omit<ListListingParams, 'cursor'>

export function useListings(filters: ListingFilters){
    return useInfiniteQuery({
        queryKey: listingKeys.list(filters),
        queryFn:({pageParam}) => listListings({...filters,cursor:pageParam}),
        initialPageParam: undefined as string | undefined,
        getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    });
}

const listListings = createListListingUseCase(listingGateway)
