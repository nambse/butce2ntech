import * as React from "react"
import { cn } from "@/lib/utils"

// Badge varyantları
const badgeVariants = {
  default: "bg-primary/10 text-primary border-primary/20 border",
  secondary: "bg-secondary text-secondary-foreground",
  outline: "border border-input bg-background text-foreground",
  income: "bg-income/10 text-income border-income/20 border",
  expense: "bg-expense/10 text-expense border-expense/20 border",
  warning: "bg-warning/10 text-warning border-warning/20 border",
  success: "bg-success/10 text-success border-success/20 border",
  error: "bg-error/10 text-error border-error/20 border",
  saving: "bg-saving/10 text-saving border-saving/20 border",
}

// Badge boyutları
const badgeSizes = {
  default: "px-2.5 py-0.5 text-xs",
  sm: "px-2 py-0.5 text-xs",
  lg: "px-3 py-1 text-sm",
}

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement> {
  variant?: keyof typeof badgeVariants
  size?: keyof typeof badgeSizes
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-full font-medium ring-offset-background transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          badgeVariants[variant],
          badgeSizes[size],
          className
        )}
        {...props}
      />
    )
  }
)
Badge.displayName = "Badge"

export { Badge, badgeVariants } 