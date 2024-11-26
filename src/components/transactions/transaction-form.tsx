"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectItem } from "@/components/ui/select"
import { Modal, ModalHeader, ModalTitle, ModalContent, ModalFooter } from "@/components/ui/modal"
import { WalletIcon, CreditCardIcon, PlusIcon } from "lucide-react"
import { useAppSelector, useAppDispatch } from "@/store/hooks"
import { selectCategoriesByType } from "@/store/slices/settingsSlice"
import { addTransaction } from "@/store/slices/transactionsSlice"
import { MoneyInput } from "@/components/ui/money-input"
import { TransactionFormData } from "@/types/transaction"
import { CategoryForm } from "@/components/settings/category-form"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import { cn } from "@/lib/utils"

// Form bileşeni prop tipleri
interface TransactionFormProps {
  open: boolean                                    // Modal açık/kapalı durumu
  onOpenChange: (open: boolean) => void           // Modal durumu değiştirme işlevi
  initialData?: TransactionFormData               // Düzenleme için başlangıç verileri
  onSubmit?: (data: TransactionFormData) => void  // Form gönderim işlevi
  isLoading?: boolean                             // Yükleme durumu
}

export function TransactionForm({ 
  open,
  onOpenChange,
  initialData,
  onSubmit,
  isLoading,
}: TransactionFormProps) {
  const dispatch = useAppDispatch()

  // Form durumları
  const [selectedType, setSelectedType] = React.useState<'income' | 'expense'>(
    initialData?.type || 'income'
  )
  const [amount, setAmount] = React.useState(initialData?.amount || 0)
  const [selectedCategory, setSelectedCategory] = React.useState(initialData?.category || '')
  const [date, setDate] = React.useState(initialData?.date || new Date().toISOString())
  const [description, setDescription] = React.useState(initialData?.description || '')
  const [store, setStore] = React.useState(initialData?.store || '')
  const [isCategoryFormOpen, setIsCategoryFormOpen] = React.useState(false)
  const [errors, setErrors] = React.useState<Record<string, string>>({})

  // Seçilen işlem tipine göre kategorileri getir
  const categories = useAppSelector(selectCategoriesByType(selectedType))

  // Düzenleme durumunda form verilerini güncelle
  React.useEffect(() => {
    if (initialData) {
      setSelectedType(initialData.type)
      setSelectedCategory(initialData.category || '')
      setAmount(initialData.amount)
      setDate(initialData.date || new Date().toISOString())
      setDescription(initialData.description || '')
      setStore(initialData.store || '')
    }
  }, [initialData])

  // İşlem tipi değiştiğinde kategoriyi sıfırla
  React.useEffect(() => {
    const categoryExists = categories.some(c => c.id === selectedCategory)
    if (!categoryExists && selectedCategory !== '') {
      setSelectedCategory('')
    }
  }, [selectedType, categories, selectedCategory])

  // Form gönderimi işlemi
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    // Form doğrulama
    const newErrors: Record<string, string> = {}
    
    if (!amount) newErrors.amount = 'Lütfen bir tutar girin'
    if (!selectedCategory) newErrors.category = 'Lütfen bir kategori seçin'
    if (!date) newErrors.date = 'Lütfen bir tarih seçin'
    if (!description.trim()) newErrors.description = 'Lütfen bir açıklama girin'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    
    // Form verilerini hazırla
    const data: TransactionFormData = {
      type: selectedType,
      amount,
      category: selectedCategory,
      description: description.trim(),
      date,
      store,
    }

    // İşlemi kaydet
    if (onSubmit) {
      onSubmit(data)
    } else {
      dispatch(addTransaction({
        ...data,
        amount: data.type === 'expense' ? -Math.abs(data.amount) : Math.abs(data.amount)
      }))
    }
    
    onOpenChange(false)
  }

  return (
    <Modal open={open} onClose={() => onOpenChange(false)}>
      <form onSubmit={handleSubmit}>
        <ModalHeader>
          <ModalTitle>
            {initialData && initialData.amount !== 0 ? 'İşlemi Düzenle' : 'Yeni İşlem'}
          </ModalTitle>
        </ModalHeader>
        
        <ModalContent>
          <div className="space-y-4">
            {/* İşlem Tipi Seçimi */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={selectedType === "income" ? "income" : "outline"}
                onClick={() => setSelectedType("income")}
              >
                <WalletIcon className="w-4 h-4 mr-2" />
                Gelir
              </Button>
              <Button
                type="button"
                variant={selectedType === "expense" ? "expense" : "outline"}
                onClick={() => setSelectedType("expense")}
              >
                <CreditCardIcon className="w-4 h-4 mr-2" />
                Gider
              </Button>
            </div>

            {/* Tutar Girişi */}
            <div className="space-y-2">
              <label htmlFor="amount" className="text-sm font-medium text-foreground">
                Tutar
              </label>
              <MoneyInput
                id="amount"
                name="amount"
                placeholder="0.00"
                value={amount}
                onChange={setAmount}
                error={errors.amount}
              />
            </div>

            {/* Kategori Seçimi */}
            <div className="space-y-2">
              <label htmlFor="category" className="text-sm font-medium text-foreground">
                Kategori
              </label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Select<string>
                    value={selectedCategory}
                    onValueChange={setSelectedCategory}
                    placeholder="Kategori Seçin"
                    error={errors.category}
                  >
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        <span className="flex items-center gap-2">
                          <span>{category.icon}</span>
                          <span>{category.label}</span>
                        </span>
                      </SelectItem>
                    ))}
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
            </div>

            {/* Açıklama Girişi */}
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium text-foreground">
                Açıklama
              </label>
              <Input
                id="description"
                name="description"
                placeholder="Açıklama girin"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                error={errors.description}
              />
            </div>

            {/* Tarih Seçimi */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Tarih</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? (
                      format(new Date(date), "dd MMMM yyyy", { locale: tr })
                    ) : (
                      <span>Tarih seçin</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date ? new Date(date) : undefined}
                    onSelect={(selectedDate) => {
                      if (selectedDate) {
                        setDate(selectedDate.toISOString())
                        const closeButton = document.querySelector('[aria-expanded="true"]')
                        if (closeButton) {
                          (closeButton as HTMLElement).click()
                        }
                      }
                    }}
                    disabled={(date: Date) => date > new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </ModalContent>

        <ModalFooter>
          <Button type="submit" disabled={isLoading}>
            {initialData && initialData.amount !== 0 ? 'Güncelle' : 'Kaydet'}
          </Button>
        </ModalFooter>
      </form>

      <CategoryForm
        open={isCategoryFormOpen}
        onOpenChange={setIsCategoryFormOpen}
        editingCategory={null}
        onClose={() => setIsCategoryFormOpen(false)}
      />
    </Modal>
  )
} 