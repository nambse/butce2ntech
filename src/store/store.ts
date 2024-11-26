import { configureStore } from '@reduxjs/toolkit'
import transactionsReducer from './slices/transactionsSlice'
import budgetsReducer from './slices/budgetsSlice'
import settingsReducer, { settingsMiddleware } from './slices/settingsSlice'
import notificationsReducer from './slices/notificationsSlice'
import searchReducer from './slices/searchSlice'
import type { TransactionsState } from './slices/transactionsSlice'
import type { BudgetsState } from './slices/budgetsSlice'
import type { SettingsState } from './slices/settingsSlice'
import type { NotificationsState } from './slices/notificationsSlice'
import type { SearchState } from './slices/searchSlice'

// Define the root state type
export interface RootState {
  transactions: TransactionsState;
  budgets: BudgetsState;
  settings: SettingsState;
  notifications: NotificationsState;
  search: SearchState;
}

// Load state from localStorage
const loadState = (): RootState | undefined => {
  try {
    const serializedState = localStorage.getItem('appState')
    if (serializedState === null) {
      return undefined
    }
    const state = JSON.parse(serializedState)
    
    // Clean up any old format or duplicate settings
    localStorage.removeItem('settings')
    localStorage.removeItem('theme')
    localStorage.removeItem('budgetAppState')
    
    return state
  } catch (err) {
    return undefined
  }
}

// Save state to localStorage
const saveState = (state: RootState) => {
  try {
    const serializedState = JSON.stringify(state)
    localStorage.setItem('appState', serializedState)
    // Dispatch custom event for debug panel
    window.dispatchEvent(new Event('localStorageChange'))
  } catch (err) {
    console.error('Error saving state:', err)
  }
}

// Combine reducers
const rootReducer = {
  transactions: transactionsReducer,
  budgets: budgetsReducer,
  settings: settingsReducer,
  notifications: notificationsReducer,
  search: searchReducer,
}

export const store = configureStore({
  reducer: rootReducer,
  preloadedState: loadState(),
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(settingsMiddleware)
})

// Save state to localStorage whenever it changes
store.subscribe(() => {
  saveState(store.getState())
})

export type AppDispatch = typeof store.dispatch 