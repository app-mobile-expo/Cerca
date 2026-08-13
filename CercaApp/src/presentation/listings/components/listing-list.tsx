import { FlatList, StyleSheet } from "react-native";
import type { Listing } from "@/domain/listings/listing";
import { ListingCard } from './listing-card';

type ListingListProps = {
    readonly listings: readonly Listing[];
    readonly onEndReached?: () => void;
    readonly refreshing?: boolean;
    readonly onRefresh?: () => void;
};

export function ListingList({ listings, onEndReached, refreshing, onRefresh }: ListingListProps) {
    return (
        <FlatList
            data={listings}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <ListingCard listing={item} />}
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


