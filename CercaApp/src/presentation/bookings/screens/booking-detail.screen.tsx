import { router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import type { BookingId } from '@/domain/bookings/booking';
import { canReviewBooking } from '@/domain/reviews/review.policy';
import { useAuth } from '@/presentation/context/AuthContext';
import { ScreenContainer } from '@/presentation/shared/components/screen-container';

import { BookingStatusBadge } from '../components/booking-status-badge';
import { useBooking } from '../hooks/use-booking';
import { getBookingErrorMessageKey } from '../utils/booking-error-message';

// Detalle de una reserva: cubre carga, error con reintento y datos cargados; se refleja al volver desde otra pantalla
// porque la clave bookingKeys.detail(id) es la misma que invalida la mutación de solicitud
export function BookingDetailScreen() {
  const { t } = useTranslation();
  const { session } = useAuth();
  const actor = session?.actor;
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

  // review:write lo tienen todos los actores (customer/provider/moderator/admin), así que el botón nunca se oculta:
  // se deshabilita y explica el motivo exacto cuando la relación, el estado, la unicidad o el plazo lo bloquean
  const eligibility = actor ? canReviewBooking(actor.id, booking, new Date()) : null;

  return (
    <ScreenContainer>
      <Text style={styles.title}>{t('bookings.detail.title')}</Text>

      <BookingStatusBadge status={booking.status} />

      <View style={styles.row}>
        <Text style={styles.label}>{t('bookings.detail.listing')}</Text>
        <Text style={styles.value}>{booking.listingId}</Text>
      </View>

      {eligibility ? (
        <View style={styles.reviewSection}>
          {!eligibility.ok ? (
            <Text style={styles.message}>{t(`review.blocked.${eligibility.reason}`)}</Text>
          ) : null}
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: !eligibility.ok }}
            disabled={!eligibility.ok}
            style={({ pressed }) => [
              styles.reviewButton,
              !eligibility.ok && styles.reviewButtonDisabled,
              pressed && eligibility.ok && styles.reviewButtonPressed,
            ]}
            onPress={() => router.push(`/bookings/${booking.id}/review`)}
          >
            <Text style={styles.reviewButtonText}>{t('review.cta')}</Text>
          </Pressable>
        </View>
      ) : null}
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
  reviewSection: {
    marginTop: 24,
  },
  message: {
    marginBottom: 12,
    fontSize: 14,
    lineHeight: 20,
    color: '#92400E',
  },
  reviewButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: '#111827',
  },
  reviewButtonPressed: {
    opacity: 0.8,
  },
  reviewButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  reviewButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
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
