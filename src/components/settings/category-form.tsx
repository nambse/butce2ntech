"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { useAppDispatch } from "@/store/hooks"
import { 
  addCategory, 
  updateCategory,
  availableIcons,
  type Category 
} from "@/store/slices/settingsSlice"

interface CategoryFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingCategory: Category | null
  onClose: () => void
}

interface FormData {
  label: string
  icon: string
  type: 'income' | 'expense'
}

const initialData: FormData = {
  label: '',
  icon: '📦',
  type: 'expense'
}

export function CategoryForm({ 
  open, 
  onOpenChange, 
  editingCategory, 
  onClose 
}: CategoryFormProps) {
  const dispatch = useAppDispatch()
  const [formData, setFormData] = useState<FormData>(initialData)

  useEffect(() => {
    if (editingCategory) {
      setFormData({
        label: editingCategory.label,
        icon: editingCategory.icon,
        type: editingCategory.type
      })
    } else {
      setFormData(initialData)
    }
  }, [editingCategory])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (editingCategory) {
      dispatch(updateCategory({
        ...editingCategory,
        ...formData
      }))
    } else {
      dispatch(addCategory(formData))
    }
    
    handleClose()
  }

  const handleClose = () => {
    onClose()
    onOpenChange(false)
    setFormData(initialData)
  }

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editingCategory ? 'Kategori Düzenle' : 'Yeni Kategori'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Kategori Adı</label>
            <Input
              value={formData.label}
              onChange={e => setFormData(prev => ({ ...prev, label: e.target.value }))}
              placeholder="Kategori adı girin"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">İkon</label>
            <div className="grid grid-cols-8 gap-2 p-2 border rounded-lg max-h-[200px] overflow-y-auto">
              {availableIcons.map(icon => (
                <Button
                  key={icon}
                  type="button"
                  variant={formData.icon === icon ? 'default' : 'ghost'}
                  className="text-xl h-10"
                  onClick={() => setFormData(prev => ({ ...prev, icon }))}
                >
                  {icon}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Tür</label>
            <Select
              value={formData.type}
              onValueChange={(value: 'income' | 'expense') => 
                setFormData(prev => ({ ...prev, type: value }))
              }
            >
              <option value="income">Gelir</option>
              <option value="expense">Gider</option>
            </Select>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              İptal
            </Button>
            <Button type="submit">
              {editingCategory ? 'Güncelle' : 'Ekle'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 