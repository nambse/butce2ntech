"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Area,
  ComposedChart
} from "recharts"
import { formatCurrency } from "@/lib/format"
import { useAppSelector } from '@/store/hooks'
import { startOfMonth, endOfMonth, subMonths, format, addMonths } from "date-fns"
import { tr } from 'date-fns/locale'
import { WalletIcon } from "lucide-react"
import { cn } from "@/lib/utils"

// Types
import type { AnimationConfig } from "@/types/chart"

interface IncomeExpenseTrendProps {
  className?: string
  animationConfig?: AnimationConfig
}

interface ChartData {
  date: string
  income: number
  expense: number
  net: number
}

// Eksen için özel para formatı
const formatAxisCurrency = (amount: number) => {
  return new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount) + '₺'
}

export function IncomeExpenseTrend({ 
  className,
  animationConfig = { duration: 1000, easing: "ease-out" }
}: IncomeExpenseTrendProps) {
  const transactions = useAppSelector((state) => state.transactions.items)

  // En eski işlem tarihini bul
  const oldestTransaction = transactions.reduce((oldest, current) => {
    const currentDate = new Date(current.date)
    const oldestDate = new Date(oldest.date)
    return currentDate < oldestDate ? current : oldest
  }, transactions[0])

  // Eğer işlem yoksa son 6 ayı göster
  const startDate = oldestTransaction 
    ? subMonths(startOfMonth(new Date(oldestTransaction.date)), 1) // Bir ay öncesinden başla
    : subMonths(new Date(), 6)

  // Şu anki ay ile başlangıç ayı arasındaki farkı hesapla
  const monthDiff = Math.abs(
    (new Date().getFullYear() - startDate.getFullYear()) * 12 + 
    (new Date().getMonth() - startDate.getMonth())
  )

  // Ay sayısına göre veriyi hazırla
  const chartData: ChartData[] = Array.from({ length: monthDiff + 1 }).map((_, i) => {
    const date = addMonths(startDate, i)
    const start = startOfMonth(date)
    const end = endOfMonth(date)
    
    const monthTransactions = transactions.filter(t => {
      const txDate = new Date(t.date)
      return txDate >= start && txDate <= end
    })

    const income = monthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)

    const expense = monthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)

    return {
      date: format(date, 'MMMM yyyy', { locale: tr }),
      income,
      expense,
      net: income - expense
    }
  })

  // Veri yoksa bilgi mesajı göster
  if (transactions.length === 0) {
    return (
      <Card className={cn("min-h-[540px]", className)}>
        <CardHeader>
          <CardTitle>Gelir/Gider Trendi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[460px] flex flex-col items-center justify-center text-center">
            <WalletIcon className="h-12 w-12 text-muted-foreground/20" />
            <p className="mt-4 text-sm text-muted-foreground">
              Henüz işlem bulunmuyor
            </p>
            <p className="mt-1 text-xs text-muted-foreground/80">
              İşlem eklemek için İşlemler sayfasını ziyaret edin
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn("min-h-[540px]", className)}>
      <CardHeader>
        <CardTitle>Gelir/Gider Trendi</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[460px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 30, bottom: 20 }}
            >
              <defs>
                {renderGradients()}
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
                isAnimationActive={true}
                animationDuration={animationConfig.duration}
                animationEasing={animationConfig.easing}
              />
              <Area
                type="monotone"
                dataKey="expense"
                stroke="hsl(var(--expense))"
                strokeWidth={2.5}
                fill="url(#expenseGradient)"
                dot={false}
                activeDot={CustomDot}
                isAnimationActive={true}
                animationDuration={animationConfig.duration}
                animationEasing={animationConfig.easing}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

// Yardımcı Bileşenler
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

// Yardımcı Fonksiyonlar
function renderGradients() {
  return (
    <>
      <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="hsl(var(--income))" stopOpacity={0.2}/>
        <stop offset="95%" stopColor="hsl(var(--income))" stopOpacity={0.05}/>
      </linearGradient>
      <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="hsl(var(--expense))" stopOpacity={0.2}/>
        <stop offset="95%" stopColor="hsl(var(--expense))" stopOpacity={0.05}/>
      </linearGradient>
    </>
  )
}

function formatLegendText(value: string) {
  return (
    <span className="text-sm font-medium text-muted-foreground">
      {value === "income" ? "Gelir" : "Gider"}
    </span>
  )
} 