import { StyleSheet, Text, View } from 'react-native';

import type { Listing } from '@/domain/listings/listing';

import { formatMoney } from '../utils/format-money';

type ListingCardProps = {
  readonly listing: Listing;
  readonly categoryName?: string;
};

export function ListingCard({ listing, categoryName }: ListingCardProps) {
  return (
    <View style={styles.card}>
      {categoryName ? <Text style={styles.category}>{categoryName}</Text> : null}
      <Text style={styles.title}>{listing.title}</Text>
      <Text style={styles.price}>{formatMoney(listing.priceFrom)}</Text>
      {listing.ratingCount > 0 ? (
        <Text style={styles.rating}>
          ★ {listing.ratingAvg.toFixed(1)} ({listing.ratingCount})
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#F9FAFB',
  },
  category: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6D28D9',
    textTransform: 'uppercase',
  },
  title: {
    marginTop: 2,
    fontSize: 16,
    fontWeight: '600',
  },
  price: {
    marginTop: 4,
    fontSize: 14,
    color: '#111827',
  },
  rating: {
    marginTop: 4,
    fontSize: 13,
    color: '#6B7280',
  },
});
