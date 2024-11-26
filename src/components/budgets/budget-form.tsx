"use client"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectItem } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { MoneyInput } from "@/components/ui/money-input"
import { useAppSelector } from "@/store/hooks"
import { selectCategoriesByType } from "@/store/slices/settingsSlice"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import { addWeeks, addMonths, addYears } from "date-fns"
import { CategoryForm } from "@/components/settings/category-form"
import { PlusIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { tr } from "date-fns/locale"

// Types
import type { Budget, BudgetFormData, BudgetPeriod } from "@/types/budget"
import type { Category } from "@/types/category"

interface BudgetFormProps {
  onSubmit: (data: BudgetFormData) => void
  initialData?: Budget | null
  existingBudgets: Budget[]
}

interface FormErrors {
  category?: string
  limit?: string
  startDate?: string
  endDate?: string
}

export function BudgetForm({ onSubmit, initialData, existingBudgets }: BudgetFormProps) {
  // Form state
  const [selectedCategory, setSelectedCategory] = useState(initialData?.categoryId || '')
  const [period, setPeriod] = useState<BudgetPeriod>(initialData?.period || 'monthly')
  const [startDate, setStartDate] = useState(initialData?.startDate || new Date().toISOString().split('T')[0])
  const [endDate, setEndDate] = useState(initialData?.endDate || '')
  const [limit, setLimit] = useState(initialData?.limit || 0)
  const [errors, setErrors] = useState<FormErrors>({})

  // Selectors
  const expenseCategories = useAppSelector(selectCategoriesByType('expense'))

  // Aktif bütçeleri filtrele (süresi dolmayanlar)
  const activeBudgets = existingBudgets.filter(budget => {
    if (!budget.endDate) return true
    return new Date(budget.endDate) >= new Date()
  })

  // Periyoda göre bitiş tarihini otomatik hesapla
  useEffect(() => {
    if (!startDate || period === 'manual') return

    const start = new Date(startDate)
    let end: Date

    switch (period) {
      case 'weekly':
        end = addWeeks(start, 1)
        break
      case 'monthly':
        end = addMonths(start, 1)
        break
      case 'yearly':
        end = addYears(start, 1)
        break
      default:
        return
    }

    end.setDate(end.getDate() - 1)
    setEndDate(end.toISOString().split('T')[0])
  }, [startDate, period])

  // Form doğrulama ve gönderme
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const newErrors: FormErrors = {}
    
    // Kategori kontrolü
    if (!selectedCategory) {
      newErrors.category = 'Lütfen bir kategori seçin'
    } else if (!initialData && activeBudgets.some(b => b.categoryId === selectedCategory)) {
      newErrors.category = 'Bu kategori için zaten aktif bir bütçe bulunuyor'
    }
    
    // Limit kontrolü
    if (!limit) {
      newErrors.limit = 'Lütfen bir limit girin'
    }

    // Tarih kontrolü
    if (!startDate) {
      newErrors.startDate = 'Lütfen başlangıç tarihi seçin'
    }
    if (period === 'manual' && !endDate) {
      newErrors.endDate = 'Lütfen bitiş tarihi seçin'
    }
    if (endDate && new Date(endDate) < new Date(startDate)) {
      newErrors.endDate = 'Bitiş tarihi başlangıç tarihinden önce olamaz'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    const selectedCategoryData = expenseCategories.find(c => c.id === selectedCategory)
    if (!selectedCategoryData) return

    onSubmit({
      categoryId: selectedCategory,
      category: selectedCategoryData.label,
      limit,
      period,
      startDate,
      endDate,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Kategori Seçimi */}
      <CategorySelect
        value={selectedCategory}
        onChange={setSelectedCategory}
        categories={expenseCategories}
        activeBudgets={activeBudgets}
        initialCategory={initialData?.categoryId}
        error={errors.category}
      />

      {/* Bütçe Limiti */}
      <LimitInput
        value={limit}
        onChange={setLimit}
        error={errors.limit}
      />

      {/* Bütçe Periyodu */}
      <PeriodSelect
        value={period}
        onChange={setPeriod}
      />

      {/* Tarih Seçimi */}
      <DateInputs
        period={period}
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        errors={errors}
      />

      {/* Form Aksiyonları */}
      <div className="flex justify-end gap-2">
        <Button type="submit">
          {initialData ? 'Güncelle' : 'Kaydet'}
        </Button>
      </div>
    </form>
  )
}

// Alt Bileşenler
interface CategorySelectProps {
  value: string
  onChange: (value: string) => void
  categories: Category[]
  activeBudgets: Budget[]
  initialCategory?: string
  error?: string
}

function CategorySelect({ 
  value, 
  onChange, 
  categories, 
  activeBudgets, 
  initialCategory,
  error 
}: CategorySelectProps) {
  const [isCategoryFormOpen, setIsCategoryFormOpen] = useState(false)

  return (
    <div className="space-y-2">
      <Label htmlFor="category">Kategori</Label>
      <div className="flex gap-2">
        <div className="flex-1">
          <Select<string>
            value={value}
            onValueChange={onChange}
            placeholder="Kategori seçin"
            error={error}
          >
            {categories
              .filter(category => 
                !activeBudgets.some(b => b.categoryId === category.id) || 
                category.id === initialCategory
              )
              .map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  <span className="flex items-center gap-2">
                    <span>{category.icon}</span>
                    <span>{category.label}</span>
                  </span>
                </SelectItem>
              ))
            }
          </Select>
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => setIsCategoryFormOpen(true)}
        >
          <PlusIcon className="h-4 w-4" />
        </Button>
      </div>

      <CategoryForm
        open={isCategoryFormOpen}
        onOpenChange={setIsCategoryFormOpen}
        editingCategory={null}
        onClose={() => setIsCategoryFormOpen(false)}
      />
    </div>
  )
}

