import type { Money } from "../shared/money";

export type ListingId = string;
export type CategoryId = string;

export interface Listing{
    readonly id: ListingId;
    readonly title: string;
    readonly categoryId: CategoryId;
    readonly priceFrom: Money;
    readonly status: string;
    readonly ratingAvg: number;
    readonly ratingCount: number;
    readonly distanceMeters: number;
}