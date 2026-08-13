import { StyleSheet, Text, View } from 'react-native';

import type { Listing } from '@/domain/listings/listing';

import { formatMoney } from '../utils/format-money';

type ListingCardProps = {
  readonly listing: Listing;
};

export function ListingCard({ listing }: ListingCardProps) {
  return (
    <View style={styles.card}>
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
  title: {
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
