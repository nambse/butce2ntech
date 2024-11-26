// Bildirim tipleri
export type NotificationType = 
  | "budget_alert" 
  | "saving_tip" 
  | "system"

// Bildirim veri tipleri
export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  read: boolean
  categoryId?: string
  data?: {
    spent?: number
    limit?: number
    percentage?: number
    categoryName?: string
  }
  createdAt: string
} 