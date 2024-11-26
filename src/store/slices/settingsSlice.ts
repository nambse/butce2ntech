import { createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit'
import type { RootState } from '../store'

export interface Category {
  id: string
  label: string
  icon: string
  type: 'income' | 'expense'
  color?: string
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system'
  notifications: {
    enabled: boolean
    budgetAlerts: boolean
    savingTips: boolean
    budgetAlertThreshold: number
  }
  categories: Category[]
  developer: {
    enabled: boolean
  }
}

export interface SettingsState {
  settings: AppSettings
}

const initialSettings: AppSettings = {
  theme: 'system',
  notifications: {
    enabled: true,
    budgetAlerts: true,
    savingTips: true,
    budgetAlertThreshold: 80,
  },
  categories: [
    // Default income categories
    { id: 'maas', label: 'Maaş', icon: '💰', type: 'income' },
    { id: 'ek-gelir', label: 'Ek Gelir', icon: '💵', type: 'income' },
    { id: 'yatirim', label: 'Yatırım Geliri', icon: '📈', type: 'income' },
    { id: 'kira', label: 'Kira Geliri', icon: '🏠', type: 'income' },
    
    // Default expense categories
    { id: 'market', label: 'Market', icon: '🛒', type: 'expense' },
    { id: 'faturalar', label: 'Faturalar', icon: '📄', type: 'expense' },
    { id: 'ulasim', label: 'Ulaşım', icon: '🚌', type: 'expense' },
    { id: 'saglik', label: 'Sağlık', icon: '💊', type: 'expense' },
    { id: 'egitim', label: 'Eğitim', icon: '📚', type: 'expense' },
    { id: 'eglence', label: 'Eğlence', icon: '🎮', type: 'expense' },
    { id: 'giyim', label: 'Giyim', icon: '👕', type: 'expense' },
    { id: 'diger', label: 'Diğer', icon: '📦', type: 'expense' },
  ],
  developer: {
    enabled: false
  }
}

// Available emoji icons for categories
export const availableIcons = [
  // Income icons
  '💰', '💵', '💸', '📈', '🏠', '💳', '🏦', '💎', '🎁', '🤑',
  // Expense icons
  '🛒', '📄', '🚌', '💊', '📚', '🎮', '👕', '📦', '🍽️', '🏥',
  '🚗', '⛽', '🏠', '📱', '💻', '🎭', '✈️', '🏋️', '💄', '🎬',
  '🎵', '🐕', '🏃', '🎨', '🎪', '🎯', '🎲', '🎹', '📷', '🎁'
]

// Load initial state from localStorage if available
const loadInitialState = (): SettingsState => {
  if (typeof window === 'undefined') return { settings: initialSettings }
  
  try {
    const savedSettings = localStorage.getItem('settings')
    if (savedSettings) {
      return JSON.parse(savedSettings)
    }
  } catch (error) {
    console.error('Failed to load settings from localStorage:', error)
  }
  
  return { settings: initialSettings }
}

export const settingsSlice = createSlice({
  name: 'settings',
  initialState: loadInitialState(),
  reducers: {
    updateTheme: (state, action: PayloadAction<AppSettings['theme']>) => {
      state.settings.theme = action.payload
    },
    updateNotificationSettings: (
      state,
      action: PayloadAction<Partial<AppSettings['notifications']>>
    ) => {
      state.settings.notifications = {
        ...state.settings.notifications,
        ...action.payload,
      }
    },
    addCategory: (state, action: PayloadAction<Omit<Category, 'id'>>) => {
      const id = action.payload.label
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .concat('-', Date.now().toString())

      state.settings.categories.push({
        ...action.payload,
        id,
      })
    },
    updateCategory: (state, action: PayloadAction<Category>) => {
      const index = state.settings.categories.findIndex(cat => cat.id === action.payload.id)
      if (index !== -1) {
        state.settings.categories[index] = action.payload
      }
    },
    deleteCategory: (state, action: PayloadAction<string>) => {
      state.settings.categories = state.settings.categories.filter(
        cat => cat.id !== action.payload
      )
    },
    reorderCategories: (state, action: PayloadAction<{ fromIndex: number; toIndex: number }>) => {
      const { fromIndex, toIndex } = action.payload
      const [movedCategory] = state.settings.categories.splice(fromIndex, 1)
      state.settings.categories.splice(toIndex, 0, movedCategory)
    },
    updateSettings: (state, action: PayloadAction<Partial<AppSettings>>) => {
      state.settings = {
        ...state.settings,
        ...action.payload,
      }
    },
  },
})

// Middleware to save settings to localStorage
export const settingsMiddleware = (store: any) => (next: any) => (action: any) => {
  const result = next(action)
  
  if (action.type?.startsWith('settings/')) {
    const state = store.getState()
    try {
      localStorage.setItem('settings', JSON.stringify(state.settings))
      // Dispatch custom event
      window.dispatchEvent(new Event('localStorageChange'))
    } catch (error) {
      console.error('Failed to save settings to localStorage:', error)
    }
  }
  
  return result
}

export const {
  updateTheme,
  updateNotificationSettings,
  addCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
  updateSettings,
} = settingsSlice.actions

// Memoized Selectors
const selectSettingsState = (state: RootState) => state.settings

export const selectCategories = createSelector(
  [selectSettingsState],
  (settings) => settings.settings.categories
)

export const selectCategoriesByType = (type: 'income' | 'expense') =>
  createSelector(
    [selectCategories],
    (categories) => categories.filter(cat => cat.type === type)
  )

export default settingsSlice.reducer