export type AnimationTiming = "linear" | "ease" | "ease-in" | "ease-out" | "ease-in-out"

export interface AnimationConfig {
  duration: number
  easing: AnimationTiming
} 