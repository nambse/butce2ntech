"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { MinimizeIcon, MaximizeIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAppSelector } from "@/store/hooks"

export function DebugStorage() {
  const [storage, setStorage] = useState<Record<string, any>>({})
  const [isMinimized, setIsMinimized] = useState(false)
  const isDeveloperMode = useAppSelector((state) => 
    state.settings?.settings?.developer?.enabled ?? false
  )

  useEffect(() => {
    const updateStorage = () => {
      const items: Record<string, any> = {}
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key) {
          try {
            items[key] = JSON.parse(localStorage.getItem(key) || '')
          } catch {
            items[key] = localStorage.getItem(key)
          }
        }
      }
      setStorage(items)
    }

    updateStorage()
    
    window.addEventListener('storage', updateStorage)
    window.addEventListener('localStorageChange', updateStorage)

    return () => {
      window.removeEventListener('storage', updateStorage)
      window.removeEventListener('localStorageChange', updateStorage)
    }
  }, [])

  // Only show in development mode AND when developer mode is enabled
  if (process.env.NODE_ENV !== 'development' || !isDeveloperMode) return null

  return (
    <Card className={cn(
      "fixed right-4 transition-all duration-300",
      isMinimized 
        ? "bottom-4 w-12 h-12" 
        : "bottom-4 w-96 h-[500px]",
      "opacity-75 hover:opacity-100"
    )}>
      <CardHeader className={cn(
        "flex flex-row items-center",
        isMinimized ? "p-0" : "p-4 pb-2"
      )}>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-12 w-12 shrink-0",
            isMinimized && "hover:w-full hover:justify-start hover:px-3 hover:gap-2"
          )}
          onClick={() => setIsMinimized(!isMinimized)}
        >
          {isMinimized ? (
            <>
              <MaximizeIcon className="h-4 w-4" />
              <span className="hidden group-hover:inline">Expand Debug</span>
            </>
          ) : (
            <MinimizeIcon className="h-4 w-4" />
          )}
        </Button>
        {!isMinimized && (
          <CardTitle className="text-sm">Local Storage Debug</CardTitle>
        )}
      </CardHeader>
      {!isMinimized && (
        <CardContent className="p-4 pt-0 h-[calc(100%-64px)] overflow-auto">
          <pre className="text-xs whitespace-pre-wrap">
            {JSON.stringify(storage, null, 2)}
          </pre>
        </CardContent>
      )}
    </Card>
  )
} 