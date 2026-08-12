import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';
import { useTranslation } from 'react-i18next';

import { canRequestBooking } from '@/domain/bookings/booking.policy';
import { useAuth } from '@/presentation/context/AuthContext';
import { ScreenContainer } from '@/presentation/shared/components/screen-container';

import { BookingRequestButton } from '../components/booking-request-button';
import { useRequestBooking } from '../hooks/use-request-booking';
import { getBookingErrorMessageKey } from '../utils/booking-error-message';

// Normaliza un parámetro de ruta que Expo Router puede entregar como string o como string[]
function readParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? '') : (value ?? '');
}

// Pantalla para solicitar una reserva sobre un anuncio: valida "no es mi anuncio" y envía la solicitud una sola vez
export function RequestBookingScreen() {
  const { t } = useTranslation();
  const { session } = useAuth();
  const actor = session?.actor;
  const params = useLocalSearchParams<{ listingId?: string; listingOwnerId?: string }>();
  const listingId = readParam(params.listingId);
  const listingOwnerId = readParam(params.listingOwnerId);
  const { requestOnce, isPending, isError, isSuccess, error, data } = useRequestBooking();

  useEffect(() => {
    if (isSuccess && data) {
      router.replace(`/bookings/${data.id}/confirmation`);
    }
  }, [isSuccess, data]);

  if (!actor) {
    return (
      <ScreenContainer>
        <Text style={styles.title}>{t('bookings.request.title')}</Text>
        <Text style={styles.message}>{t('errors.unauthenticated')}</Text>
      </ScreenContainer>
    );
  }

  const eligibility = canRequestBooking(actor.id, listingOwnerId);

  return (
    <ScreenContainer>
      <Text style={styles.title}>{t('bookings.request.title')}</Text>
      <Text style={styles.subtitle}>{t('bookings.request.subtitle')}</Text>

      {!eligibility.ok ? (
        <Text style={styles.message}>{t(`bookings.blocked.${eligibility.reason}`)}</Text>
      ) : null}

      {isError ? <Text style={styles.errorMessage}>{t(getBookingErrorMessageKey(error))}</Text> : null}

      <BookingRequestButton
        isPending={isPending}
        disabled={!eligibility.ok}
        onPress={() =>
          requestOnce({
            actorId: actor.id,
            listingId,
            listingOwnerId,
          })
        }
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    marginBottom: 12,
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    marginBottom: 24,
    fontSize: 16,
    lineHeight: 24,
  },
  message: {
    marginBottom: 16,
    fontSize: 14,
    lineHeight: 20,
    color: '#92400E',
  },
  errorMessage: {
    marginBottom: 16,
    fontSize: 14,
    lineHeight: 20,
    color: '#991B1B',
  },
});