interface LimitInputProps {
  value: number
  onChange: (value: number) => void
  error?: string
}

function LimitInput({ value, onChange, error }: LimitInputProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="limit">Limit</Label>
      <MoneyInput
        id="limit"
        name="limit"
        placeholder="Limit girin"
        value={value}
        onChange={onChange}
        error={error}
      />
    </div>
  )
}

interface PeriodSelectProps {
  value: BudgetPeriod
  onChange: (value: BudgetPeriod) => void
}

function PeriodSelect({ value, onChange }: PeriodSelectProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="period">Dönem</Label>
      <Select<BudgetPeriod>
        value={value}
        onValueChange={onChange}
      >
        <SelectItem value="weekly">Haftalık</SelectItem>
        <SelectItem value="monthly">Aylık</SelectItem>
        <SelectItem value="yearly">Yıllık</SelectItem>
        <SelectItem value="manual">Manuel Seçim</SelectItem>
      </Select>
    </div>
  )
}

interface DateInputsProps {
  period: BudgetPeriod
  startDate: string
  endDate: string
  onStartDateChange: (value: string) => void
  onEndDateChange: (value: string) => void
  errors: FormErrors
}

function DateInputs({ 
  period, 
  startDate, 
  endDate, 
  onStartDateChange, 
  onEndDateChange,
  errors 
}: DateInputsProps) {
  return (
    <div className={cn(
      "grid gap-4",
      period === 'manual' ? "grid-cols-2" : "grid-cols-1"
    )}>
      <div className="space-y-2">
        <Label htmlFor="startDate">Başlangıç Tarihi</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !startDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {startDate ? (
                format(new Date(startDate), "dd MMMM yyyy", { locale: tr })
              ) : (
                <span>Tarih seçin</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={startDate ? new Date(startDate) : undefined}
              onSelect={(date) => {
                if (date) {
                  onStartDateChange(date.toISOString())
                  const closeButton = document.querySelector('[aria-expanded="true"]')
                  if (closeButton) {
                    (closeButton as HTMLElement).click()
                  }
                }
              }}
              disabled={(date) => date > new Date()}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {period === 'manual' && (
        <div className="space-y-2">
          <Label htmlFor="endDate">Bitiş Tarihi</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !endDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? (
                  format(new Date(endDate), "dd MMMM yyyy", { locale: tr })
                ) : (
                  <span>Tarih seçin</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={endDate ? new Date(endDate) : undefined}
                onSelect={(date) => {
                  if (date) {  // Only close if a date was selected
                    onEndDateChange(date.toISOString())
                    // Close the popover by clicking outside
                    document.body.click()
                  }
                }}
                disabled={(date: Date) => {
                  if (date > new Date()) return true
                  if (startDate && date < new Date(startDate)) return true
                  return false
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      )}
    </div>
  )
} 