"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ComposedChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { formatCurrency } from "@/lib/format"
import { useAppSelector } from '@/store/hooks'
import { 
  startOfMonth, 
  endOfMonth, 
  subMonths, 
  format, 
  addMonths, 
  isSameMonth, 
  startOfDay,
  endOfDay
} from "date-fns"
import { tr } from 'date-fns/locale'
import { WalletIcon, TrendingUpIcon, TrendingDownIcon, AlertCircle, TrendingDown, ArrowUpCircle, AlertTriangle, PiggyBankIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import type { DateRange } from "react-day-picker"

interface ReportIncomeTrendProps {
  className?: string
  dateRange?: DateRange
}

interface ChartData {
  date: string
  income: number
  expense: number
  net: number
}

interface TrendInsight {
  type: 'warning' | 'success' | 'error' | 'info'
  message: string
  suggestion?: string
  icon: any
}

export function ReportIncomeTrend({ className, dateRange }: ReportIncomeTrendProps) {
  const transactions = useAppSelector((state) => state.transactions.items)

  // Tarih aralığına göre işlemleri filtrele
  const filteredTransactions = transactions.filter(t => {
    if (!dateRange?.from) return true
    const transactionDate = new Date(t.date)
    const start = startOfDay(dateRange.from)
    const end = endOfDay(dateRange.to || dateRange.from)
    return transactionDate >= start && transactionDate <= end
  })

  // Grafik verilerini hazırla
  const chartData = prepareChartData(filteredTransactions, dateRange)

  // Dönem toplamlarını hesapla
  const periodTotals = chartData.reduce((acc, curr) => ({
    income: acc.income + curr.income,
    expense: acc.expense + curr.expense,
    net: acc.net + curr.net
  }), { income: 0, expense: 0, net: 0 })

  // Ortalamaları hesapla
  const averages = {
    income: periodTotals.income / chartData.length || 0,
    expense: periodTotals.expense / chartData.length || 0,
    net: periodTotals.net / chartData.length || 0
  }

  const insights = generateTrendInsights(chartData, averages)

  if (filteredTransactions.length === 0) {
    return (
      <Card className={cn("min-h-[400px]", className)}>
        <CardHeader>
          <CardTitle>Gelir/Gider Trendi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[383px] flex flex-col items-center justify-center text-center">
            <WalletIcon className="h-12 w-12 text-muted-foreground/20" />
            <p className="mt-4 text-sm text-muted-foreground">
              {dateRange?.from ? (
                <>
                  {format(dateRange.from, 'dd MMM yyyy', { locale: tr })}
                  {' - '}
                  {format(dateRange.to || dateRange.from, 'dd MMM yyyy', { locale: tr })}
                  <br />
                  tarihleri arasında işlem bulunmuyor
                </>
              ) : (
                'Henüz işlem bulunmuyor'
              )}
            </p>
            <p className="mt-2 text-xs text-muted-foreground/80">
              Gelir ve gider eklemek için İşlemler sayfasını ziyaret edin
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn("min-h-[400px]", className)}>
      <CardHeader>
        <CardTitle>Gelir/Gider Trendi</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <TrendingUpIcon className="h-4 w-4 text-income" />
                <span className="text-sm font-medium">Ortalama Gelir</span>
              </div>
              <p className="text-sm text-income">
                {formatCurrency(averages.income)}
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <TrendingDownIcon className="h-4 w-4 text-expense" />
                <span className="text-sm font-medium">Ortalama Gider</span>
              </div>
              <p className="text-sm text-expense">
                {formatCurrency(averages.expense)}
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <WalletIcon className={cn(
                  "h-4 w-4",
                  averages.net >= 0 ? "text-success" : "text-error"
                )} />
                <span className="text-sm font-medium">Ortalama Net</span>
              </div>
              <p className={cn(
                "text-sm",
                averages.net >= 0 ? "text-success" : "text-error"
              )}>
                {formatCurrency(averages.net)}
              </p>
            </div>
          </div>

          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 30, bottom: 20 }}
              >
                <defs>
                  <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--income))" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="hsl(var(--income))" stopOpacity={0.05}/>
                  </linearGradient>
                  <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--expense))" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="hsl(var(--expense))" stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  className="stroke-border" 
                  vertical={false}
                  opacity={0.5}
                />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  dy={10}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  dx={-10}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  tickFormatter={formatAxisCurrency}
                />
                <Tooltip content={CustomTooltip} />
                <Legend 
                  verticalAlign="top"
                  height={36}
                  formatter={formatLegendText}
                />
                <Area
                  type="monotone"
                  dataKey="income"
                  stroke="hsl(var(--income))"
                  strokeWidth={2.5}
                  fill="url(#incomeGradient)"
                  dot={false}
                  activeDot={CustomDot}
                />
                <Area
                  type="monotone"
                  dataKey="expense"
                  stroke="hsl(var(--expense))"
                  strokeWidth={2.5}
                  fill="url(#expenseGradient)"
                  dot={false}
                  activeDot={CustomDot}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {insights.length > 0 && (
            <div className="pt-4 border-t space-y-3">
              <h4 className="font-medium">Gelir/Gider Analizi</h4>
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
                    )}>
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

