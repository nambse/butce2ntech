"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from "recharts"
import { formatCurrency } from "@/lib/format"
import { cn } from "@/lib/utils"
import { AlertTriangleIcon, AlertCircleIcon, WalletIcon, TrendingDownIcon, ArrowUpCircle } from "lucide-react"
import { useAppSelector } from '@/store/hooks'
import { selectCategoriesByType } from "@/store/slices/settingsSlice"
import {
  getBudgetBadgeContent,
  calculateBudgetPercentage,
  isBudgetExpired
} from "@/lib/budget-utils"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import type { DateRange } from "react-day-picker"
import { startOfDay, endOfDay } from "date-fns"

// Grafik verisi için tip tanımı
interface ChartData {
  category: string
  categoryId: string
  spent: number
  limit: number
  percentage: number
  period: string
  startDate: string
  endDate?: string
}

// Bütçe öngörüsü için tip tanımı
interface BudgetInsight {
  type: 'warning' | 'success' | 'error' | 'info'
  message: string
  suggestion?: string
  icon: any // TODO: Icon tipini daha spesifik hale getir
}

interface ReportBudgetProgressProps {
  className?: string
  dateRange?: DateRange
}

export function ReportBudgetProgress({ className, dateRange }: ReportBudgetProgressProps) {
  // Redux store'dan verileri al
  const transactions = useAppSelector((state) => state.transactions.items)
  const budgets = useAppSelector((state) => state.budgets.items)
  const expenseCategories = useAppSelector(selectCategoriesByType('expense'))

  // Seçilen tarih aralığına göre işlemleri filtrele
  const filteredTransactions = transactions.filter(t => {
    if (!dateRange?.from) return true
    const transactionDate = new Date(t.date)
    const start = startOfDay(dateRange.from)
    const end = endOfDay(dateRange.to || dateRange.from)
    return transactionDate >= start && transactionDate <= end
  })

  // Grafik verilerini hazırla
  const chartData: ChartData[] = budgets
    .filter(budget => {
      // Süresi dolmuş bütçeleri kontrol et
      if (isBudgetExpired(budget.endDate)) return false

      // Tarih aralığı seçilmemişse tüm aktif bütçeleri göster
      if (!dateRange?.from) return true

      // Bütçe periyodunun seçilen tarih aralığıyla kesişimini kontrol et
      const budgetStart = new Date(budget.startDate)
      const budgetEnd = budget.endDate ? new Date(budget.endDate) : new Date()
      const selectedStart = startOfDay(dateRange.from)
      const selectedEnd = endOfDay(dateRange.to || dateRange.from)

      return budgetStart <= selectedEnd && budgetEnd >= selectedStart
    })
    .map(budget => {
      const category = expenseCategories.find(c => c.id === budget.categoryId)
      
      // Bütçe için toplam harcamayı hesapla
      const spent = filteredTransactions
        .filter(t => t.category === budget.categoryId && t.type === 'expense')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0)

      const periodLabels = {
        weekly: 'Haftalık',
        monthly: 'Aylık',
        yearly: 'Yıllık',
        manual: 'Manuel'
      }

      return {
        category: category?.label || budget.category,
        categoryId: budget.categoryId,
        spent,
        limit: budget.limit,
        percentage: calculateBudgetPercentage(spent, budget.limit),
        period: periodLabels[budget.period],
        startDate: budget.startDate,
        endDate: budget.endDate
      }
    })
    .sort((a, b) => b.percentage - a.percentage) // Yüzdeye göre azalan sıralama

  // Bütçe öngörülerini oluştur
  const insights = generateBudgetInsights(chartData)

  // Veri yoksa bilgilendirme mesajı göster
  if (chartData.length === 0) {
    return (
      <Card className={cn("min-h-[480px]", className)}>
        <CardHeader>
          <CardTitle>Bütçe Durumu</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[440px] flex flex-col items-center justify-center text-center">
            <WalletIcon className="h-12 w-12 text-muted-foreground/20" />
            <p className="mt-4 text-sm text-muted-foreground">
              {dateRange?.from ? (
                <>
                  {format(dateRange.from, 'dd MMM yyyy', { locale: tr })}
                  {' - '}
                  {format(dateRange.to || dateRange.from, 'dd MMM yyyy', { locale: tr })}
                  <br />
                  tarihleri arasında aktif bütçe bulunmuyor
                </>
              ) : (
                'Aktif bütçe bulunmuyor'
              )}
            </p>
            <p className="mt-2 text-xs text-muted-foreground/80">
              Bütçe eklemek için Bütçeler sayfasını ziyaret edin
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn("min-h-[425px]", className)}>
      <CardHeader>
        <CardTitle>Bütçe Durumu</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="h-[425px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 20, right: 30, left: -10, bottom: 20 }}
              >
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  horizontal={false} 
                  className="stroke-border"
                  opacity={0.5}
                />
                <defs>
                  {renderGradients()}
                </defs>
                <XAxis
                  type="number"
                  className="text-sm text-muted-foreground"
                  tickFormatter={formatCurrency}
                  domain={[0, 'dataMax']}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="category"
                  className="text-sm text-muted-foreground"
                  width={140}
                  tick={(props) => <CustomTick {...props} data={chartData} />}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: 'hsl(var(--muted)/0.1)' }}
                  content={(props) => <CustomTooltip {...props} />}
                />
                <Bar 
                  dataKey="spent"
                  radius={[6, 6, 6, 6]}
                >
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`}
                      fill={`url(#${getGradientId(entry.percentage)})`}
                      className="transition-colors duration-200 drop-shadow-sm"
                    />
                  ))}
                </Bar>
                <ReferenceLine
                  x={0}
                  stroke="hsl(var(--muted-foreground))"
                  strokeDasharray="3 3"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {insights.length > 0 && (
            <div className="pt-4 border-t space-y-3">
              <h4 className="font-medium">Bütçe Analizi</h4>
              <div className="grid gap-2 text-sm">
                {insights.map((insight, index) => (
                    <div 
                        key={index}
                        className={cn(
                            "flex gap-2 p-2.5 rounded-lg border",
                            insight.type === 'success' && "bg-success/10 border-success/20 text-foreground [&_svg]:text-success",
                            insight.type === 'error' && "bg-error/10 border-error/20 text-foreground [&_svg]:text-error",
                            insight.type === 'warning' && "bg-warning/10 border-warning/20 text-foreground [&_svg]:text-warning",
                            insight.type === 'info' && "bg-blue-500/10 border-blue-500/20 text-foreground [&_svg]:text-blue-500"
                        )}
                        >
                        <insight.icon className="h-5 w-5 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                            <p className="font-medium">{insight.message}</p>
                            {insight.suggestion && (
                            <p className="text-xs text-muted-foreground">
                                {insight.suggestion}
                            </p>
                            )}
                        </div>
                        </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Yardımcı fonksiyonlar
function getWarningIndicator(percentage: number) {
  if (percentage > 100) {
    return {
      icon: <AlertCircleIcon className="h-4 w-4 text-error-high-contrast animate-pulse" />,
      message: getBudgetBadgeContent(percentage, false),
      type: "error-high-contrast" as const
    }
  }
  if (percentage === 100) {
    return {
      icon: <AlertCircleIcon className="h-4 w-4 text-error" />,
      message: getBudgetBadgeContent(percentage, false),
      type: "error" as const
    }
  }
  if (percentage >= 80) {
    return {
      icon: <AlertTriangleIcon className="h-4 w-4 text-warning" />,
      message: getBudgetBadgeContent(percentage, false),
      type: "warning" as const
    }
  }
  return null
}

function getGradientId(percentage: number): string {
  if (percentage > 100) return 'errorHighContrastGradient'
  if (percentage === 100) return 'errorGradient'
  if (percentage >= 80) return 'warningGradient'
  return 'successGradient'
}

function renderGradients() {
  return (
    <>
      <linearGradient id="successGradient" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="hsl(var(--success))" />
        <stop offset="100%" stopColor="hsl(var(--success-hover))" />
      </linearGradient>
      <linearGradient id="warningGradient" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="hsl(var(--warning))" />
        <stop offset="100%" stopColor="hsl(var(--warning-hover))" />
      </linearGradient>
      <linearGradient id="errorGradient" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="hsl(var(--error))" />
        <stop offset="100%" stopColor="hsl(var(--error-hover))" />
      </linearGradient>
      <linearGradient id="errorHighContrastGradient" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="hsl(var(--error-high-contrast))" />
        <stop offset="100%" stopColor="hsl(var(--error))" />
      </linearGradient>
    </>
  )
}

function CustomTick({ x, y, payload, data }: any) {
  const entry = data.find((d: ChartData) => d.category === payload.value)
  if (!entry) return null
  
  const warning = getWarningIndicator(entry.percentage)

  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={warning ? -40 : -10}
        y={0}
        dy={4}
        textAnchor="end"
        className="text-sm fill-foreground font-medium"
      >
        {payload.value}
      </text>
      {warning && (
        <g transform="translate(-24,0)">
          <foreignObject width="20" height="20" x={0} y={-10}>
            <div className="h-full flex items-center justify-center">
              {warning.icon}
            </div>
          </foreignObject>
        </g>
      )}
    </g>
  )
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null

  const data = payload[0].payload as ChartData
  const warning = getWarningIndicator(data.percentage)

  return (
    <div className="rounded-[var(--radius)] border bg-card p-2 shadow-sm">
      <div className="grid gap-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-card-foreground">
            {data.category}
          </span>
          {warning && warning.icon}
        </div>
        <div className={cn(
          "text-xs font-medium",
          warning?.type === "error-high-contrast" ? "text-error-high-contrast" :
          warning?.type === "error" ? "text-error" :
          warning?.type === "warning" ? "text-warning" :
          "text-success"
        )}>
          {data.percentage.toFixed(1)}% kullanıldı
          {warning && (
            <span className="ml-1">
              ({warning.message})
            </span>
          )}
        </div>
        <div className="flex justify-between gap-2">
          <span className="text-sm text-muted-foreground">
            Harcanan:
          </span>
          <span className="font-medium">
            {formatCurrency(data.spent)}
          </span>
        </div>
        <div className="flex justify-between gap-2">
          <span className="text-sm text-muted-foreground">
            Limit:
          </span>
          <span className="font-medium">
            {formatCurrency(data.limit)}
          </span>
        </div>
        <div className="pt-2 mt-2 border-t">
          <div className="flex justify-between gap-2">
            <span className="text-sm text-muted-foreground">
              Periyot:
            </span>
            <span className="text-sm font-medium">
              {data.period}
            </span>
          </div>
          <div className="flex justify-between gap-2">
            <span className="text-sm text-muted-foreground">
              Başlangıç:
            </span>
            <span className="text-sm font-medium">
              {format(new Date(data.startDate), 'dd MMM yyyy', { locale: tr })}
            </span>
          </div>
          {data.endDate && (
            <div className="flex justify-between gap-2">
              <span className="text-sm text-muted-foreground">
                Bitiş:
              </span>
              <span className="text-sm font-medium">
                {format(new Date(data.endDate), 'dd MMM yyyy', { locale: tr })}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function generateBudgetInsights(data: ChartData[]): BudgetInsight[] {
  const insights: BudgetInsight[] = []

  if (data.length === 0) return insights

  // Bütçe aşımı olan kategorileri analiz et
  const overBudgetCategories = data.filter(item => item.percentage > 100)
  if (overBudgetCategories.length > 0) {
    const categoryNames = overBudgetCategories
      .slice(0, 2)
      .map(c => c.category)
      .join(' ve ')

    insights.push({
      type: 'error',
      message: `${categoryNames} ${overBudgetCategories.length > 2 ? 've diğer ' : ''}kategorilerinde bütçe aşımı var.`,
      suggestion: 'Bu kategorilerdeki harcamalarınızı gözden geçirin ve gerekirse bütçe limitlerini güncelleyin.',
      icon: AlertCircleIcon
    })
  }

  // Bütçe limitlerine yaklaşan kategorileri analiz et
  const warningCategories = data.filter(item => item.percentage >= 80 && item.percentage <= 100)
  if (warningCategories.length > 0) {
    insights.push({
      type: 'warning',
      message: `${warningCategories.length} kategoride bütçe limitlerine yaklaşıyorsunuz.`,
      suggestion: 'Ay sonuna kadar bu kategorilerdeki harcamalarınıza dikkat edin.',
      icon: AlertTriangleIcon
    })
  }

  // Verimli bütçe yönetimi analizi
  const wellManagedCategories = data.filter(item => 
    item.percentage >= 50 && item.percentage < 80
  )
  if (wellManagedCategories.length >= Math.ceil(data.length / 2)) {
    insights.push({
      type: 'success',
      message: 'Bütçelerinizin çoğunu etkin bir şekilde yönetiyorsunuz.',
      suggestion: 'Bu dengeli harcama alışkanlığını sürdürün.',
      icon: ArrowUpCircle
    })
  }

  // Düşük kullanım analizi
  const lowUtilizationCategories = data.filter(item => item.percentage < 30)
  if (lowUtilizationCategories.length > Math.ceil(data.length / 3)) {
    insights.push({
      type: 'info',
      message: 'Bazı kategorilerde bütçe kullanımınız düşük seyrediyor.',
      suggestion: 'Bütçe limitlerini gerçek harcama alışkanlıklarınıza göre optimize edebilirsiniz.',
      icon: TrendingDownIcon
    })
  }

  return insights.slice(0, 3)
} 