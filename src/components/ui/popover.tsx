"use client"

import * as React from "react"
import { useCallback, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

interface PopoverProps {
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

interface PopoverTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
}

interface PopoverContentProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: 'start' | 'center' | 'end'
  sideOffset?: number
}

const PopoverContext = React.createContext<{
  open: boolean
  onOpenChange: (open: boolean) => void
  triggerRef: React.RefObject<HTMLButtonElement>
  close: () => void
}>({
  open: false,
  onOpenChange: () => {},
  triggerRef: React.createRef(),
  close: () => {}
})

export function Popover({ 
  children, 
  open: controlledOpen, 
  onOpenChange 
}: PopoverProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)

  const open = controlledOpen ?? uncontrolledOpen
  const setOpen = onOpenChange ?? setUncontrolledOpen

  const close = useCallback(() => {
    setOpen(false)
  }, [setOpen])

  return (
    <PopoverContext.Provider 
      value={{ 
        open, 
        onOpenChange: setOpen,
        triggerRef,
        close
      }}
    >
      {children}
    </PopoverContext.Provider>
  )
}

export function PopoverTrigger({ 
  children,
  asChild,
  className,
  ...props 
}: PopoverTriggerProps) {
  const { open, onOpenChange, triggerRef } = React.useContext(PopoverContext)

  if (asChild) {
    return React.cloneElement(children as React.ReactElement, {
      ref: triggerRef,
      onClick: () => onOpenChange(!open),
      'aria-expanded': open,
      'aria-haspopup': true,
    })
  }

  return (
    <button
      ref={triggerRef}
      type="button"
      className={className}
      onClick={() => onOpenChange(!open)}
      aria-expanded={open}
      aria-haspopup={true}
      {...props}
    >
      {children}
    </button>
  )
}

export function PopoverContent({ 
  children,
  className,
  align = 'center',
  sideOffset = 4,
  ...props 
}: PopoverContentProps) {
  const { open, onOpenChange, triggerRef } = React.useContext(PopoverContext)
  const contentRef = useRef<HTMLDivElement>(null)

  const updatePosition = useCallback(() => {
    if (!open || !triggerRef.current || !contentRef.current) return

    const trigger = triggerRef.current.getBoundingClientRect()
    const content = contentRef.current.getBoundingClientRect()
    
    // Calculate left position
    let left = 0
    switch (align) {
      case 'start':
        left = trigger.left
        break
      case 'center':
        left = trigger.left + (trigger.width - content.width) / 2
        break
      case 'end':
        left = trigger.right - content.width
        break
    }

    // Ensure the popover doesn't go outside the viewport
    left = Math.max(16, Math.min(left, window.innerWidth - content.width - 16))

    // Calculate top position
    let top = trigger.bottom + sideOffset

    // If popover would go below viewport, position it above the trigger
    if (top + content.height > window.innerHeight - 16) {
      top = trigger.top - content.height - sideOffset
    }

    // Get the closest positioned ancestor
    let parent = triggerRef.current.parentElement
    let offsetParent = document.body
    while (parent) {
      const position = window.getComputedStyle(parent).position
      if (position === 'relative' || position === 'absolute' || position === 'fixed') {
        offsetParent = parent
        break
      }
      parent = parent.parentElement
    }

    // Adjust position based on offset parent
    const offsetParentRect = offsetParent.getBoundingClientRect()
    left -= offsetParentRect.left
    top -= offsetParentRect.top

    contentRef.current.style.position = 'absolute'
    contentRef.current.style.top = `${top}px`
    contentRef.current.style.left = `${left}px`
    contentRef.current.style.width = 'max-content'
  }, [open, align, sideOffset])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        contentRef.current?.contains(event.target as Node) ||
        triggerRef.current?.contains(event.target as Node) ||
        (event.target as Element)?.closest('.rdp')
      ) {
        return
      }
      onOpenChange(false)
    }

    const handleScroll = () => {
      requestAnimationFrame(updatePosition)
    }

    const handleResize = () => {
      requestAnimationFrame(updatePosition)
    }

    if (open) {
      requestAnimationFrame(updatePosition)
      document.addEventListener('mousedown', handleClickOutside)
      window.addEventListener('scroll', handleScroll, true)
      window.addEventListener('resize', handleResize)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      window.removeEventListener('scroll', handleScroll, true)
      window.removeEventListener('resize', handleResize)
    }
  }, [open, onOpenChange, updatePosition])

  if (!open) return null

  return (
    <div
      ref={contentRef}
      className={cn(
        "absolute z-50 rounded-md border bg-popover text-popover-foreground shadow-md outline-none",
        "animate-in fade-in-0 zoom-in-95 data-[side=bottom]:slide-in-from-top-2",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
} 