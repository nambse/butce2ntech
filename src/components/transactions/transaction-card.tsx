import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { formatCurrency } from "@/lib/format"
import { MoreVerticalIcon, PencilIcon, TrashIcon } from "lucide-react"
import { useAppSelector } from "@/store/hooks"
import { selectCategories } from "@/store/slices/settingsSlice"

// İşlem kartı bileşeni - Gelir/gider işlemlerini görüntülemek için kullanılır
interface TransactionCardProps {
  title: string                  // İşlem başlığı
  type: 'income' | 'expense'     // İşlem tipi
  amount: number                 // İşlem tutarı
  date: string                   // İşlem tarihi
  category: string               // İşlem kategorisi
  description?: string           // İşlem açıklaması (opsiyonel)
  icon?: React.ReactNode         // İşlem ikonu (opsiyonel)
  className?: string            
  onEdit?: () => void           // Düzenleme işlevi
  onDelete?: () => void         // Silme işlevi
}
  
export function TransactionCard({
  title,
  type,
  amount,
  date,
  category,
  description,
  icon,
  className,
  onEdit,
  onDelete,
}: TransactionCardProps) {
  const isIncome = type === 'income' || amount > 0
  const categories = useAppSelector(selectCategories)
  const categoryInfo = categories.find(c => c.id === category)

  return (
    <Card className={cn(
      "group relative overflow-visible transition-all duration-300",
      "hover:shadow-md hover:border-border/60",
      "p-4",
      "bg-gradient-to-r from-card to-background/40",
      className
    )}>
      {/* Sol kenardaki renk göstergesi */}
      <div className={cn(
        "absolute inset-y-0 left-0 w-1",
        isIncome ? "bg-income" : "bg-expense",
        "opacity-40 group-hover:opacity-100 transition-opacity duration-300"
      )} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pl-3">
        {/* Sol Bölüm - İşlem Detayları */}
        <div className="flex items-start gap-4 min-w-0">
          {/* İşlem İkonu */}
          {icon && (
            <div className={cn(
              "p-2.5 rounded-[var(--radius)] shrink-0",
              "transition-all duration-300 shadow-sm",
              "ring-2 ring-transparent",
              isIncome 
                ? "bg-income/10 text-income group-hover:bg-income/15 group-hover:ring-income/20" 
                : "bg-expense/10 text-expense group-hover:bg-expense/15 group-hover:ring-expense/20"
            )}>
              {icon}
            </div>
          )}

          {/* İşlem Bilgileri */}
          <div className="space-y-1.5 min-w-0 flex-1">
            {/* Başlık ve Mobil Aksiyonlar */}
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1 min-w-0">
                <h3 className="font-medium leading-none truncate pr-4 text-foreground/90">
                  {title}
                </h3>
                {description && (
                  <p className="text-sm text-muted-foreground/80 line-clamp-1">
                    {description}
                  </p>
                )}
              </div>
              
              {/* Mobil Menü */}
              <MobileActionsMenu onEdit={onEdit} onDelete={onDelete} />
            </div>

            {/* Kategori ve Tarih */}
            <div className="flex flex-wrap items-center gap-2">
              <TransactionBadge 
                isIncome={isIncome} 
                categoryInfo={categoryInfo} 
                category={category} 
              />
              <span className="text-xs text-muted-foreground/70">{date}</span>
            </div>
          </div>
        </div>

        {/* Sağ Bölüm - Tutar ve Aksiyonlar */}
        <DesktopActions 
          isIncome={isIncome} 
          amount={amount} 
          onEdit={onEdit} 
          onDelete={onDelete} 
        />

        {/* Mobil Tutar */}
        <div className="sm:hidden">
          <TransactionAmount isIncome={isIncome} amount={amount} />
        </div>
      </div>
    </Card>
  )
}

// Alt bileşenler için tip tanımlamaları
interface TransactionBadgeProps {
  isIncome: boolean
  categoryInfo?: {
    icon: React.ReactNode
    label: string
  }
  category: string
}

interface TransactionAmountProps {
  isIncome: boolean
  amount: number
}

interface ActionMenuProps {
  onEdit?: () => void
  onDelete?: () => void
  buttonClassName: string
}

interface MobileActionsMenuProps {
  onEdit?: () => void
  onDelete?: () => void
}

interface DesktopActionsProps {
  isIncome: boolean
  amount: number
  onEdit?: () => void
  onDelete?: () => void
}

// Alt Bileşenler
function TransactionBadge({ isIncome, categoryInfo, category }: TransactionBadgeProps) {
  return (
    <Badge 
      variant={isIncome ? "income" : "expense"} 
      size="sm"
      className={cn(
        "transition-all duration-300",
        "group-hover:ring-2 group-hover:ring-offset-1",
        isIncome 
          ? "group-hover:ring-income/20" 
          : "group-hover:ring-expense/20"
      )}
    >
      {categoryInfo ? (
        <span className="flex items-center gap-1.5">
          <span>{categoryInfo.icon}</span>
          <span>{categoryInfo.label}</span>
        </span>
      ) : category}
    </Badge>
  )
}

function TransactionAmount({ isIncome, amount }: TransactionAmountProps) {
  return (
    <span className={cn(
      "font-medium tabular-nums transition-all duration-300",
      "text-base",
      isIncome 
        ? "text-income group-hover:text-income-high-contrast" 
        : "text-expense group-hover:text-expense-high-contrast"
    )}>
      {isIncome ? "+" : ""}{formatCurrency(amount)}
    </span>
  )
}

function MobileActionsMenu({ onEdit, onDelete }: MobileActionsMenuProps) {
  return (
    <div className="sm:hidden">
      <ActionsMenu onEdit={onEdit} onDelete={onDelete} buttonClassName="h-6 w-6 -mr-2" />
    </div>
  )
}

function DesktopActions({ isIncome, amount, onEdit, onDelete }: DesktopActionsProps) {
  return (
    <div className="hidden sm:flex items-center gap-4 shrink-0">
      <TransactionAmount isIncome={isIncome} amount={amount} />
      <ActionsMenu 
        onEdit={onEdit} 
        onDelete={onDelete} 
        buttonClassName={cn(
          "h-8 w-8",
          "transition-all duration-300",
          "hover:bg-background"
        )} 
      />
    </div>
  )
}

function ActionsMenu({ onEdit, onDelete, buttonClassName }: ActionMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className={buttonClassName}
        >
          <MoreVerticalIcon className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-[200px]"
      >
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