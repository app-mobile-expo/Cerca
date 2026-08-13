import { FlatList, StyleSheet } from "react-native";
import type { CategoryId } from "@/domain/categories/category";
import type { Listing } from "@/domain/listings/listing";
import { ListingCard } from './listing-card';

type ListingListProps = {
    readonly listings: readonly Listing[];
    readonly categoriesById?: Readonly<Record<CategoryId, string>>;
    readonly onEndReached?: () => void;
    readonly refreshing?: boolean;
    readonly onRefresh?: () => void;
};

export function ListingList({ listings, categoriesById, onEndReached, refreshing, onRefresh }: ListingListProps) {
    return (
        <FlatList
            data={listings}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
                <ListingCard listing={item} categoryName={categoriesById?.[item.categoryId]} />
            )}
            onEndReached={onEndReached}
            onEndReachedThreshold={0.5}
            refreshing={refreshing}
            onRefresh={onRefresh}
            contentContainerStyle={styles.content}
        />
    );
}

const styles = StyleSheet.create({
    content: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 12,
    },
});


