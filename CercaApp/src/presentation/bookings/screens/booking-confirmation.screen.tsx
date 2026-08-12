import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useTranslation } from 'react-i18next';

import type { BookingId } from '@/domain/bookings/booking';
import { ScreenContainer } from '@/presentation/shared/components/screen-container';

import { BookingStatusBadge } from '../components/booking-status-badge';
import { useBooking } from '../hooks/use-booking';

// Pantalla que confirma que la reserva se envió: lee el detalle ya cacheado por la mutación, sin volver a pedirlo
export function BookingConfirmationScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: BookingId }>();
  const { data: booking } = useBooking(id);

  return (
    <ScreenContainer centered>
      <Text style={styles.title}>{t('bookings.confirmation.title')}</Text>
      <Text style={styles.subtitle}>{t('bookings.confirmation.subtitle')}</Text>

      {booking ? <BookingStatusBadge status={booking.status} /> : null}

      <Pressable
        accessibilityRole="button"
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        onPress={() => router.replace(`/bookings/${id}`)}
      >
        <Text style={styles.buttonText}>{t('bookings.confirmation.viewDetail')}</Text>
      </Pressable>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    marginBottom: 8,
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    marginBottom: 20,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  button: {
    marginTop: 24,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: '#111827',
    paddingHorizontal: 24,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