function prepareChartData(transactions: any[], dateRange?: DateRange): ChartData[] {
  if (!dateRange?.from) {
    const end = new Date()
    const start = subMonths(end, 5)
    return generateMonthlyData(start, end, transactions)
  }

  const start = dateRange.from
  const end = dateRange.to || dateRange.from

  return generateMonthlyData(start, end, transactions)
}

function generateMonthlyData(start: Date, end: Date, transactions: any[]): ChartData[] {
  const months: ChartData[] = []
  let currentDate = startOfMonth(start)
  const endDate = endOfMonth(end)

  while (currentDate <= endDate) {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)

    const monthTransactions = transactions.filter(t => {
      const date = new Date(t.date)
      return date >= monthStart && date <= monthEnd
    })

    const income = monthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)

    const expense = monthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)

    months.push({
      date: format(currentDate, 'MMM yyyy', { locale: tr }),
      income,
      expense,
      net: income - expense
    })

    currentDate = addMonths(currentDate, 1)
  }

  return months
}

function formatAxisCurrency(amount: number) {
  return new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount) + '₺'
}

function CustomDot({ cx, cy, stroke }: any) {
  return (
    <circle 
      cx={cx} 
      cy={cy} 
      r={4} 
      strokeWidth={2}
      stroke={stroke}
      fill="hsl(var(--card))"
      className="transition-all duration-300"
    />
  )
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null

  const data = payload[0].payload as ChartData
  
  return (
    <div className="rounded-[var(--radius)] border bg-card p-3 shadow-sm">
      <div className="grid gap-2">
        <div className="flex flex-col">
          <span className="text-sm font-medium text-card-foreground">
            {label}
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-sm text-income font-medium">
            Gelir:
          </span>
          <span className="font-medium">
            {formatCurrency(data.income)}
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-sm text-expense font-medium">
            Gider:
          </span>
          <span className="font-medium">
            {formatCurrency(data.expense)}
          </span>
        </div>
        <div className="flex justify-between gap-4 border-t pt-2">
          <span className="text-sm text-muted-foreground font-medium">
            Net:
          </span>
          <span className={`font-medium ${data.net >= 0 ? 'text-income' : 'text-expense'}`}>
            {formatCurrency(data.net)}
          </span>
        </div>
      </div>
    </div>
  )
}

function formatLegendText(value: string) {
  return (
    <span className="text-sm font-medium text-muted-foreground">
      {value === "income" ? "Gelir" : "Gider"}
    </span>
  )
}

