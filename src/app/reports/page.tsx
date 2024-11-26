"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ReportIncomeTrend } from "@/components/reports/report-income-expense-trend"
import { ReportExpenseByCategory } from "@/components/reports/report-expense-by-category"
import { ReportBudgetProgress } from "@/components/reports/report-budget-progress"
import { useAppSelector } from "@/store/hooks"
import { selectCategoriesByType } from "@/store/slices/settingsSlice"
import { format } from "date-fns"
import { tr } from 'date-fns/locale'
import { formatCurrency } from "@/lib/format"
import { ClientOnly } from "@/components/client-only"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { DateRange } from "react-day-picker"
import { useState } from "react"
import { 
  BanknoteIcon,
  WalletIcon,
  BarChart3Icon
} from "lucide-react"
import { cn } from "@/lib/utils"

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState<DateRange>()
  
  const transactions = useAppSelector((state) => state.transactions.items)
  const budgets = useAppSelector((state) => state.budgets.items)
  const expenseCategories = useAppSelector(selectCategoriesByType('expense'))

  // Filter transactions based on selected date range
  const filteredTransactions = transactions.filter(t => {
    if (!dateRange?.from) return true
    const transactionDate = new Date(t.date)
    const start = dateRange.from
    const end = dateRange.to || dateRange.from

    return transactionDate >= start && transactionDate <= end
  })

  // Calculate financial metrics
  const income = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const expenses = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0)

  const savings = income - expenses
  const savingsRate = income > 0 ? (savings / income) * 100 : 0

  // Calculate budget health score (0-100)
  const budgetHealthScore = budgets.reduce((score, budget) => {
    const spent = filteredTransactions
      .filter(t => t.category === budget.categoryId && t.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)
    
    const percentage = (spent / budget.limit) * 100
    if (percentage <= 80) return score + 25 // Healthy
    if (percentage <= 100) return score + 15 // Warning
    return score + 5 // Over budget
  }, 0) / Math.max(budgets.length, 1)

  // Financial status cards data
  const statusCards = [
    {
      title: "Toplam Gelir",
      value: income,
      icon: BanknoteIcon,
      iconClass: "text-income",
      valueClass: "text-income",
      description: dateRange?.from 
        ? `${format(dateRange.from, 'dd MMM', { locale: tr })} - ${format(dateRange.to || dateRange.from, 'dd MMM', { locale: tr })}` 
        : 'Tüm Zamanlar'
    },
    {
      title: "Toplam Gider",
      value: expenses,
      icon: WalletIcon,
      iconClass: "text-expense",
      valueClass: "text-expense",
      description: dateRange?.from 
        ? `${format(dateRange.from, 'dd MMM', { locale: tr })} - ${format(dateRange.to || dateRange.from, 'dd MMM', { locale: tr })}` 
        : 'Tüm Zamanlar'
    },
    {
      title: "Net Tasarruf",
      value: savings,
      icon: WalletIcon,
      iconClass: savings >= 0 ? "text-success" : "text-error",
      valueClass: savings >= 0 ? "text-success" : "text-error",
      description: `Gelirin %${Math.abs(savingsRate).toFixed(1)}'i`
    },
    {
      title: "Bütçe Sağlığı",
      value: `${budgetHealthScore.toFixed(0)}%`,
      icon: BarChart3Icon,
      iconClass: cn(
        budgetHealthScore >= 80 ? "text-success" :
        budgetHealthScore >= 60 ? "text-warning" :
        "text-error"
      ),
      valueClass: cn(
        budgetHealthScore >= 80 ? "text-success" :
        budgetHealthScore >= 60 ? "text-warning" :
        "text-error"
      ),
      description: budgetHealthScore >= 80 ? "Sağlıklı" :
                  budgetHealthScore >= 60 ? "Dikkatli Olun" :
                  "İyileştirme Gerekli"
    }
  ]

  return (
    <ClientOnly>
    <div className="space-y-6 pt-4">
      {/* Header with Period Selection */}
      <Card className="border-dashed">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <p className="text-sm text-foreground">
                Raporları görüntülemek için bir tarih aralığı seçin veya tüm zamanları görüntülemek için seçimi boş bırakın. 
                <span className="block mt-1 text-muted-foreground/80">
                  *Seçtiğiniz tarih aralığına göre gelir-gider trendleri, kategori bazlı harcamalar ve bütçe durumunuz otomatik olarak güncellenecektir.
                </span>
              </p>
            <DateRangePicker
              date={dateRange}
              onDateChange={setDateRange}
            />
          </div>
        </CardContent>
      </Card>

      {/* Financial Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statusCards.map((card, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <card.icon className={cn("h-4 w-4", card.iconClass)} />
            </CardHeader>
            <CardContent>
              <div className={cn("text-2xl font-bold", card.valueClass)}>
                {typeof card.value === 'number' ? formatCurrency(card.value) : card.value}
              </div>
              <p className="text-xs text-muted-foreground">
                {card.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2">
          <ReportIncomeTrend 
            className="md:col-span-2"
            dateRange={dateRange}
          />
          <ReportExpenseByCategory 
            dateRange={dateRange}
          />
          <ReportBudgetProgress 
            dateRange={dateRange}
          />
        </div>
      </div>
    </ClientOnly>
  )
} 