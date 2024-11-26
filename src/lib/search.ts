import { Transaction } from '@/types/transaction'
import { formatCurrency } from './format'

// Metin içinde arama yapma yardımcı fonksiyonu
const matchText = (text: string, query: string): boolean => {
  return text.toLowerCase().includes(query.toLowerCase())
}

// Para birimi formatını kaldırma (örn: "₺1.234,56" -> "1234.56")
const normalizeAmount = (amount: string): string => {
  return amount.replace(/[₺,.]/g, '')
}

/**
 * İşlemler içinde arama yapma
 * @param transactions Aranacak işlemler
 * @param query Arama sorgusu
 * @returns Eşleşen işlemler
 */
export const searchTransactions = (
  transactions: Transaction[],
  query: string
): Transaction[] => {
  // Boş sorgu kontrolü
  if (!query.trim()) {
    return []
  }

  const normalizedQuery = query.trim().toLowerCase()
  
  // Tutar araması için sorguyu normalize et
  const amountQuery = normalizeAmount(normalizedQuery)

  return transactions.filter(transaction => {
    // Açıklama araması
    if (transaction.description && 
        matchText(transaction.description, normalizedQuery)) {
      return true
    }

    // Kategori araması
    if (matchText(transaction.category, normalizedQuery)) {
      return true
    }

    // Mağaza araması
    if (transaction.store && 
        matchText(transaction.store, normalizedQuery)) {
      return true
    }

    // Tutar araması
    const transactionAmount = formatCurrency(Math.abs(transaction.amount))
    if (matchText(normalizeAmount(transactionAmount), amountQuery)) {
      return true
    }

    return false
  })
}
