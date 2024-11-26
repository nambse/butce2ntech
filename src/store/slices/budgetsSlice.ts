import { createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit'
import type { RootState } from '../store'
import { AppDispatch } from '../store'
import { checkInitialBudgetAlert } from '@/lib/budget-alerts'
import { addNotification } from './notificationsSlice'
import type { Budget, BudgetFormData } from '@/types/budget'

export interface BudgetsState {
  items: Budget[]
}

const initialState: BudgetsState = {
  items: [],
}

export const isBudgetActive = (budget: Budget) => {
  const now = new Date()
  const startDate = new Date(budget.startDate)
  const endDate = budget.endDate ? new Date(budget.endDate) : null
  return startDate <= now && (!endDate || endDate >= now)
}

export const isBudgetExpired = (budget: Budget): boolean => {
  const now = new Date()
  const endDate = budget.endDate ? new Date(budget.endDate) : null
  return endDate ? endDate < now : false
}

const budgetsSlice = createSlice({
  name: 'budgets',
  initialState,
  reducers: {
    setBudgets: (state, action: PayloadAction<Budget[]>) => {
      state.items = action.payload
    },
    addBudget: (state, action: PayloadAction<BudgetFormData>) => {
      const existingActiveBudget = state.items.find(item => 
        item.categoryId === action.payload.categoryId && 
        !isBudgetExpired(item)
      )

      if (existingActiveBudget) {
        throw new Error(`Bu kategori için zaten aktif bir bütçe bulunuyor`)
      }

      const now = new Date().toISOString()
      state.items.push({
        ...action.payload,
        id: `${action.payload.categoryId}-${Date.now()}`,
        createdAt: now,
        updatedAt: now,
      })
    },
    updateBudget: (state, action: PayloadAction<Budget>) => {
      const index = state.items.findIndex(item => item.id === action.payload.id)
      if (index !== -1) {
        const hasAnotherActiveBudget = state.items.some(item => 
          item.categoryId === action.payload.categoryId && 
          item.id !== action.payload.id && 
          !isBudgetExpired(item)
        )

        if (hasAnotherActiveBudget) {
          throw new Error(`Bu kategori için zaten aktif bir bütçe bulunuyor`)
        }

        state.items[index] = {
          ...action.payload,
          updatedAt: new Date().toISOString(),
        }
      }
    },
    deleteBudget: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload)
    },
  },
})

const selectBudgetsState = (state: RootState) => state.budgets

export const selectBudgets = createSelector(
  [selectBudgetsState],
  (budgets) => budgets.items
)

export const selectBudgetById = (id: string) =>
  createSelector(
    [selectBudgets],
    (budgets) => budgets.find(budget => budget.id === id)
  )

export const selectActiveBudgets = createSelector(
  [selectBudgets],
  (budgets) => budgets.filter(budget => !isBudgetExpired(budget))
)

export const selectExpiredBudgets = createSelector(
  [selectBudgets],
  (budgets) => budgets.filter(budget => isBudgetExpired(budget))
)

export const selectActiveBudgetByCategory = (categoryId: string) =>
  createSelector(
    [selectActiveBudgets],
    (budgets) => budgets.find(budget => budget.categoryId === categoryId)
  )

export const addBudgetWithAlert = (budgetData: BudgetFormData) => {
  return (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(addBudget(budgetData))

    const state = getState()
    const { settings, transactions } = state
    const { notifications } = settings.settings

    if (!notifications.enabled || !notifications.budgetAlerts) return

    const budget = state.budgets.items.find(b => b.categoryId === budgetData.categoryId)
    if (!budget) return

    const alert = checkInitialBudgetAlert(
      budget,
      transactions.items,
      settings.settings.categories,
      notifications.budgetAlertThreshold
    )

    if (alert) {
      dispatch(addNotification(alert))
    }
  }
}

export const updateBudgetWithAlert = (budget: Budget) => {
  return (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(updateBudget(budget))

    const state = getState()
    const { settings, transactions } = state
    const { notifications } = settings.settings

    if (!notifications.enabled || !notifications.budgetAlerts) return

    const alert = checkInitialBudgetAlert(
      budget,
      transactions.items,
      settings.settings.categories,
      notifications.budgetAlertThreshold
    )

    if (alert) {
      dispatch(addNotification(alert))
    }
  }
}

export const { addBudget, updateBudget, deleteBudget, setBudgets } = budgetsSlice.actions
export default budgetsSlice.reducer 