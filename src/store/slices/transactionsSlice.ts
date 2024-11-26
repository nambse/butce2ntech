import { createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit'
import { checkBudgetAlerts } from '@/lib/budget-alerts'
import { addNotification } from './notificationsSlice'
import { AppDispatch, RootState } from '../store'
import type { Transaction, TransactionFormData } from '@/types/transaction'

export interface TransactionsState {
  items: Transaction[]
}

const initialState: TransactionsState = {
  items: [],
}

const transactionsSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    setTransactions: (state, action: PayloadAction<Transaction[]>) => {
      state.items = action.payload
    },
    _addTransaction: (state, action: PayloadAction<Transaction>) => {
      state.items.push(action.payload)
    },
    _updateTransaction: (state, action: PayloadAction<Transaction>) => {
      const index = state.items.findIndex(item => item.id === action.payload.id)
      if (index !== -1) {
        state.items[index] = action.payload
      }
    },
    deleteTransaction: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload)
    },
  },
})

const selectTransactionsState = (state: RootState) => state.transactions

export const selectTransactions = createSelector(
  [selectTransactionsState],
  (transactions) => transactions.items
)

export const selectTransactionsByType = (type: Transaction['type']) =>
  createSelector(
    [selectTransactions],
    (transactions) => transactions.filter(tx => tx.type === type)
  )

export const selectTransactionsByCategory = (categoryId: string) =>
  createSelector(
    [selectTransactions],
    (transactions) => transactions.filter(tx => tx.category === categoryId)
  )

export const selectRecentTransactions = (limit: number) =>
  createSelector(
    [selectTransactions],
    (transactions) => [...transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit)
  )

const { setTransactions, _addTransaction, _updateTransaction, deleteTransaction } = transactionsSlice.actions

export const addTransaction = (data: TransactionFormData) => {
  return (dispatch: AppDispatch, getState: () => RootState) => {
    const now = new Date().toISOString()
    const newTransaction: Transaction = {
      ...data,
      id: `transaction-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      amount: data.type === 'expense' ? -Math.abs(data.amount) : Math.abs(data.amount),
      createdAt: now,
      updatedAt: now
    }
    
    dispatch(_addTransaction(newTransaction))

    const state = getState()
    const { settings, budgets, transactions } = state
    const { notifications } = settings.settings

    if (notifications.enabled && notifications.budgetAlerts) {
      const alert = checkBudgetAlerts(
        newTransaction,
        budgets.items,
        transactions.items,
        settings.settings.categories,
        notifications.budgetAlertThreshold
      )

      if (alert) {
        dispatch(addNotification(alert))
      }
    }
  }
}

export const updateTransaction = (id: string, data: Partial<TransactionFormData>) => {
  return (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState()
    const existingTransaction = state.transactions.items.find(t => t.id === id)
    if (!existingTransaction) return

    const updatedTransaction: Transaction = {
      ...existingTransaction,
      ...data,
      amount: data.type 
        ? (data.type === 'expense' 
            ? -Math.abs(data.amount || existingTransaction.amount)
            : Math.abs(data.amount || existingTransaction.amount))
        : existingTransaction.amount,
      updatedAt: new Date().toISOString()
    }

    dispatch(_updateTransaction(updatedTransaction))

    const { settings, budgets, transactions } = state
    const { notifications } = settings.settings

    if (notifications.enabled && notifications.budgetAlerts) {
      const alert = checkBudgetAlerts(
        updatedTransaction,
        budgets.items,
        transactions.items,
        settings.settings.categories,
        notifications.budgetAlertThreshold
      )

      if (alert) {
        dispatch(addNotification(alert))
      }
    }
  }
}

export { setTransactions, deleteTransaction }
export default transactionsSlice.reducer 