"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { IncomeExpenseTrend } from "@/components/charts/income-expense-trend"
import { ExpenseByCategory } from "@/components/charts/expense-by-category"
import { BudgetProgress } from "@/components/charts/budget-progress"
import { LatestTransactions } from "@/components/transactions/latest-transactions"
import { useAppSelector } from "@/store/hooks"
import { selectCategoriesByType } from "@/store/slices/settingsSlice"
import { startOfMonth, endOfMonth } from "date-fns"
import { formatCurrency } from "@/lib/format"
import { ClientOnly } from "@/components/client-only"
import { cn } from "@/lib/utils"

export default function OverviewPage() {
  const transactions = useAppSelector((state) => state.transactions.items)

  // Bu ayki toplamları hesapla
  const currentMonthStart = startOfMonth(new Date())
  const currentMonthEnd = endOfMonth(new Date())
  const currentMonthTransactions = transactions.filter(t => {
    const date = new Date(t.date)
    return date >= currentMonthStart && date <= currentMonthEnd
  })

  const currentMonthIncome = currentMonthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const currentMonthExpense = currentMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0)

  const currentMonthNet = currentMonthIncome - currentMonthExpense

  // Son işlemleri al
  const recentTransactions = [...transactions]
    .sort((a, b) => {
      const dateA = new Date(a.date).getTime()
      const dateB = new Date(b.date).getTime()
      if (dateA === dateB) {
        return b.id.localeCompare(a.id)
      }
      return dateB - dateA
    })
    .slice(0, 5)

  return (
    <div className="space-y-6 pt-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Toplam Gelir</CardTitle>
          </CardHeader>
          <CardContent>
            <ClientOnly>
              <div className="text-2xl font-bold text-income">
                {formatCurrency(currentMonthIncome)}
              </div>
            </ClientOnly>
            <p className="text-xs text-muted-foreground">
              Bu ay için toplam geliriniz
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Toplam Gider</CardTitle>
          </CardHeader>
          <CardContent>
            <ClientOnly>
              <div className="text-2xl font-bold text-expense">
                {formatCurrency(currentMonthExpense)}
              </div>
            </ClientOnly>
            <p className="text-xs text-muted-foreground">
              Bu ay için toplam gideriniz
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Net Durum</CardTitle>
          </CardHeader>
          <CardContent>
            <ClientOnly>
              <div className={cn(
                "text-2xl font-bold",
                currentMonthNet > 0 ? "text-success" : "text-error"
              )}>
                {formatCurrency(currentMonthNet)}
              </div>
            </ClientOnly>
            <p className="text-xs text-muted-foreground">
              Bu ay için net durumunuz
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <ClientOnly>
          <LatestTransactions transactions={recentTransactions} />
          <ExpenseByCategory />
        </ClientOnly>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <ClientOnly>
          <IncomeExpenseTrend className="md:col-span-1" />
          <BudgetProgress className="md:col-span-1" />
        </ClientOnly>
      </div>
    </div>
  )
} 