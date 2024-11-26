"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { AlertCircle } from "lucide-react"

export interface MoneyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value?: number
  onChange?: (value: number) => void
  currency?: string
  allowNegative?: boolean
  error?: boolean | string
}

const MoneyInput = React.forwardRef<HTMLInputElement, MoneyInputProps>(
  ({ className, value, onChange, currency = '₺', allowNegative = false, error, ...props }, ref) => {
    const [displayValue, setDisplayValue] = React.useState(() => {
      if (typeof value === 'number') {
        return value.toString()
      }
      return ''
    })

    const formatValue = (val: string) => {
      let formatted = val.replace(/[^\d.-]/g, '')
      
      if (!allowNegative) {
        formatted = formatted.replace(/-/g, '')
      }

      const parts = formatted.split('.')
      if (parts.length > 2) {
        formatted = `${parts[0]}.${parts.slice(1).join('')}`
      }

      if (parts[1]?.length > 2) {
        formatted = `${parts[0]}.${parts[1].slice(0, 2)}`
      }

      return formatted
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const formatted = formatValue(e.target.value)
      setDisplayValue(formatted)
      
      const numericValue = parseFloat(formatted)
      if (!isNaN(numericValue)) {
        onChange?.(numericValue)
      } else if (formatted === '' || formatted === '-') {
        onChange?.(0)
      }
    }

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      const numericValue = parseFloat(displayValue)
      if (!isNaN(numericValue)) {
        setDisplayValue(numericValue.toFixed(2))
      }
      props.onBlur?.(e)
    }

    return (
      <div className="relative">
        <div className="relative">
          <input
            {...props}
            ref={ref}
            type="text"
            inputMode="decimal"
            value={displayValue}
            onChange={handleChange}
            onBlur={handleBlur}
            className={cn(
              "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
              "placeholder:text-muted-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              "disabled:cursor-not-allowed disabled:opacity-50",
              error && "border-error focus-visible:ring-error",
              "pr-8",
              className
            )}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
            {currency}
          </div>
        </div>
        {error && typeof error === 'string' && (
          <div className="flex items-center gap-2 mt-1.5">
            <AlertCircle className="h-4 w-4 text-error shrink-0" />
            <p className="text-xs text-error">{error}</p>
          </div>
        )}
      </div>
    )
  }
)
MoneyInput.displayName = "MoneyInput"

export { MoneyInput } 