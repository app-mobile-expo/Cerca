import { zodResolver } from '@hookform/resolvers/zod';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput } from 'react-native';
import { useTranslation } from 'react-i18next';

import type { BookingId } from '@/domain/bookings/booking';
import { canReviewBooking } from '@/domain/reviews/review.policy';
import { useAuth } from '@/presentation/auth/providers/auth-provider';
import { useBooking } from '@/presentation/bookings/hooks/use-booking';
import { getBookingErrorMessageKey } from '@/presentation/bookings/utils/booking-error-message';
import { ScreenContainer } from '@/presentation/shared/components/screen-container';

import { StarRatingInput } from '../components/star-rating-input';
import { useSubmitReview } from '../hooks/use-submit-review';
import { getReviewErrorMessageKey } from '../utils/review-error-message';
import { reviewFormSchema, type ReviewFormValues } from '../utils/review-form-schema';

// Pantalla para reseñar una reserva completada: vuelve a evaluar la política estrella aunque el enlace llegue directo
export function ReviewBookingScreen() {
  const { t } = useTranslation();
  const { actor } = useAuth();
  const { id } = useLocalSearchParams<{ id: BookingId }>();
  const { data: booking, isLoading, isError, error: bookingError, refetch } = useBooking(id);
  const { submitOnce, isPending, isError: isSubmitError, isSuccess, error: submitError } = useSubmitReview();

  const { control, handleSubmit, formState } = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: { rating: 0, comment: '' },
  });

  useEffect(() => {
    if (isSuccess) {
      router.replace(`/bookings/${id}`);
    }
  }, [isSuccess, id]);

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
        <Text style={styles.errorMessage}>{t(getBookingErrorMessageKey(bookingError))}</Text>
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

  if (!actor) {
    return (
      <ScreenContainer>
        <Text style={styles.title}>{t('review.title')}</Text>
        <Text style={styles.message}>{t('errors.unauthenticated')}</Text>
      </ScreenContainer>
    );
  }

  const eligibility = canReviewBooking(actor.id, booking, new Date());

  if (!eligibility.ok) {
    return (
      <ScreenContainer>
        <Text style={styles.title}>{t('review.title')}</Text>
        <Text style={styles.message}>{t(`review.blocked.${eligibility.reason}`)}</Text>
      </ScreenContainer>
    );
  }

  const currentActor = actor;
  const currentBooking = booking;

  function onSubmit(values: ReviewFormValues) {
    submitOnce({ actorId: currentActor.id, booking: currentBooking, rating: values.rating, comment: values.comment });
  }

  return (
    <ScreenContainer>
      <Text style={styles.title}>{t('review.title')}</Text>
      <Text style={styles.subtitle}>{t('review.subtitle')}</Text>

      <Controller
        control={control}
        name="rating"
        render={({ field }) => (
          <StarRatingInput value={field.value} onChange={field.onChange} disabled={isPending} />
        )}
      />
      {formState.errors.rating ? (
        <Text style={styles.fieldError}>{t(formState.errors.rating.message ?? 'errors.generic')}</Text>
      ) : null}

      <Controller
        control={control}
        name="comment"
        render={({ field }) => (
          <TextInput
            style={styles.input}
            multiline
            numberOfLines={4}
            editable={!isPending}
            placeholder={t('review.comment.placeholder')}
            value={field.value}
            onChangeText={field.onChange}
            maxFontSizeMultiplier={2}
          />
        )}
      />
      {formState.errors.comment ? (
        <Text style={styles.fieldError}>{t(formState.errors.comment.message ?? 'errors.generic')}</Text>
      ) : null}

      {isSubmitError ? <Text style={styles.fieldError}>{t(getReviewErrorMessageKey(submitError))}</Text> : null}

      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: isPending, busy: isPending }}
        disabled={isPending}
        style={({ pressed }) => [
          styles.button,
          isPending && styles.buttonDisabled,
          pressed && !isPending && styles.buttonPressed,
        ]}
        onPress={handleSubmit(onSubmit)}
      >
        {isPending ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.buttonText}>{t('review.submit.cta')}</Text>}
      </Pressable>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  title: {
    marginBottom: 8,
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    marginBottom: 20,
    fontSize: 16,
    lineHeight: 24,
  },
  message: {
    marginBottom: 16,
    fontSize: 16,
    lineHeight: 24,
    color: '#92400E',
  },
  fieldError: {
    marginTop: 8,
    marginBottom: 8,
    fontSize: 14,
    lineHeight: 20,
    color: '#991B1B',
  },
  input: {
    marginTop: 16,
    minHeight: 96,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    padding: 12,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  button: {
    marginTop: 24,
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
