import { format } from 'date-fns'
import { tr } from 'date-fns/locale'

export const formatDate = (date: Date | string) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return format(dateObj, 'dd MMMM yyyy', { locale: tr })
}

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    currencyDisplay: 'symbol',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  .format(amount)
  .replace('₺', '')
  .trim() + ' ₺'
} 