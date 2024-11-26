"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip,
  Sector,
} from "recharts"
import { formatCurrency } from "@/lib/format"
import { useState } from "react"
import { WalletIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAppSelector } from '@/store/hooks'
import { selectCategoriesByType } from "@/store/slices/settingsSlice"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { DateRange } from "react-day-picker"

import type { AnimationConfig } from "@/types/chart"
import type { Transaction } from "@/types"

// Tip tanımlamaları
interface ExpenseByCategoryProps {
  className?: string
  animationConfig?: AnimationConfig
}

interface CategoryData {
  category: string
  categoryId: string
  amount: number
  icon?: string
  transactionCount: number
  averageTransaction: number
  lastTransaction?: string
  transactions: Transaction[]
}

interface ChartData extends CategoryData {
  color: string
  total: number
}

export function ExpenseByCategory({ 
  className,
  animationConfig = { duration: 1000, easing: "ease-out" }
}: ExpenseByCategoryProps) {
  // Durum yönetimi
  const [activeIndex, setActiveIndex] = useState<number | undefined>()
  const [dateRange, setDateRange] = useState<DateRange>()

  // Redux store'dan veri çekme
  const transactions = useAppSelector((state) => state.transactions.items)
  const expenseCategories = useAppSelector(selectCategoriesByType('expense'))

  // Seçili tarih aralığına göre işlemleri filtreleme
  const filteredTransactions = transactions.filter(t => {
    if (!dateRange?.from) return true
    const transactionDate = new Date(t.date)
    const start = dateRange.from
    const end = dateRange.to || dateRange.from
    return transactionDate >= start && transactionDate <= end
  })

  // Kategori verilerini hazırlama
  const rawData = expenseCategories.map(category => {
    const categoryTransactions = filteredTransactions.filter(t => 
      t.category === category.id && 
      t.type === 'expense'
    )

    const totalAmount = categoryTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0)
    const transactionCount = categoryTransactions.length

    return {
      category: category.label,
      categoryId: category.id,
      icon: category.icon,
      transactions: categoryTransactions,
      amount: totalAmount,
      transactionCount,
      averageTransaction: transactionCount > 0 ? totalAmount / transactionCount : 0,
      lastTransaction: transactionCount > 0 
        ? categoryTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].date 
        : undefined
    }
  }).filter(cat => cat.amount > 0)

  const total = rawData.reduce((sum, item) => sum + item.amount, 0)

  // İşlem yoksa boş durum gösterimi
  if (rawData.length === 0) {
    return (
      <Card className={cn("min-h-[625px]", className)}>
        <CardHeader className="pb-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <CardTitle>Kategori Bazlı Harcamalar</CardTitle>
            <DateRangePicker
              date={dateRange}
              onDateChange={setDateRange}
            />
          </div>
        </CardHeader>
        <CardContent className="h-[calc(100%-5rem)] flex items-center justify-center">
          <div className="flex flex-col items-center justify-center text-center">
            <WalletIcon className="h-12 w-12 text-muted-foreground/20" />
            <p className="mt-4 text-sm text-muted-foreground">
              Bu dönem için işlem bulunmuyor
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Grafik verilerini hazırlama
  const chartData: ChartData[] = rawData
    .sort((a, b) => b.amount - a.amount)
    .map((item, index) => ({
      ...item,
      color: `hsl(var(--chart-${(index % 5) + 1}))`,
      total
    }))

  return (
    <Card className={cn("min-h-[625px]", className)}>
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <CardTitle>Kategori Bazlı Harcamalar</CardTitle>
          <DateRangePicker
            date={dateRange}
            onDateChange={setDateRange}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Pasta grafik */}
        <div className="flex flex-col items-center gap-4">
          <div className="w-full max-w-[480px] h-[380px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={120}
                  paddingAngle={2}
                  dataKey="amount"
                  nameKey="category"
                  activeIndex={activeIndex}
                  activeShape={renderActiveShape}
                  onMouseEnter={(_, index) => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(undefined)}
                  isAnimationActive={true}
                  animationDuration={animationConfig.duration}
                  animationEasing={animationConfig.easing}
                  stroke="none"
                >
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color}
                      className="transition-colors duration-200 hover:opacity-80"
                    />
                  ))}
                </Pie>
                <Tooltip content={CustomTooltip} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Kategori etiketleri */}
          <div className="w-full flex flex-wrap justify-center gap-2">
            {chartData.map((item, index) => (
              <div
                key={item.categoryId}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors",
                  activeIndex === index 
                    ? "bg-muted shadow-sm" 
                    : "hover:bg-muted/50 hover:shadow-sm",
                  "cursor-pointer"
                )}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(undefined)}
              >
                {item.icon && (
                  <span className="text-base">
                    {item.icon}
                  </span>
                )}
                <span className="text-sm font-medium">
                  {item.category}
                </span>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span>%{((item.amount / total) * 100).toFixed(1)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* İstatistikler */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t text-sm">
          <div>
            <span className="text-muted-foreground">Toplam</span>
            <p className="font-semibold mt-0.5">{formatCurrency(total)}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Kategori</span>
            <p className="font-semibold mt-0.5">{chartData.length}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Ortalama</span>
            <p className="font-semibold mt-0.5">{formatCurrency(total / chartData.length)}</p>
          </div>
          <div>
            <span className="text-muted-foreground">En Yüksek</span>
            <p className="font-semibold mt-0.5">{formatCurrency(chartData[0]?.amount || 0)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Aktif dilim şeklini render eden yardımcı fonksiyon
function renderActiveShape(props: any) {
  const {
    cx, cy,
    innerRadius, outerRadius,
    startAngle, endAngle,
    fill
  } = props

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 10}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        className="filter drop-shadow-md transition-all duration-200"
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={innerRadius - 5}
        outerRadius={outerRadius}
        fill={fill}
      />
    </g>
  )
}

// Tooltip içeriğini render eden yardımcı fonksiyon
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null

  const data = payload[0].payload as ChartData
  const percentage = ((data.amount / data.total) * 100).toFixed(1)

  return (
    <div className="rounded-[var(--radius)] border bg-card p-2 shadow-sm">
      <div className="grid gap-2">
        <div className="flex items-center gap-2">
          {data.icon && <span className="text-xl">{data.icon}</span>}
          <div className="flex flex-col">
            <span className="text-sm font-medium text-card-foreground">
              {data.category}
            </span>
            <span className="text-xs text-muted-foreground">
              Toplam harcamanın %{percentage}'i
            </span>
          </div>
        </div>
        <div className="pt-2 border-t space-y-1">
          <div className="flex justify-between gap-2">
            <span className="text-sm text-muted-foreground">Tutar:</span>
            <span className="font-medium">{formatCurrency(data.amount)}</span>
          </div>
          <div className="flex justify-between gap-2">
            <span className="text-sm text-muted-foreground">İşlem Sayısı:</span>
            <span className="font-medium">{data.transactionCount}</span>
          </div>
          <div className="flex justify-between gap-2">
            <span className="text-sm text-muted-foreground">Ortalama:</span>
            <span className="font-medium">{formatCurrency(data.averageTransaction)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}