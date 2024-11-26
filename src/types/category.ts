import { TransactionType } from "./transaction"

// Kategori veri tipleri
export interface Category {
  id: string
  label: string
  type: TransactionType
  icon: React.ReactNode
  color?: string
  description?: string
}

// Kategori istatistikleri için tipler
export interface CategoryStats {
  categoryId: string
  total: number
  count: number
  percentage: number
} 