import { useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import type { BookingId } from '@/domain/bookings/booking';
import { ScreenContainer } from '@/presentation/shared/components/screen-container';

import { BookingStatusBadge } from '../components/booking-status-badge';
import { useBooking } from '../hooks/use-booking';
import { getBookingErrorMessageKey } from '../utils/booking-error-message';

// Detalle de una reserva: cubre carga, error con reintento y datos cargados; se refleja al volver desde otra pantalla
// porque la clave bookingKeys.detail(id) es la misma que invalida la mutación de solicitud
export function BookingDetailScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: BookingId }>();
  const { data: booking, isLoading, isError, error, refetch } = useBooking(id);

  if (isLoading) {
    return (
      <ScreenContainer centered>
        <ActivityIndicator />
        <Text style={styles.loadingText}>{t('common.loading')}</Text>
      </ScreenContainer>
    );
  }

  if (isError || !booking) {
    return (
      <ScreenContainer centered>
        <Text style={styles.errorMessage}>{t(getBookingErrorMessageKey(error))}</Text>
        <Pressable
          accessibilityRole="button"
          style={({ pressed }) => [styles.retryButton, pressed && styles.retryButtonPressed]}
          onPress={() => refetch()}
        >
          <Text style={styles.retryButtonText}>{t('common.retry')}</Text>
        </Pressable>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <Text style={styles.title}>{t('bookings.detail.title')}</Text>

      <BookingStatusBadge status={booking.status} />

      <View style={styles.row}>
        <Text style={styles.label}>{t('bookings.detail.listing')}</Text>
        <Text style={styles.value}>{booking.listingId}</Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  title: {
    marginBottom: 12,
    fontSize: 24,
    fontWeight: '700',
  },
  row: {
    marginTop: 16,
  },
  label: {
    fontSize: 13,
    color: '#6B7280',
  },
  value: {
    fontSize: 16,
    fontWeight: '500',
  },
  errorMessage: {
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
});
