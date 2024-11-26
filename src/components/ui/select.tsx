"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronDown, Check, AlertCircle } from "lucide-react"

interface SelectContextValue<T extends string> {
  value?: T
  onValueChange?: (value: T) => void
}

interface SelectProps<T extends string> {
  value?: T
  onValueChange?: (value: T) => void
  children: React.ReactNode
  className?: string
  placeholder?: string
  error?: boolean | string
}

interface SelectItemProps<T extends string> extends React.HTMLAttributes<HTMLDivElement> {
  value: T
  children: React.ReactNode
  disabled?: boolean
}

const SelectContext = React.createContext<SelectContextValue<any>>({})

function Select<T extends string>({
  className,
  children,
  value,
  onValueChange,
  placeholder = "Seçiniz",
  error,
  ...props
}: SelectProps<T>) {
  const [open, setOpen] = React.useState(false)
  const selectRef = React.useRef<HTMLDivElement>(null)

  const selectedItem = React.Children.toArray(children).find(
    (child) => 
      React.isValidElement(child) && 
      'value' in child.props && 
      child.props.value === value
  ) as React.ReactElement | undefined

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open])

  const contextValue = React.useMemo(() => ({ value, onValueChange }), [value, onValueChange])

  return (
    <SelectContext.Provider value={contextValue}>
      <div className="relative" ref={selectRef}>
        <div
          className={cn(
            "flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && !value && "border-error focus:ring-error",
            "cursor-pointer",
            className
          )}
          onClick={() => setOpen(!open)}
          role="combobox"
          aria-expanded={open}
          aria-controls="select-content"
        >
          <span className={cn(
            "truncate",
            !selectedItem && "text-muted-foreground"
          )}>
            {selectedItem ? selectedItem.props.children : placeholder}
          </span>
          <ChevronDown className={cn(
            "h-4 w-4 shrink-0 opacity-50 transition-transform duration-200",
            open && "transform rotate-180"
          )} />
        </div>

        {error && !value && typeof error === 'string' && (
          <div className="flex items-center gap-2 mt-1.5">
            <AlertCircle className="h-4 w-4 text-error shrink-0" />
            <p className="text-xs text-error">{error}</p>
          </div>
        )}

        {open && (
          <div
            className={cn(
              "absolute z-50 min-w-[8rem] w-full mt-1 rounded-md border bg-popover text-popover-foreground shadow-md",
              "animate-in fade-in-0 zoom-in-95"
            )}
            id="select-content"
          >
            <div className="p-1 space-y-0.5">
              {React.Children.map(children, (child) => {
                if (React.isValidElement(child)) {
                  return React.cloneElement(child, {
                    ...child.props,
                    onClick: () => {
                      if (!child.props.disabled && onValueChange && 'value' in child.props) {
                        onValueChange(child.props.value)
                        setOpen(false)
                      }
                    }
                  })
                }
              })}
            </div>
          </div>
        )}
      </div>
    </SelectContext.Provider>
  )
}

function SelectItem<T extends string>({ 
  className, 
  children, 
  value, 
  disabled,
  onClick, 
  ...props 
}: SelectItemProps<T>) {
  const { value: selectedValue } = React.useContext(SelectContext)
  const isSelected = value === selectedValue

  return (
    <div
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none",
        "hover:bg-accent hover:text-accent-foreground",
        "focus:bg-accent focus:text-accent-foreground",
        isSelected && "bg-accent text-accent-foreground",
        disabled && "pointer-events-none opacity-50",
        className
      )}
      onClick={onClick}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        {isSelected && <Check className="h-4 w-4" />}
      </span>
      {children}
    </div>
  )
}

export { Select, SelectItem } 