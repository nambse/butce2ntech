// UI bileşenleri için ortak tipler
export type BadgeVariant = 
  | "default"
  | "secondary"
  | "outline"
  | "income"
  | "expense"
  | "warning"
  | "success"
  | "error"
  | "saving"

export type ButtonVariant =
  | "default"
  | "secondary"
  | "ghost"
  | "income"
  | "expense"
  | "outline"

export type ButtonSize = "default" | "sm" | "lg" | "icon"

export type Size = "default" | "sm" | "lg"

export interface AnimationConfig {
  duration: number
  easing: AnimationTiming
}

export type AnimationTiming = 
  | "linear" 
  | "ease" 
  | "ease-in" 
  | "ease-out" 
  | "ease-in-out" 