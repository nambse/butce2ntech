"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SliderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'value' | 'onChange'> {
  value?: number[]
  onValueChange?: (value: number[]) => void
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  showValue?: boolean
}

const Slider = React.forwardRef<HTMLDivElement, SliderProps>(
  ({ 
    className,
    value = [0],
    onValueChange,
    min = 0,
    max = 100,
    step = 1,
    disabled = false,
    showValue = false,
    ...props
  }, ref) => {
    const [isDragging, setIsDragging] = React.useState(false)
    const [isFocused, setIsFocused] = React.useState(false)
    const sliderRef = React.useRef<HTMLDivElement>(null)

    const getValueFromPosition = (clientX: number) => {
      if (!sliderRef.current) return min

      const rect = sliderRef.current.getBoundingClientRect()
      const percentage = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
      const rawValue = min + (max - min) * percentage
      const steppedValue = Math.round(rawValue / step) * step
      return Math.max(min, Math.min(max, steppedValue))
    }

    const updateValue = (clientX: number) => {
      if (disabled) return
      const newValue = getValueFromPosition(clientX)
      onValueChange?.([newValue])
    }

    const handlePointerDown = (event: React.PointerEvent) => {
      if (disabled) return
      event.preventDefault()
      setIsDragging(true)
      updateValue(event.clientX)
      document.addEventListener('pointermove', handlePointerMove)
      document.addEventListener('pointerup', handlePointerUp)
      document.addEventListener('pointercancel', handlePointerUp)
    }

    const handlePointerMove = (event: PointerEvent) => {
      if (disabled) return
      updateValue(event.clientX)
    }

    const handlePointerUp = () => {
      setIsDragging(false)
      document.removeEventListener('pointermove', handlePointerMove)
      document.removeEventListener('pointerup', handlePointerUp)
      document.removeEventListener('pointercancel', handlePointerUp)
    }

    const handleTrackClick = (event: React.MouseEvent) => {
      if (disabled) return
      updateValue(event.clientX)
    }

    const handleKeyDown = (event: React.KeyboardEvent) => {
      if (disabled) return
      
      let newValue = value[0]
      switch (event.key) {
        case "ArrowRight":
        case "ArrowUp":
          newValue = Math.min(max, value[0] + step)
          break
        case "ArrowLeft":
        case "ArrowDown":
          newValue = Math.max(min, value[0] - step)
          break
        case "PageUp":
          newValue = Math.min(max, value[0] + step * 10)
          break
        case "PageDown":
          newValue = Math.max(min, value[0] - step * 10)
          break
        case "Home":
          newValue = min
          break
        case "End":
          newValue = max
          break
        default:
          return
      }
      
      event.preventDefault()
      onValueChange?.([newValue])
    }

    React.useEffect(() => {
      return () => {
        document.removeEventListener('pointermove', handlePointerMove)
        document.removeEventListener('pointerup', handlePointerUp)
        document.removeEventListener('pointercancel', handlePointerUp)
      }
    }, [])

    const percentage = ((value[0] - min) / (max - min)) * 100

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex w-full touch-none select-none items-center",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
        {...props}
      >
        <div
          ref={sliderRef}
          className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary"
          onClick={handleTrackClick}
        >
          <div
            className="absolute h-full bg-primary transition-colors"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div
          role="slider"
          tabIndex={disabled ? -1 : 0}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value[0]}
          aria-disabled={disabled}
          onPointerDown={handlePointerDown}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={cn(
            "absolute h-5 w-5 cursor-grab rounded-full border-2 border-primary bg-background shadow-sm transition",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            (isDragging || isFocused) && "scale-110",
            isDragging && "cursor-grabbing",
            disabled && "cursor-not-allowed"
          )}
          style={{ 
            left: `calc(${percentage}% - 0.625rem)`,
            touchAction: "none"
          }}
        >
          {showValue && (
            <div
              className={cn(
                "absolute -top-8 left-1/2 -translate-x-1/2 rounded bg-primary px-2 py-1",
                "text-xs font-semibold text-primary-foreground",
                "opacity-0 transition-opacity",
                (isDragging || isFocused) && "opacity-100"
              )}
            >
              %{value[0]}
            </div>
          )}
        </div>
      </div>
    )
  }
)
Slider.displayName = "Slider"

export { Slider } 