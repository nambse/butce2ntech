import { format } from "date-fns"
import { tr } from "date-fns/locale"
import { BudgetPeriod } from "@/types/budget"
import { BadgeVariant } from "@/types/ui"

// Bütçe durumu ile ilgili yardımcı fonksiyonlar
export function getBudgetStatusColor(percentage: number, isExpired: boolean): string {
  if (isExpired) return "bg-muted"
  if (percentage > 100) return "bg-error-high-contrast"
  if (percentage === 100) return "bg-error"
  if (percentage >= 80) return "bg-warning"
  return "bg-success"
}

export function getBudgetTextColor(percentage: number, isExpired: boolean): string {
  if (isExpired) return "text-muted-foreground"
  if (percentage > 100) return "text-error-high-contrast"
  if (percentage === 100) return "text-error"
  if (percentage >= 80) return "text-warning"
  return "text-success"
}

export function getCategoryIconColor(percentage: number, isExpired: boolean): string {
  if (isExpired) return "bg-muted text-muted-foreground"
  if (percentage > 100) return "bg-error-high-contrast/10"
  if (percentage === 100) return "bg-error/10"
  if (percentage >= 80) return "bg-warning/10"
  return "bg-success/10"
}

// Bütçe badge'i için yardımcı fonksiyonlar
export function getBudgetBadgeContent(percentage: number, isExpired: boolean): string {
  if (isExpired) return "Süresi Doldu"
  if (percentage > 100) return "Limit Aşıldı"
  if (percentage === 100) return "Limite Ulaşıldı"
  return `${percentage.toFixed(0)}%`
}

export function getBudgetBadgeVariant(percentage: number, isExpired: boolean): BadgeVariant {
  if (isExpired) return "secondary"
  if (percentage > 100) return "error"
  if (percentage === 100) return "error"
  if (percentage >= 80) return "warning"
  return "success"
}

// Tarih formatı ve periyot etiketleri için yardımcı fonksiyonlar
export function formatBudgetDate(dateString: string): string {
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return 'Geçersiz tarih'
    return format(date, 'd MMM yyyy', { locale: tr })
  } catch {
    return 'Geçersiz tarih'
  }
}

export function getPeriodLabel(period: BudgetPeriod): string {
  switch (period) {
    case 'weekly': return 'Haftalık Bütçe'
    case 'monthly': return 'Aylık Bütçe'
    case 'yearly': return 'Yıllık Bütçe'
    default: return 'Özel Bütçe'
  }
}

// Bütçe hesaplamaları için yardımcı fonksiyonlar
export function calculateBudgetPercentage(spent: number, limit: number): number {
  return (spent / limit) * 100
}

export function calculateRemainingBudget(spent: number, limit: number): number {
  return Math.max(0, limit - spent)
}

export function isBudgetExpired(endDate: string | undefined): boolean {
  if (!endDate) return false
  return new Date(endDate) < new Date()
} 