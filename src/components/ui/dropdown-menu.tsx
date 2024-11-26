"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface DropdownMenuProps {
  children: React.ReactNode
  className?: string
}

const DropdownMenu = ({ children, className }: DropdownMenuProps) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  // Handle click outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Handle escape key
  React.useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false)
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
    }

    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen])

  return (
    <div className={cn("relative inline-block", className)} ref={dropdownRef}>
      {React.Children.map(children, child => {
        if (!React.isValidElement(child)) return child

        if (child.type === DropdownMenuTrigger) {
          return React.cloneElement(child as React.ReactElement<any>, {
            onClick: (e: React.MouseEvent) => {
              e.stopPropagation()
              child.props.onClick?.(e)
              setIsOpen(!isOpen)
            }
          })
        }

        if (child.type === DropdownMenuContent) {
          return isOpen ? React.cloneElement(child as React.ReactElement<any>, {
            onClose: () => setIsOpen(false),
            children: React.Children.map(child.props.children, menuChild => {
              if (!React.isValidElement(menuChild)) return menuChild
              
              // Pass onClose to all DropdownMenuItem components
              if (menuChild.type === DropdownMenuItem) {
                return React.cloneElement(menuChild, {
                  onClose: () => setIsOpen(false)
                })
              }
              
              // Handle nested divs containing DropdownMenuItems
              if (menuChild.props.children) {
                return React.cloneElement(menuChild, {
                  children: React.Children.map(menuChild.props.children, grandChild => {
                    if (!React.isValidElement(grandChild)) return grandChild
                    if (grandChild.type === DropdownMenuItem) {
                      return React.cloneElement(grandChild, {
                        onClose: () => setIsOpen(false)
                      })
                    }
                    return grandChild
                  })
                })
              }
              
              return menuChild
            })
          }) : null
        }

        return child
      })}
    </div>
  )
}

interface DropdownMenuTriggerProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean
  children: React.ReactNode
}

const DropdownMenuTrigger = React.forwardRef<HTMLDivElement, DropdownMenuTriggerProps>(
  ({ children, className, asChild, ...props }, ref) => {
    if (asChild && React.isValidElement(children)) {
      const child = children as React.ReactElement<any>
      
      // Handle Button components differently
      if (child.type === 'button' || (typeof child.type === 'function' && child.type.name === 'Button')) {
        return React.cloneElement(child, {
          ...child.props,
          onClick: (e: React.MouseEvent) => {
            e.preventDefault()
            child.props.onClick?.(e)
            props.onClick?.(e as any)
          },
        })
      }

      // For other elements
      const childProps = {
        ...child.props,
        onClick: (e: React.MouseEvent<HTMLElement>) => {
          e.preventDefault()
          child.props.onClick?.(e)
          props.onClick?.(e as any)
        },
      }

      return React.cloneElement(child, childProps)
    }

    return (
      <div 
        ref={ref} 
        className={cn("cursor-pointer", className)} 
        {...props}
      >
        {children}
      </div>
    )
  }
)
DropdownMenuTrigger.displayName = "DropdownMenuTrigger"

interface DropdownMenuContentProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: "start" | "end"
  children: React.ReactNode
  onClose?: () => void
}

const DropdownMenuContent = React.forwardRef<HTMLDivElement, DropdownMenuContentProps>(
  ({ className, align = "start", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          // Base styles
          "absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md",
          
          // Animation
          "animate-in fade-in-0 zoom-in-95 duration-100",
          
          // Positioning
          "top-full mt-2",
          align === "end" ? "right-0" : "left-0",
          
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
DropdownMenuContent.displayName = "DropdownMenuContent"

interface DropdownMenuItemProps extends React.HTMLAttributes<HTMLDivElement> {
  onClose?: () => void
}

const DropdownMenuItem = React.forwardRef<
  HTMLDivElement,
  DropdownMenuItemProps
>(({ className, onClick, onClose, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
      "transition-colors hover:bg-accent hover:text-accent-foreground",
      "focus:bg-accent focus:text-accent-foreground",
      className
    )}
    onClick={(e) => {
      onClick?.(e)
      onClose?.()
    }}
    {...props}
  />
))
DropdownMenuItem.displayName = "DropdownMenuItem"

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} 