function generateTrendInsights(data: ChartData[], averages: { income: number, expense: number, net: number }): TrendInsight[] {
    const insights: TrendInsight[] = []
    
    if (data.length < 2) return insights
  
    // Gelir trendi analizi
    const firstPoint = data[0]
    const lastPoint = data[data.length - 1]
    
    // Sadece her iki noktada da geçerli gelir değerleri varsa ve ilk noktada gelir varsa trendi hesapla
    if (firstPoint.income > 0 && lastPoint.income > 0) {
      const incomeTrend = ((lastPoint.income - firstPoint.income) / firstPoint.income) * 100
      
      // Sadece değişim anlamlı ve makul sınırlar içindeyse trend öngörüsü göster
      if (!isNaN(incomeTrend) && incomeTrend > -100 && incomeTrend < 1000) {
        if (incomeTrend < -10) {
          insights.push({
            type: 'warning',
            message: `Son dönemde gelirinizde %${Math.abs(incomeTrend).toFixed(0)} oranında azalma var.`,
            suggestion: 'Gelir kaynaklarınızı çeşitlendirmeyi düşünebilirsiniz.',
            icon: TrendingDown
          })
        } else if (incomeTrend > 10) {
          insights.push({
            type: 'success',
            message: `Son dönemde gelirinizde %${incomeTrend.toFixed(0)} oranında artış var.`,
            suggestion: 'Bu artışı tasarrufa yönlendirmeyi düşünebilirsiniz.',
            icon: ArrowUpCircle
          })
        }
      }
    }
  
    // Gider kontrolü analizi
    if (averages.income > 0) {  // Sadece gelir varsa hesapla
      const expenseRatio = (averages.expense / averages.income) * 100
      
      // Sadece oran makul sınırlar içindeyse göster
      if (!isNaN(expenseRatio) && expenseRatio > 0 && expenseRatio <= 200) {
        if (expenseRatio > 90) {
          insights.push({
            type: 'error',
            message: 'Giderleriniz gelirinize çok yakın seyrediyor.',
            suggestion: 'Acil durumlar için tasarruf yapmayı unutmayın.',
            icon: AlertCircle
          })
        } else if (expenseRatio < 60) {
          insights.push({
            type: 'success',
            message: 'Giderlerinizi gelirinize oranla iyi yönetiyorsunuz.',
            suggestion: 'Birikiminizi değerlendirmeyi düşünebilirsiniz.',
            icon: WalletIcon
          })
        }
      }
    }
  
    // Tasarruf modeli analizi
    if (data.length > 0) {  // Sadece veri varsa hesapla
      const savingsMonths = data.filter(month => month.net > 0).length
      const savingsRate = (savingsMonths / data.length) * 100
  
      if (!isNaN(savingsRate) && savingsRate >= 0 && savingsRate <= 100) {
        if (savingsRate < 50) {
          insights.push({
            type: 'warning',
            message: `${data.length} ayın ${savingsMonths} ayında tasarruf yapabilmişsiniz.`,
            suggestion: 'Düzenli tasarruf için aylık bütçe planı oluşturabilirsiniz.',
            icon: AlertTriangle
          })
        } else if (savingsRate > 80) {
          insights.push({
            type: 'success',
            message: 'Düzenli olarak tasarruf yapabiliyorsunuz.',
            suggestion: 'Bu alışkanlığı sürdürmeye devam edin!',
            icon: WalletIcon
          })
        }
      }
    }
  
    // Aylık değişkenlik analizi
    if (data.length > 1) {  // Sadece yeterli veri varsa hesapla
      const netChanges = data.slice(1).map((month, i) => 
        Math.abs(month.net - data[i].net)
      )
      
      if (netChanges.length > 0 && averages.net !== 0) {  // Analiz edilecek değişimler olduğundan emin ol
        const avgChange = netChanges.reduce((sum, change) => sum + change, 0) / netChanges.length
        const avgNet = Math.abs(averages.net)
  
        if (!isNaN(avgChange) && avgNet > 0 && avgChange > avgNet * 0.5 && avgChange < avgNet * 5) {
          insights.push({
            type: 'info',
            message: 'Aylık gelir-gider dengenizde dalgalanmalar görülüyor.',
            suggestion: 'Daha istikrarlı bir bütçe planlaması yapabilirsiniz.',
            icon: TrendingDown
          })
        }
      }
    }
  
    return insights.slice(0, 3)  // En önemli 3 öngörüyü döndür
  }