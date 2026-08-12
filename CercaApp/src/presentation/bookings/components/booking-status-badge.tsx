import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import type { BookingStatus } from '@/domain/bookings/booking-status';

import { getBookingStatusLabelKey } from '../utils/booking-status-label';

type BookingStatusBadgeProps = {
  readonly status: BookingStatus;
};

// Pinta el estado de una reserva como texto (nunca solo color), con un tono de fondo distinto por variante
export function BookingStatusBadge({ status }: BookingStatusBadgeProps) {
  const { t } = useTranslation();

  return (
    <View style={[styles.badge, statusStyles[status.kind]]}>
      <Text style={[styles.text, statusTextStyles[status.kind]]}>
        {t(getBookingStatusLabelKey(status))}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  text: {
    fontSize: 13,
    fontWeight: '600',
  },
});

// NOTA: hexadecimales aquí porque NativeWind todavía no está instalado en el proyecto (deuda documentada en docs/US-05).
// Cuando exista el tema, esto debe volverse `className="bg-status-requested"` etc.
const statusStyles = StyleSheet.create({
  requested: { backgroundColor: '#FEF3C7' },
  accepted: { backgroundColor: '#D1FAE5' },
  declined: { backgroundColor: '#FEE2E2' },
  completed: { backgroundColor: '#DBEAFE' },
  cancelled: { backgroundColor: '#E5E7EB' },
});

const statusTextStyles = StyleSheet.create({
  requested: { color: '#92400E' },
  accepted: { color: '#065F46' },
  declined: { color: '#991B1B' },
  completed: { color: '#1E40AF' },
  cancelled: { color: '#374151' },
});
