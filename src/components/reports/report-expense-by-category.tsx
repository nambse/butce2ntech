"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip,
  Sector
} from "recharts"
import { formatCurrency } from "@/lib/format"
import { useState } from "react"
import { WalletIcon, AlertCircle, TrendingDown, ArrowUpCircle, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAppSelector } from '@/store/hooks'
import { selectCategoriesByType } from "@/store/slices/settingsSlice"
import type { DateRange } from "react-day-picker"
import { startOfDay, endOfDay } from "date-fns"
import { format } from "date-fns"
import { tr } from "date-fns/locale"

interface ReportExpenseByCategoryProps {
  className?: string
  dateRange?: DateRange
}

interface CategoryData {
  category: string
  categoryId: string
  amount: number
  percentage: number
  icon?: string
  transactionCount: number
  averageTransaction: number
  color: string
}

interface CategoryInsight {
  type: 'warning' | 'success' | 'error' | 'info'
  message: string
  suggestion?: string
  icon: any
}

export function ReportExpenseByCategory({ className, dateRange }: ReportExpenseByCategoryProps) {
  const [activeIndex, setActiveIndex] = useState<number | undefined>()
  
  const transactions = useAppSelector((state) => state.transactions.items)
  const expenseCategories = useAppSelector(selectCategoriesByType('expense'))

  const filteredTransactions = transactions.filter(t => {
    if (!dateRange?.from) return true
    const transactionDate = new Date(t.date)
    const start = startOfDay(dateRange.from)
    const end = endOfDay(dateRange.to || dateRange.from)
    return transactionDate >= start && transactionDate <= end
  })

  const chartData: CategoryData[] = expenseCategories
    .map((category, index) => {
      const categoryTransactions = filteredTransactions.filter(t => 
        t.category === category.id && 
        t.type === 'expense'
      )

      const amount = categoryTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0)
      const transactionCount = categoryTransactions.length
      const averageTransaction = transactionCount > 0 ? amount / transactionCount : 0

      return {
        category: category.label,
        categoryId: category.id,
        icon: category.icon,
        amount,
        transactionCount,
        averageTransaction,
        percentage: 0,
        color: `hsl(var(--chart-${(index % 5) + 1}))`
      }
    })
    .filter(cat => cat.amount > 0)
    .sort((a, b) => b.amount - a.amount)

  const total = chartData.reduce((sum, item) => sum + item.amount, 0)
  chartData.forEach(item => {
    item.percentage = (item.amount / total) * 100
  })

  const insights = generateInsights(chartData, total)

  if (chartData.length === 0) {
    return (
      <Card className={cn("min-h-[400px]", className)}>
        <CardHeader>
          <CardTitle>Kategori Bazlı Harcamalar</CardTitle>
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
                  tarihleri arasında harcama bulunmuyor
                </>
              ) : (
                'Henüz harcama bulunmuyor'
              )}
            </p>
            <p className="mt-2 text-xs text-muted-foreground/80">
              Harcama eklemek için İşlemler sayfasını ziyaret edin
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn("min-h-[400px]", className)}>
      <CardHeader>
        <CardTitle>Kategori Bazlı Harcamalar</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="amount"
                  activeIndex={activeIndex}
                  activeShape={renderActiveShape}
                  onMouseEnter={(_, index) => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(undefined)}
                >
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color}
                      className="transition-colors duration-200"
                      stroke="none"
                    />
                  ))}
                </Pie>
                <Tooltip content={CustomTooltip} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            {chartData.map((item, index) => (
              <div
                key={item.categoryId}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors",
                  activeIndex === index 
                    ? "bg-muted shadow-sm" 
                    : "hover:bg-muted/50",
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
                  <div 
                    className="h-1.5 w-1.5 rounded-full" 
                    style={{ backgroundColor: item.color }} 
                  />
                  <span>%{item.percentage.toFixed(1)}</span>
                </div>
              </div>
            ))}
          </div>

          {insights.length > 0 && (
            <div className="pt-4 border-t space-y-3">
              <h4 className="font-medium">Harcama Analizi</h4>
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

const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props

  return (
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
  )
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null

  const data = payload[0].payload as CategoryData
  
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
              Toplam harcamanın %{data.percentage.toFixed(1)}'i
            </span>
          </div>
        </div>
        <div className="pt-2 border-t space-y-1">
          <div className="flex justify-between gap-2">
            <span className="text-sm text-muted-foreground">Tutar:</span>
            <span className="font-medium">{formatCurrency(data.amount)}</span>
          </div>
          <div className="flex justify-between gap-2">
            <span className="text-sm text-muted-foreground">İşlem:</span>
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

function generateInsights(data: CategoryData[], total: number): CategoryInsight[] {
    const insights: CategoryInsight[] = []
  
    if (data.length === 0 || total <= 0) return insights
  
    // Highest spending category analysis
    const highestCategory = data[0]
    if (highestCategory && !isNaN(highestCategory.percentage) && highestCategory.percentage > 40 && highestCategory.percentage <= 100) {
      insights.push({
        type: 'warning',
        message: `${highestCategory.category} kategorisi toplam harcamanızın %${highestCategory.percentage.toFixed(0)}'ını oluşturuyor.`,
        suggestion: 'Bu kategorideki harcamalarınızı azaltmak için alternatif seçenekleri değerlendirebilirsiniz.',
        icon: AlertCircle
      })
    }
  
    // Frequent small transactions
    const averageTransactionTotal = total / data.reduce((sum, item) => sum + item.transactionCount, 0)
    const highFrequencyLowAmount = data.find(item => 
      item.transactionCount >= 8 && 
      item.averageTransaction > 0 && 
      item.averageTransaction < (averageTransactionTotal * 0.5) && 
      !isNaN(item.averageTransaction)
    )
    
    if (highFrequencyLowAmount) {
      insights.push({
        type: 'info',
        message: `${highFrequencyLowAmount.category} kategorisinde sık sık küçük tutarlı harcamalar yapıyorsunuz.`,
        suggestion: 'Bu harcamaları toplu yaparak veya alternatif çözümler bularak tasarruf edebilirsiniz.',
        icon: TrendingDown
      })
    }
  
    // Category distribution analysis
    if (data.length >= 3) {
      const topThreePercentage = data
        .slice(0, 3)
        .reduce((sum, item) => {
          const validPercentage = !isNaN(item.percentage) ? item.percentage : 0
          return sum + validPercentage
        }, 0)
      
      if (!isNaN(topThreePercentage)) {
        if (topThreePercentage > 80 && topThreePercentage <= 100) {
          insights.push({
            type: 'warning',
            message: `Harcamalarınızın %${topThreePercentage.toFixed(0)}'i sadece üç kategoride yoğunlaşmış durumda.`,
            suggestion: 'Bütçenizi daha dengeli dağıtmayı düşünebilirsiniz.',
            icon: AlertTriangle
          })
        } else if (topThreePercentage < 50) {
          insights.push({
            type: 'success',
            message: 'Harcamalarınız kategoriler arasında dengeli bir şekilde dağılmış durumda.',
            suggestion: 'Bu dengeli dağılım, finansal kontrolünüzün iyi olduğunu gösteriyor.',
            icon: TrendingDown
          })
        }
      }
    }
  
    // Average transaction analysis
    if (data.length > 0) {
      const validCategories = data.filter(item => 
        item.averageTransaction > 0 && 
        !isNaN(item.averageTransaction) && 
        item.transactionCount >= 3
      )
  
      const categoryAverage = validCategories.reduce((sum, item) => sum + item.averageTransaction, 0) / validCategories.length
  
      const highAverageCategories = validCategories.filter(item => 
        item.averageTransaction > categoryAverage * 1.5 &&
        item.averageTransaction < categoryAverage * 5
      )
  
      if (highAverageCategories.length > 0) {
        const categoryNames = highAverageCategories
          .slice(0, 2)
          .map(c => c.category)
          .join(' ve ')
  
        insights.push({
          type: 'error',
          message: `${categoryNames} ${highAverageCategories.length > 2 ? 've diğer' : ''} kategorilerinde ortalama harcama tutarınız yüksek.`,
          suggestion: 'Bu kategorilerdeki harcamalarınızı gözden geçirerek tasarruf fırsatları yaratabilirsiniz.',
          icon: AlertCircle
        })
      }
    }
  
    // Transaction frequency patterns
    const totalTransactions = data.reduce((sum, item) => sum + item.transactionCount, 0)
    const averageTransactions = totalTransactions / data.length
  
    const lowFrequencyHighAmount = data.find(item => 
      item.transactionCount <= Math.max(2, averageTransactions * 0.3) && 
      item.amount > (total * 0.2) &&
      item.amount < (total * 0.8)
    )
  
    if (lowFrequencyHighAmount) {
      insights.push({
        type: 'info',
        message: `${lowFrequencyHighAmount.category} kategorisinde az sayıda ancak yüksek tutarlı harcamalar var.`,
        suggestion: 'Bu harcamaları daha küçük parçalara bölerek veya alternatif seçenekleri değerlendirerek bütçe kontrolünü artırabilirsiniz.',
        icon: ArrowUpCircle
      })
    }
  
    return insights
      .filter(insight => insight.message && insight.suggestion) // Only return insights with valid messages
      .slice(0, 3) // Limit to top 3 insights
  }