import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { MoreVerticalIcon, PencilIcon, TrashIcon, CalendarIcon } from "lucide-react"
import { formatCurrency } from "@/lib/format"
import { cn } from "@/lib/utils"
import {
  getBudgetStatusColor,
  getBudgetTextColor,
  getCategoryIconColor,
  getBudgetBadgeContent,
  getBudgetBadgeVariant,
  formatBudgetDate,
  getPeriodLabel,
  calculateBudgetPercentage,
  calculateRemainingBudget,
  isBudgetExpired
} from "@/lib/budget-utils"
import type { BudgetPeriod, Budget } from "@/types/budget"

// Ana bileşen props
interface BudgetCardProps extends Omit<Budget, 'id' | 'createdAt' | 'updatedAt'> {
  spent: number                 // Harcanan tutar
  icon?: React.ReactNode        // Kategori ikonu
  className?: string
  onEdit?: () => void          // Düzenleme işlevi
  onDelete?: () => void        // Silme işlevi
}

// Alt bileşen props
interface BudgetProgressProps {
  percentage: number
  isExpired: boolean
}

interface BudgetStatusProps {
  percentage: number
  isExpired: boolean
  spent: number
  remaining: number
  limit: number
}

interface BudgetHeaderProps {
  category: string
  icon?: React.ReactNode
  percentage: number
  isExpired: boolean
  onEdit?: () => void
  onDelete?: () => void
}

interface BudgetDateProps {
  period: BudgetPeriod
  startDate: string
  endDate?: string
}

interface BudgetStatusBadgeProps {
  percentage: number
  isExpired: boolean
}

interface BudgetActionsProps {
  onEdit?: () => void
  onDelete?: () => void
}

// Ana Bileşen
export function BudgetCard({
  category,
  spent,
  limit,
  period,
  startDate,
  endDate,
  icon,
  className,
  onEdit,
  onDelete,
}: BudgetCardProps) {
  // Bütçe hesaplamaları
  const percentage = calculateBudgetPercentage(spent, limit)
  const remaining = calculateRemainingBudget(spent, limit)
  const isExpired = isBudgetExpired(endDate)

  return (
    <Card className={cn(
      "group relative overflow-hidden",
      "hover:shadow-md transition-all duration-300",
      "bg-gradient-to-br from-card to-background/40",
      isExpired && "opacity-75",
      className
    )}>
      {/* İlerleme çubuğu */}
      <BudgetProgress percentage={percentage} isExpired={isExpired} />

      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <BudgetHeader
          category={category}
          icon={icon}
          percentage={percentage}
          isExpired={isExpired}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          {/* Periyot ve Tarih Bilgisi */}
          <BudgetDate 
            period={period} 
            startDate={startDate} 
            endDate={endDate} 
          />

          {/* İlerleme Göstergesi */}
          <div className="h-2 w-full rounded-full bg-secondary/50 overflow-hidden">
            <div
              className={cn(
                "h-full transition-all duration-300",
                getBudgetStatusColor(percentage, isExpired),
                "shadow-sm"
              )}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
          
          {/* Durum Bilgileri */}
          <BudgetStatus
            percentage={percentage}
            isExpired={isExpired}
            spent={spent}
            remaining={remaining}
            limit={limit}
          />
        </div>
      </CardContent>
    </Card>
  )
}

// Alt Bileşenler
function BudgetProgress({ percentage, isExpired }: BudgetProgressProps) {
  return (
    <div className={cn(
      "absolute top-0 left-0 h-[3px] w-full",
      getBudgetStatusColor(percentage, isExpired),
      "opacity-50 group-hover:opacity-100 transition-opacity duration-300"
    )} />
  )
}

function BudgetHeader({ 
  category, 
  icon, 
  percentage, 
  isExpired,
  onEdit,
  onDelete 
}: BudgetHeaderProps) {
  return (
    <>
      <CardTitle className="text-base font-medium">
        <div className="flex items-center gap-2.5">
          {icon && (
            <div className={cn(
              "p-2 rounded-lg transition-colors duration-300",
              getCategoryIconColor(percentage, isExpired)
            )}>
              {icon}
            </div>
          )}
          {category}
        </div>
      </CardTitle>
      <div className="flex items-center gap-2">
        <BudgetStatusBadge percentage={percentage} isExpired={isExpired} />
        <BudgetActions onEdit={onEdit} onDelete={onDelete} />
      </div>
    </>
  )
}

function BudgetDate({ period, startDate, endDate }: BudgetDateProps) {
  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <Badge variant="secondary" className="capitalize">
        {getPeriodLabel(period)}
      </Badge>
      <div className="flex items-center gap-1.5">
        <CalendarIcon className="h-3.5 w-3.5" />
        <span>
          {formatBudgetDate(startDate)}
          {endDate && ` - ${formatBudgetDate(endDate)}`}
        </span>
      </div>
    </div>
  )
}

function BudgetStatus({ 
  percentage, 
  isExpired, 
  spent, 
  remaining, 
  limit 
}: BudgetStatusProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Harcanan</span>
        <span className={cn(
          getBudgetTextColor(percentage, isExpired),
          "font-medium tabular-nums"
        )}>
          {formatCurrency(spent)}
        </span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Kalan</span>
        <span className="font-medium tabular-nums">{formatCurrency(remaining)}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Limit</span>
        <span className="font-medium tabular-nums">{formatCurrency(limit)}</span>
      </div>
    </div>
  )
}

function BudgetStatusBadge({ percentage, isExpired }: BudgetStatusBadgeProps) {
  return (
    <Badge 
      variant={getBudgetBadgeVariant(percentage, isExpired)}
      className={cn(
        percentage > 100 && !isExpired && "bg-error-high-contrast/10 text-error-high-contrast border-error-high-contrast/20",
        "whitespace-nowrap"
      )}
    >
      {getBudgetBadgeContent(percentage, isExpired)}
    </Badge>
  )
}

function BudgetActions({ onEdit, onDelete }: BudgetActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className="h-8 w-8 hover:bg-background"
        >
          <MoreVerticalIcon className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        <div className="p-2">
          <DropdownMenuItem 
            onClick={onEdit}
            className="flex items-center gap-2 py-2.5 px-3 rounded-md cursor-pointer hover:bg-muted"
          >
            <PencilIcon className="h-4 w-4" />
            <span>Düzenle</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={onDelete}
            className="flex items-center gap-2 py-2.5 px-3 rounded-md cursor-pointer hover:bg-muted text-error mt-1"
          >
            <TrashIcon className="h-4 w-4" />
            <span>Sil</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 