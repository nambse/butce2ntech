"use client"

import { TransactionCard } from "./transaction-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Modal, ModalHeader, ModalTitle, ModalContent, ModalFooter } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/format"
import { CreditCardIcon, WalletIcon, PlusIcon } from "lucide-react"
import { useState } from "react"

// Components
import { TransactionForm } from "./transaction-form"

// Types
import type { Transaction } from "@/types/transaction"

interface TransactionListProps {
  transactions: Transaction[]
  title?: string
  className?: string
  onEdit?: (transaction: Transaction) => void
  onDelete?: (transaction: Transaction) => void
  onAddNew?: () => void
}

interface GroupedTransactions {
  [key: string]: Transaction[]
}

export function TransactionList({ 
  transactions, 
  title = "İşlem Listesi",
  className,
  onEdit,
  onDelete,
  onAddNew,
}: TransactionListProps) {
  // Modal state
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  // İşlem işleyicileri
  const handleEdit = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setIsEditModalOpen(true)
  }

  const handleDelete = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = () => {
    if (selectedTransaction && onDelete) {
      onDelete(selectedTransaction)
    }
    setIsDeleteModalOpen(false)
    setSelectedTransaction(null)
  }

  // İşlemleri tarihe göre grupla ve her grup içinde en yeni işlemler üstte olacak şekilde sırala
  const groupedTransactions = transactions.reduce((groups, transaction) => {
    const date = transaction.date
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(transaction)
    
    // Her grup içindeki işlemleri ID'ye göre sırala (en yeni üstte)
    groups[date].sort((a, b) => {
      // ID'ler timestamp içerdiği için, büyük olan ID daha yeni demektir
      return b.id.localeCompare(a.id)
    })
    
    return groups
  }, {} as GroupedTransactions)

  // Tarihleri sırala (en yeni en üstte)
  const sortedDates = Object.keys(groupedTransactions).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  )

  // İşlem yoksa bilgi mesajı göster
  if (transactions.length === 0) {
    return (
      <EmptyState 
        title={title} 
        className={className}
        onAddNew={onAddNew}
      />
    )
  }

  return (
    <>
      <TransactionListContent 
        title={title}
        className={className}
        sortedDates={sortedDates}
        groupedTransactions={groupedTransactions}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAddNew={onAddNew}
      />

      <EditModal 
        isOpen={isEditModalOpen}
        transaction={selectedTransaction}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedTransaction(null)
        }}
        onEdit={onEdit}
      />

      <DeleteModal 
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setSelectedTransaction(null)
        }}
        onConfirm={handleConfirmDelete}
      />
    </>
  )
}

// Alt Bileşenler
interface EmptyStateProps {
  title: string
  className?: string
  onAddNew?: () => void
}

function EmptyState({ title, className, onAddNew }: EmptyStateProps) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        {onAddNew && (
          <>
            <Button 
              onClick={onAddNew}
              className="hidden md:flex"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Yeni İşlem
            </Button>

            <Button
              onClick={onAddNew}
              size="icon"
              className="md:hidden"
            >
              <PlusIcon className="h-5 w-5" />
            </Button>
          </>
        )}
      </CardHeader>
      <CardContent>
        <div className="h-[400px] flex flex-col items-center justify-center text-center">
          <WalletIcon className="h-12 w-12 text-muted-foreground/20" />
          <p className="mt-4 text-sm text-muted-foreground">
            Henüz işlem bulunmuyor
          </p>
          <p className="mt-1 text-xs text-muted-foreground/80">
            İşlem eklemek için yukarıdaki "Yeni İşlem" butonunu kullanın
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

interface TransactionListContentProps {
  title: string
  className?: string
  sortedDates: string[]
  groupedTransactions: GroupedTransactions
  onEdit: (transaction: Transaction) => void
  onDelete: (transaction: Transaction) => void
  onAddNew?: () => void
}

function TransactionListContent({
  title,
  className,
  sortedDates,
  groupedTransactions,
  onEdit,
  onDelete,
  onAddNew
}: TransactionListContentProps) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        {onAddNew && (
          <>
            <Button 
              onClick={onAddNew}
              className="hidden md:flex"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Yeni İşlem
            </Button>

            <Button
              onClick={onAddNew}
              size="icon"
              className="md:hidden"
            >
              <PlusIcon className="h-5 w-5" />
            </Button>
          </>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {sortedDates.map(date => (
          <div key={date} className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              {formatDate(date)}
            </h3>
            <div className="space-y-2">
              {groupedTransactions[date].map(transaction => (
                <TransactionCard
                  key={transaction.id}
                  type={transaction.type}
                  title={transaction.description || transaction.category}
                  amount={transaction.amount}
                  date={formatDate(transaction.date)}
                  category={transaction.category}
                  description={transaction.store}
                  icon={transaction.type === "income" 
                    ? <WalletIcon className="h-4 w-4" /> 
                    : <CreditCardIcon className="h-4 w-4" />
                  }
                  onEdit={() => onEdit(transaction)}
                  onDelete={() => onDelete(transaction)}
                />
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

interface EditModalProps {
  isOpen: boolean
  transaction: Transaction | null
  onClose: () => void
  onEdit?: (transaction: Transaction) => void
}

function EditModal({ isOpen, transaction, onClose, onEdit }: EditModalProps) {
  return (
    <Modal open={isOpen} onClose={onClose}>
      <ModalHeader>
        <ModalTitle>İşlemi Düzenle</ModalTitle>
      </ModalHeader>
      <ModalContent>
        <TransactionForm
          open={isOpen}
          onOpenChange={(open) => {
            if (!open) onClose()
          }}
          initialData={transaction ? {
            type: transaction.type,
            amount: Math.abs(transaction.amount),
            category: transaction.category,
            description: transaction.description,
            date: transaction.date,
          } : undefined}
          onSubmit={(data) => {
            if (transaction && onEdit) {
              onEdit({ 
                ...transaction, 
                ...data,
                amount: data.type === "expense" ? -Math.abs(data.amount) : Math.abs(data.amount)
              })
            }
          }}
        />
      </ModalContent>
    </Modal>
  )
}

interface DeleteModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

function DeleteModal({ isOpen, onClose, onConfirm }: DeleteModalProps) {
  return (
    <Modal open={isOpen} onClose={onClose}>
      <ModalHeader>
        <ModalTitle>İşlemi Sil</ModalTitle>
      </ModalHeader>
      <ModalContent>
        <p>Bu işlemi silmek istediğinizden emin misiniz?</p>
        <p className="text-sm text-muted-foreground mt-2">
          Bu işlem geri alınamaz.
        </p>
      </ModalContent>
      <ModalFooter>
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
          <Button
            variant="outline"
            onClick={onClose}
          >
            İptal
          </Button>
          <Button
            variant="expense"
            onClick={onConfirm}
          >
            Sil
          </Button>
        </div>
      </ModalFooter>
    </Modal>
  )
} 