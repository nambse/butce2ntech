"use client"

import { WalletIcon, CreditCardIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatCurrency, formatDate } from "@/lib/format"
import type { Transaction } from "@/types/transaction"

interface SearchTransactionCardProps {
  transaction: Transaction
  onClick?: () => void
}

export function SearchTransactionCard({ 
  transaction,
  onClick 
}: SearchTransactionCardProps) {
  const isIncome = transaction.type === 'income'
  const amount = Math.abs(transaction.amount)

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 rounded-md",
        "cursor-pointer hover:bg-muted/50 transition-colors",
        "group"
      )}
      onClick={onClick}
    >
      {/* İkon */}
      <div className={cn(
        "w-8 h-8 rounded-md flex items-center justify-center shrink-0",
        "bg-background group-hover:bg-muted transition-colors",
        isIncome ? "text-success" : "text-error"
      )}>
        {isIncome 
          ? <WalletIcon className="h-4 w-4" /> 
          : <CreditCardIcon className="h-4 w-4" />
        }
      </div>

      {/* İçerik */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium truncate">
                {transaction.description || transaction.category}
              </p>
              <span className="text-xs text-muted-foreground shrink-0">
                {formatDate(transaction.date)}
              </span>
            </div>
            {transaction.store && (
              <p className="text-xs text-muted-foreground truncate mt-0.5">
                {transaction.store}
              </p>
            )}
          </div>
          <p className={cn(
            "text-sm tabular-nums shrink-0",
            isIncome ? "text-success" : "text-error"
          )}>
            {isIncome ? "+" : "-"}{formatCurrency(amount)}
          </p>
        </div>
      </div>
    </div>
  )
}
