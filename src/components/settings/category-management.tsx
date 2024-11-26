"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog } from "@/components/ui/dialog"
import { PlusIcon, PencilIcon, TrashIcon } from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { 
  addCategory, 
  updateCategory, 
  deleteCategory, 
  reorderCategories,
  type Category 
} from "@/store/slices/settingsSlice"
import { Badge } from "@/components/ui/badge"
import { CategoryForm } from "./category-form"

interface CategoryCardProps {
  category: Category
  onEdit: (category: Category) => void
  onDelete: (categoryId: string) => void
}

function CategoryCard({ category, onEdit, onDelete }: CategoryCardProps) {
  return (
    <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
      <div className="flex items-center gap-3">
        <div className="text-2xl">{category.icon}</div>
        <div>
          <h4 className="font-medium">{category.label}</h4>
          <Badge variant={category.type === 'income' ? 'income' : 'expense'}>
            {category.type === 'income' ? 'Gelir' : 'Gider'}
          </Badge>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onEdit(category)}
        >
          <PencilIcon className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(category.id)}
        >
          <TrashIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

export function CategoryManagement() {
  const dispatch = useAppDispatch()
  const categories = useAppSelector(state => state.settings.settings.categories)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)

  const incomeCategories = categories.filter(c => c.type === 'income')
  const expenseCategories = categories.filter(c => c.type === 'expense')

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setIsFormOpen(true)
  }

  const handleDelete = (categoryId: string) => {
    if (confirm('Bu kategoriyi silmek istediğinizden emin misiniz?')) {
      dispatch(deleteCategory(categoryId))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Kategoriler</h3>
        <Button onClick={() => setIsFormOpen(true)}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Yeni Kategori
        </Button>
      </div>

      <div className="grid gap-6">
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-3">Gelir Kategorileri</h4>
          <div className="grid gap-2">
            {incomeCategories.map(category => (
              <CategoryCard
                key={category.id}
                category={category}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-3">Gider Kategorileri</h4>
          <div className="grid gap-2">
            {expenseCategories.map(category => (
              <CategoryCard
                key={category.id}
                category={category}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </div>
      </div>

      <CategoryForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        editingCategory={editingCategory}
        onClose={() => setEditingCategory(null)}
      />
    </div>
  )
} 