import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

type StarRatingInputProps = {
  readonly value: number;
  readonly onChange: (value: number) => void;
  readonly disabled?: boolean;
};

const STAR_VALUES = [1, 2, 3, 4, 5] as const;

// Selector de calificación de 1 a 5 estrellas: cada estrella es un botón de 44x44 con su propia etiqueta accesible
export function StarRatingInput({ value, onChange, disabled = false }: StarRatingInputProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.row}>
      {STAR_VALUES.map((starValue) => (
        <Pressable
          key={starValue}
          accessibilityRole="button"
          accessibilityLabel={t('review.rating.starLabel', { starNumber: starValue })}
          accessibilityState={{ selected: starValue <= value, disabled }}
          disabled={disabled}
          hitSlop={8}
          style={styles.star}
          onPress={() => onChange(starValue)}
        >
          <Text style={[styles.starGlyph, starValue <= value && styles.starGlyphFilled]}>★</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 4,
  },
  star: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  starGlyph: {
    fontSize: 32,
    color: '#D1D5DB',
  },
  // NOTA: hexadecimales aquí porque NativeWind todavía no está instalado en el proyecto (deuda documentada en docs/US-05).
  starGlyphFilled: {
    color: '#F59E0B',
  },
});
