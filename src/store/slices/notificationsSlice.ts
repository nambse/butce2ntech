import { createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit'
import type { RootState } from '../store'

export interface Notification {
  id: string
  type: 'budget_alert' | 'saving_tip' | 'system'
  title: string
  message: string
  categoryId?: string
  read: boolean
  createdAt: string
  data?: {
    spent?: number
    limit?: number
    percentage?: number
    categoryName?: string
  }
}

export interface NotificationsState {
  items: Notification[]
}

const initialState: NotificationsState = {
  items: [],
}

export const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id' | 'read' | 'createdAt'>>) => {
      const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      
      state.items.push({
        ...action.payload,
        id,
        read: false,
        createdAt: new Date().toISOString(),
      })
    },
    markAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.items.find(item => item.id === action.payload)
      if (notification) {
        notification.read = true
      }
    },
    markAllAsRead: (state) => {
      state.items.forEach(notification => {
        notification.read = true
      })
    },
    deleteNotification: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload)
    },
    clearAllNotifications: (state) => {
      state.items = []
    },
  },
})

// Base selector
const selectNotificationsState = (state: RootState) => state.notifications

// Memoized selectors
export const selectUnreadNotifications = createSelector(
  [selectNotificationsState],
  (notifications) => notifications.items.filter(notification => !notification.read)
)

export const selectNotificationsByType = (type: Notification['type']) =>
  createSelector(
    [selectNotificationsState],
    (notifications) => notifications.items.filter(notification => notification.type === type)
  )

export const {
  addNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
} = notificationsSlice.actions

export default notificationsSlice.reducer 