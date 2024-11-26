import type { Budget } from "@/types/budget"
import type { Transaction } from "@/types/transaction"
import type { Category } from "@/types/category"
import { isBudgetExpired } from "@/lib/budget-utils"

export function checkBudgetAlerts(
  transaction: Transaction,
  budgets: Budget[],
  transactions: Transaction[],
  categories: Category[],
  notificationThreshold: number
) {
  if (transaction.type !== 'expense') return null

  const budget = budgets.find(b => b.categoryId === transaction.category)
  if (!budget || isBudgetExpired(budget.endDate)) return null

  const budgetStart = new Date(budget.startDate)
  const budgetEnd = budget.endDate ? new Date(budget.endDate) : null
  
  const categoryTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date)
    if (t.category !== transaction.category || t.type !== 'expense') return false
    
    const isAfterStart = transactionDate >= budgetStart
    const isBeforeEnd = budgetEnd ? transactionDate <= budgetEnd : true
    
    return isAfterStart && isBeforeEnd
  })

  const totalSpent = Math.abs(categoryTransactions.reduce((sum, t) => sum + t.amount, 0))
  const currentTransactionAmount = !transactions.includes(transaction) ? Math.abs(transaction.amount) : 0
  const totalWithCurrent = totalSpent + currentTransactionAmount
  const percentage = (totalWithCurrent / budget.limit) * 100

  const category = categories.find(c => c.id === transaction.category)
  if (!category) return null

  if (percentage >= notificationThreshold) {
    let message = ''
    if (percentage > 100) {
      message = `${category.label} kategorisinde bütçe limitini %${(percentage - 100).toFixed(0)} oranında aştınız!`
    } else if (percentage === 100) {
      message = `${category.label} kategorisinde bütçe limitine tam olarak ulaştınız!`
    } else {
      message = `${category.label} kategorisinde bütçe limitinin %${percentage.toFixed(0)}'ine ulaştınız.`
    }

    return {
      type: 'budget_alert' as const,
      title: `Bütçe Uyarısı: ${category.label}`,
      message,
      categoryId: category.id,
      data: {
        spent: totalWithCurrent,
        limit: budget.limit,
        percentage,
        categoryName: category.label
      }
    }
  }

  return null
}

export function checkInitialBudgetAlert(
  budget: Budget,
  transactions: Transaction[],
  categories: Category[],
  notificationThreshold: number
) {
  const categoryTransactions = transactions.filter(t => 
    t.category === budget.categoryId &&
    t.type === 'expense' &&
    new Date(t.date) >= new Date(budget.startDate) &&
    (!budget.endDate || new Date(t.date) <= new Date(budget.endDate))
  )

  const totalSpent = Math.abs(categoryTransactions.reduce((sum, t) => sum + t.amount, 0))
  const percentage = (totalSpent / budget.limit) * 100

  const category = categories.find(c => c.id === budget.categoryId)
  if (!category) return null

  if (percentage >= notificationThreshold) {
    return {
      type: 'budget_alert' as const,
      title: `Yeni Bütçe Uyarısı: ${category.label}`,
      message: percentage >= 100
        ? `Yeni oluşturduğunuz ${category.label} bütçesi şu an limit aşımında!`
        : `Yeni oluşturduğunuz ${category.label} bütçesi şu an limitin ${percentage.toFixed(0)}%'ine ulaşmış durumda.`,
      categoryId: category.id,
      data: {
        spent: totalSpent,
        limit: budget.limit,
        percentage,
        categoryName: category.label
      }
    }
  }

  return null
} 