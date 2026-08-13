import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { ListingList } from '../components/listing-list';
import { useListings } from '../hooks/use-listings';

// TODO: reemplazar por t('...') cuando react-i18next esté instalado y configurado en el proyecto
// (falta el paquete y el init de i18next; hoy ningún screen que lo usa compila, no es un problema de esta rama)

// Ubicación por defecto (Medellín, ver ejemplo en cerca-api.md) hasta que se conecte geolocalización real
const DEFAULT_FILTERS = {
  lat: 6.2442,
  lng: -75.5812,
  radiusKm: 10,
};

export function ListingsScreen() {
  const {
    data,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isRefetching,
  } = useListings(DEFAULT_FILTERS);

  const listings = data?.pages.flatMap((page) => page.items) ?? [];

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>No pudimos cargar los anuncios.</Text>
        <Pressable
          accessibilityRole="button"
          style={({ pressed }) => [styles.retryButton, pressed && styles.retryButtonPressed]}
          onPress={() => refetch()}
        >
          <Text style={styles.retryButtonText}>Intentar de nuevo</Text>
        </Pressable>
      </View>
    );
  }

  if (listings.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>No encontramos anuncios en esta zona.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Servicios cerca de ti</Text>
      <ListingList
        listings={listings}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }}
        refreshing={isRefetching}
        onRefresh={() => refetch()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    fontSize: 24,
    fontWeight: '700',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  errorText: {
    marginBottom: 16,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    color: '#991B1B',
  },
  retryButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: '#111827',
    paddingHorizontal: 24,
  },
  retryButtonPressed: {
    opacity: 0.8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
});
