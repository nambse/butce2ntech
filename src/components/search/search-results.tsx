"use client"

import { useRouter } from 'next/navigation'
import { Loader2Icon } from 'lucide-react'
import { SearchTransactionCard } from './search-transaction-card'
import { SearchXIcon } from 'lucide-react'
import { cn } from "@/lib/utils"
import type { Transaction } from '@/types/transaction'

interface SearchResultsProps {
  results: Transaction[]
  isSearching: boolean
  onClose: () => void
  className?: string
}

export function SearchResults({ 
  results, 
  isSearching,
  onClose,
}: SearchResultsProps) {
  const router = useRouter()

  // Mobilde sakla
  if (!isSearching && results.length === 0) {
    return null
  }

  return (
    <div className={cn(
      "absolute z-50 w-full rounded-md border bg-popover text-popover-foreground shadow-md",
      "hidden md:block", // Mobilde sakla, desktopda görüntüle
      "md:w-[400px] md:mt-2"
    )}>
      {isSearching ? (
        <div className="flex items-center justify-center py-8">
          <Loader2Icon className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="py-2 space-y-1">
          {results.map((transaction) => (
            <SearchTransactionCard 
              key={transaction.id} 
              transaction={transaction}
              onClick={() => {
                router.push('/transactions')
                onClose()
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
