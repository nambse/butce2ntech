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
import { AlertTriangleIcon, AlertCircleIcon, WalletIcon } from "lucide-react"
import { useAppSelector } from '@/store/hooks'
import { selectCategoriesByType } from "@/store/slices/settingsSlice"
import {
  getBudgetBadgeContent,
  calculateBudgetPercentage,
  isBudgetExpired
} from "@/lib/budget-utils"

// Types
import type { AnimationConfig } from "@/types/chart"
import type { Budget, BudgetPeriod } from "@/types/budget"
import { format } from "date-fns"
import { tr } from "date-fns/locale"

interface ChartData {
  category: string
  categoryId: string
  spent: number
  limit: number
  percentage: number
}

interface BudgetProgressProps {
  className?: string
  animationConfig?: AnimationConfig
}

export function BudgetProgress({ 
  className,
  animationConfig = { duration: 1000, easing: "ease-out" }
}: BudgetProgressProps) {
  const transactions = useAppSelector((state) => state.transactions.items)
  const budgets = useAppSelector((state) => state.budgets.items)
  const expenseCategories = useAppSelector(selectCategoriesByType('expense'))

  // Aktif bütçeleri hesapla
  const activeBudgets = budgets.filter(budget => !isBudgetExpired(budget.endDate))

  // Bütçe verilerini hazırla
  const chartData = activeBudgets.map(budget => {
    const category = expenseCategories.find(c => c.id === budget.categoryId)
    
    // Bütçe için toplam harcamayı hesapla
    const spent = transactions
      .filter(t => {
        const transactionDate = new Date(t.date)
        const budgetStart = new Date(budget.startDate)
        const budgetEnd = budget.endDate ? new Date(budget.endDate) : null
        
        if (t.category !== budget.categoryId || t.type !== 'expense') {
          return false
        }

        const isAfterStart = transactionDate >= budgetStart
        const isBeforeEnd = budgetEnd ? transactionDate <= budgetEnd : true

        return isAfterStart && isBeforeEnd
      })
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)

    return {
      category: category?.label || budget.category,
      categoryId: budget.categoryId,
      spent,
      limit: budget.limit,
      percentage: calculateBudgetPercentage(spent, budget.limit),
      period: budget.period,
      startDate: budget.startDate,
      endDate: budget.endDate,
    }
  })

  // Yüzdeye göre sırala (en kritik olanlar üstte)
  const sortedData = [...chartData].sort((a, b) => b.percentage - a.percentage)

  // Aktif bütçe yoksa bilgi mesajı göster
  if (activeBudgets.length === 0) {
    return (
      <Card className={cn("min-h-[540px]", className)}>
        <CardHeader>
          <CardTitle>Bütçe Durumu</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[460px] flex flex-col items-center justify-center text-center">
            <WalletIcon className="h-12 w-12 text-muted-foreground/20" />
            <p className="mt-4 text-sm text-muted-foreground">
              Aktif bütçe bulunmuyor
            </p>
            <p className="mt-1 text-xs text-muted-foreground/80">
              Bütçe eklemek için Bütçeler sayfasını ziyaret edin
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn("min-h-[540px]", className)}>
      <CardHeader>
        <CardTitle>Bütçe Limitleri</CardTitle>
        <p className="text-xs text-muted-foreground/80">
          *Yalnızca aktif bütçeler görüntüleniyor
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-[460px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={sortedData}
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
                tick={(props) => <CustomTick {...props} data={sortedData} />}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: 'hsl(var(--muted)/0.1)' }}
                content={(props) => <CustomTooltip {...props} />}
              />
              <Bar 
                dataKey="spent"
                isAnimationActive={true}
                animationDuration={animationConfig.duration}
                animationEasing={animationConfig.easing}
                radius={[6, 6, 6, 6]}
              >
                {sortedData.map((entry, index) => (
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
      </CardContent>
    </Card>
  )
}

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

// Grafik Bileşenleri
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
  if (!entry) return <g />
  
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

  const data = payload[0].payload as ChartData & {
    period: BudgetPeriod
    startDate: string
    endDate?: string
  }
  const warning = getWarningIndicator(data.percentage)

  const periodLabels = {
    weekly: 'Haftalık',
    monthly: 'Aylık',
    yearly: 'Yıllık',
    manual: 'Manuel'
  }

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
              {periodLabels[data.period]}
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