import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { useTranslation } from 'react-i18next';

type BookingRequestButtonProps = {
  readonly onPress: () => void;
  readonly isPending: boolean;
  readonly disabled?: boolean;
};

// Botón de "solicitar reserva": se deshabilita mientras la mutación vuela para que un doble toque no envíe dos veces
export function BookingRequestButton({ onPress, isPending, disabled = false }: BookingRequestButtonProps) {
  const { t } = useTranslation();
  const isDisabled = isPending || disabled;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: isPending }}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        isDisabled && styles.buttonDisabled,
        pressed && !isDisabled && styles.buttonPressed,
      ]}
      onPress={onPress}
    >
      {isPending ? (
        <ActivityIndicator color="#ffffff" />
      ) : (
        <Text style={styles.buttonText}>{t('bookings.request.cta')}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: '#111827',
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
