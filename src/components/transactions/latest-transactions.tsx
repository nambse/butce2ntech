"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TransactionCard } from "./transaction-card"
import { WalletIcon, CreditCardIcon } from "lucide-react"
import { formatDate } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { Transaction } from "@/types/transaction"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

interface LatestTransactionsProps {
  transactions: Transaction[]
  className?: string
  onEdit?: (transaction: Transaction) => void
  onDelete?: (transaction: Transaction) => void
}

export function LatestTransactions({ 
  transactions,
  className,
  onEdit,
  onDelete 
}: LatestTransactionsProps) {
  const router = useRouter()
  const showViewAll = transactions.length >= 4

  if (transactions.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Son İşlemler</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex flex-col items-center justify-center text-center">
            <WalletIcon className="h-12 w-12 text-muted-foreground/20" />
            <p className="mt-4 text-sm text-muted-foreground">
              Henüz işlem bulunmuyor
            </p>
            <p className="mt-1 text-xs text-muted-foreground/80">
              İşlem eklemek için İşlemler sayfasını ziyaret edin
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Group transactions by date
  const groupedTransactions = transactions.reduce((groups, transaction) => {
    const date = transaction.date
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(transaction)
    return groups
  }, {} as Record<string, Transaction[]>)

  // Sort dates in descending order
  const sortedDates = Object.keys(groupedTransactions).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  )

  return (
    <Card className={cn("min-h-[520px] overflow-hidden", className)}>
      <CardHeader>
        <CardTitle>Son İşlemler</CardTitle>
      </CardHeader>
      <CardContent className="relative">
        <div className="space-y-6">
          {sortedDates.map(date => (
            <div key={date} className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">
                {formatDate(date)}
              </h3>
              <div className="space-y-2">
                {groupedTransactions[date].map(transaction => (
                  <TransactionCard
                    key={transaction.id}
                    title={transaction.description || transaction.category}
                    amount={transaction.amount}
                    type={transaction.type}
                    date={formatDate(transaction.date)}
                    category={transaction.category}
                    description={transaction.store}
                    icon={transaction.type === "income" 
                      ? <WalletIcon className="h-4 w-4" /> 
                      : <CreditCardIcon className="h-4 w-4" />
                    }
                    className={cn(
                      "hover:bg-muted/50 transition-colors",
                      "cursor-default"
                    )}
                    onEdit={onEdit ? () => onEdit(transaction) : undefined}
                    onDelete={onDelete ? () => onDelete(transaction) : undefined}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {showViewAll && (
          <>
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-card via-card/95 to-transparent pointer-events-none" />
            <div className="absolute -bottom-4 left-0 right-0 h-4 bg-card" />
            <div className="absolute bottom-0 left-0 right-0 flex justify-center pb-6">
              <Button
                variant="outline"
                onClick={() => router.push('/transactions')}
              >
                Tüm İşlemleri Görüntüle
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
} 