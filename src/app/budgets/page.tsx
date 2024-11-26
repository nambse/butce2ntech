"use client"

import { BudgetCard } from "@/components/budgets/budget-card"
import { BudgetForm } from "@/components/budgets/budget-form"
import { Button } from "@/components/ui/button"
import { Dialog, DialogHeader, DialogFooter, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { useState } from "react"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { addBudgetWithAlert, deleteBudget, updateBudgetWithAlert, selectActiveBudgets, selectExpiredBudgets } from '@/store/slices/budgetsSlice'
import { selectCategoriesByType } from "@/store/slices/settingsSlice"
import { ClientOnly } from "@/components/client-only"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Budget, BudgetFormData } from "@/types/budget"
import { Pagination } from "@/components/ui/pagination"
import { PlusIcon } from "lucide-react"

const ITEMS_PER_PAGE = 6

export default function BudgetsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null)
  const [deletingBudget, setDeletingBudget] = useState<Budget | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const dispatch = useAppDispatch()
  
  const activeBudgets = useAppSelector(selectActiveBudgets)
  const expiredBudgets = useAppSelector(selectExpiredBudgets)
  const allBudgets = useAppSelector((state) => state.budgets.items)
  const expenseCategories = useAppSelector(selectCategoriesByType('expense'))
  const transactions = useAppSelector((state) => state.transactions.items)

  const calculateBudgetSpent = (budget: Budget) => {
    const budgetStart = new Date(budget.startDate)
    const budgetEnd = budget.endDate ? new Date(budget.endDate) : null

    const spent = transactions
      .filter(t => {
        const transactionDate = new Date(t.date)
        if (t.category !== budget.categoryId || t.type !== 'expense') return false
        const isAfterStart = transactionDate >= budgetStart
        const isBeforeEnd = budgetEnd ? transactionDate <= budgetEnd : true
        return isAfterStart && isBeforeEnd
      })
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)

    return { ...budget, spent }
  }

  const paginateData = (data: any[]) => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    return data.slice(startIndex, endIndex)
  }

  const activeBudgetsWithSpent = activeBudgets.map(calculateBudgetSpent)
  const expiredBudgetsWithSpent = expiredBudgets.map(calculateBudgetSpent)

  const paginatedActiveBudgets = paginateData(activeBudgetsWithSpent)
  const paginatedExpiredBudgets = paginateData(expiredBudgetsWithSpent)

  const activeTotalPages = Math.ceil(activeBudgetsWithSpent.length / ITEMS_PER_PAGE)
  const expiredTotalPages = Math.ceil(expiredBudgetsWithSpent.length / ITEMS_PER_PAGE)

  const handleEdit = (budget: Budget) => {
    setEditingBudget(budget)
    setIsDialogOpen(true)
  }

  const handleDelete = (budget: Budget) => {
    setDeletingBudget(budget)
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = () => {
    if (deletingBudget) {
      dispatch(deleteBudget(deletingBudget.id))
    }
    setIsDeleteModalOpen(false)
    setDeletingBudget(null)
  }

  const handleSubmit = (data: BudgetFormData) => {
    if (editingBudget) {
      dispatch(updateBudgetWithAlert({
        ...editingBudget,
        ...data,
      }))
    } else {
      dispatch(addBudgetWithAlert(data))
    }
    setIsDialogOpen(false)
    setEditingBudget(null)
  }

  const [activeTab, setActiveTab] = useState('active')

  return (
    <div className="space-y-6 pt-4">

      <ClientOnly>
        <Tabs 
          defaultValue="active" 
          value={activeTab}
          onValueChange={(value) => {
            setActiveTab(value)
            setCurrentPage(1)
          }}
        >
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="active">
                Aktif Bütçeler
                {activeBudgets.length > 0 && (
                  <span className="ml-2 bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs">
                    {activeBudgets.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="expired">
                Süresi Dolmuş
                {expiredBudgets.length > 0 && (
                  <span className="ml-2 bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs">
                    {expiredBudgets.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            {/* Desktop Button */}
            <Button 
              onClick={() => {
                setEditingBudget(null)
                setIsDialogOpen(true)
              }}
              className="hidden md:flex"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Yeni Bütçe Limiti
            </Button>

            {/* Mobile Button */}
            <Button
              onClick={() => {
                setEditingBudget(null)
                setIsDialogOpen(true)
              }}
              size="icon"
              className="md:hidden"
            >
              <PlusIcon className="h-5 w-5" />
            </Button>
          </div>

          <TabsContent value="active" className="mt-4 space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {paginatedActiveBudgets.map((budget) => {
                const category = expenseCategories.find(c => c.id === budget.categoryId)
                return (
                  <BudgetCard
                    key={budget.id}
                    category={category?.label || budget.category}
                    categoryId={budget.categoryId}
                    spent={Math.abs(budget.spent)}
                    limit={budget.limit}
                    period={budget.period}
                    startDate={budget.startDate}
                    endDate={budget.endDate}
                    icon={<span key={`icon-${budget.id}`} className="text-xl">{category?.icon}</span>}
                    onEdit={() => handleEdit(budget)}
                    onDelete={() => handleDelete(budget)}
                  />
                )
              })}
              {activeBudgetsWithSpent.length === 0 && (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  Aktif bütçe bulunmuyor
                </div>
              )}
            </div>
            {activeBudgetsWithSpent.length > ITEMS_PER_PAGE && (
              <Pagination
                currentPage={currentPage}
                totalPages={activeTotalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </TabsContent>

          <TabsContent value="expired" className="mt-4 space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {paginatedExpiredBudgets.map((budget) => {
                const category = expenseCategories.find(c => c.id === budget.categoryId)
                return (
                  <BudgetCard
                    key={budget.id}
                    category={category?.label || budget.category}
                    categoryId={budget.categoryId}
                    spent={Math.abs(budget.spent)}
                    limit={budget.limit}
                    period={budget.period}
                    startDate={budget.startDate}
                    endDate={budget.endDate}
                    icon={<span key={`icon-${budget.id}`} className="text-xl">{category?.icon}</span>}
                    onEdit={() => handleEdit(budget)}
                    onDelete={() => handleDelete(budget)}
                  />
                )
              })}
              {expiredBudgetsWithSpent.length === 0 && (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  Süresi dolmuş bütçe bulunmuyor
                </div>
              )}
            </div>
            {expiredBudgetsWithSpent.length > ITEMS_PER_PAGE && (
              <Pagination
                currentPage={currentPage}
                totalPages={expiredTotalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </TabsContent>
        </Tabs>
      </ClientOnly>

      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
        <DialogHeader>
          <BudgetForm
            initialData={editingBudget}
            existingBudgets={allBudgets}
            onSubmit={handleSubmit}
          />
        </DialogHeader>
        <DialogFooter />
      </Dialog>

      <Dialog open={isDeleteModalOpen} onClose={() => {
        setIsDeleteModalOpen(false)
        setDeletingBudget(null)
      }}>
        <DialogHeader>
          <DialogTitle>Bütçe Limitini Sil</DialogTitle>
        </DialogHeader>
        <DialogContent>
          <p>Bu bütçe limitini silmek istediğinizden emin misiniz?</p>
          <p className="text-sm text-muted-foreground mt-2">
            Bu işlem geri alınamaz.
          </p>
        </DialogContent>
        <DialogFooter>
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteModalOpen(false)
                setDeletingBudget(null)
              }}
            >
              İptal
            </Button>
            <Button
              variant="expense"
              onClick={handleConfirmDelete}
            >
              Sil
            </Button>
          </div>
        </DialogFooter>
      </Dialog>
    </div>
  )
} 