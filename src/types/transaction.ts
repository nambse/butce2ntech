export type TransactionType = "income" | "expense"

export interface Transaction {
  id: string
  type: TransactionType
  amount: number
  category: string
  description: string
  date: string
  createdAt: string
  updatedAt: string
}

export interface TransactionFormData {
  type: TransactionType
  amount: number
  category: string
  description: string
  date: string
  store?: string
}

export interface TransactionStats {
  totalIncome: number
  totalExpense: number
  netAmount: number
  transactionCount: number
} 