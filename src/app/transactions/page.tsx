"use client"

import { useState } from "react"
import { TransactionList } from "@/components/transactions/transaction-list"
import { TransactionForm } from "@/components/transactions/transaction-form"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { 
  addTransaction, 
  updateTransaction, 
  deleteTransaction
} from "@/store/slices/transactionsSlice"
import type { Transaction, TransactionFormData } from "@/types/transaction"
import { ClientOnly } from "@/components/client-only"
import { Pagination } from "@/components/ui/pagination"

const ITEMS_PER_PAGE = 7

export default function TransactionsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const dispatch = useAppDispatch()
  const transactions = useAppSelector((state) => state.transactions.items)

  const handleEdit = (transaction: Transaction) => {
    dispatch(updateTransaction(transaction.id, {
      type: transaction.type,
      amount: transaction.amount,
      category: transaction.category,
      description: transaction.description,
      date: transaction.date,
      store: transaction.store
    }))
    setIsFormOpen(false)
  }

  const handleDelete = (transaction: Transaction) => {
    dispatch(deleteTransaction(transaction.id))
  }

  const handleAddTransaction = (data: TransactionFormData) => {
    dispatch(addTransaction(data))
    setIsFormOpen(false)
  }

  const sortedTransactions = [...transactions].sort((a, b) => {
    const dateA = new Date(a.date).getTime()
    const dateB = new Date(b.date).getTime()
    if (dateA === dateB) {
      return b.id.localeCompare(a.id)
    }
    return dateB - dateA
  })

  const totalPages = Math.ceil(sortedTransactions.length / ITEMS_PER_PAGE)
  const paginatedTransactions = sortedTransactions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  return (
    <div className="space-y-6 pt-4">
      <ClientOnly>
        <div className="space-y-4">
          <TransactionList 
            transactions={paginatedTransactions} 
            onEdit={handleEdit}
            onDelete={handleDelete}
            onAddNew={() => setIsFormOpen(true)}
          />

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
      </ClientOnly>

      <TransactionForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleAddTransaction}
      />
    </div>
  )
} 