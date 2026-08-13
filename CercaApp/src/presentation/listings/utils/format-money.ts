import type { Money } from '@/domain/shared/money';

export function formatMoney(money: Money, locale = 'es-CO'): string {
  const formatter = new Intl.NumberFormat(locale, { style: 'currency', currency: money.currency });
  const fractionDigits = formatter.resolvedOptions().maximumFractionDigits ?? 2;
  const majorAmount = money.amountMinor / 10 ** fractionDigits;
  return formatter.format(majorAmount);
}
