import { BadgeVariant } from "./ui"

export type BudgetPeriod = 'weekly' | 'monthly' | 'yearly' | 'manual'

export interface Budget {
  id: string
  categoryId: string
  category: string
  limit: number
  period: BudgetPeriod
  startDate: string
  endDate?: string
  createdAt: string
  updatedAt: string
}

export interface BudgetStatus {
  percentage: number
  isExpired: boolean
  isOverBudget: boolean
  isAtLimit: boolean
  isNearLimit: boolean
}

export interface BudgetCalculation {
  spent: number
  remaining: number
  percentage: number
  isExpired: boolean
}

export interface BudgetBadgeProps {
  variant: BadgeVariant
  content: string
}

export interface BudgetFormData {
  categoryId: string
  category: string
  limit: number
  period: BudgetPeriod
  startDate: string
  endDate?: string
} 