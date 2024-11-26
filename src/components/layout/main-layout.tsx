"use client"

import { useState, useEffect } from "react"
import { Header } from "./header"
import { Sidebar } from "./sidebar"
import { cn } from "@/lib/utils"
import { ClientOnly } from "../client-only"

// Ana düzen bileşeni için prop tipleri
interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  // Kenar çubuğu durumları
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)        // Mobil görünümde açık/kapalı
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)  // Masaüstü görünümde daraltılmış/genişletilmiş

  // Mobil görünümde kenar çubuğu dışına tıklandığında kapatma
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (window.innerWidth < 768 && isSidebarOpen) {
        const sidebar = document.querySelector('[data-sidebar]')
        const target = event.target as HTMLElement
        
        // Check if the click is on a link or button inside the sidebar
        const isClickOnNavItem = target.closest('a') || target.closest('button')
        
        // Only close if it's not a navigation item and outside the sidebar
        if (sidebar && !sidebar.contains(event.target as Node) && !isClickOnNavItem) {
          setIsSidebarOpen(false)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isSidebarOpen])

  // Ekran boyutu masaüstüne geçtiğinde mobil kenar çubuğunu kapatma
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <ClientOnly>
    <div className="min-h-screen bg-background antialiased">
      {/* İçerik için üst bulanıklık efekti */}
      <div className={cn(
        "fixed z-30",
        "top-0 left-0 right-0 h-6",
        "bg-background/80 backdrop-blur-sm",
        "md:left-[calc(16rem+2rem)]",
        isSidebarCollapsed && "md:left-[calc(4.5rem+2rem)]",
        "transition-all duration-300 ease-in-out",
        isSidebarOpen && "md:hidden" // Mobil kenar çubuğu açıkken gizle
      )} />

      {/* Mobil Arka Plan Örtüsü */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm md:hidden"
        />
      )}

      {/* Masaüstü Yüzen Kenar Çubuğu */}
      <div className={cn(
        "fixed top-6 bottom-6 left-6 z-40",
        "w-64 hidden md:flex",
        isSidebarCollapsed && "w-[4.5rem]",
        "transition-all duration-300 ease-in-out"
      )}>
        <Sidebar
          data-sidebar
          isOpen={false}
          isCollapsed={isSidebarCollapsed}
          onCollapse={setIsSidebarCollapsed}
          className={cn(
            "rounded-lg shadow-md border h-full",
            "transition-all duration-300 ease-in-out"
          )}
        />
      </div>

      {/* Mobil Kenar Çubuğu */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 md:hidden",
        "w-[280px] bg-background",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full",
        "transition-transform duration-300 ease-in-out"
      )}>
        <Sidebar
          data-sidebar
          isOpen={isSidebarOpen}
          isCollapsed={false}
          onClose={() => setIsSidebarOpen(false)}
          className="h-full border-r"
          isMobile
        />
      </div>

      {/* Üst Başlık */}
      <Header 
        onMenuClick={() => setIsSidebarOpen(true)} 
        isSidebarCollapsed={isSidebarCollapsed}
        isSidebarOpen={isSidebarOpen}
        className="border-border"
      />

      {/* Ana İçerik Alanı */}
      <main className={cn(
        "transition-all duration-300 ease-in-out",
        "px-4 pt-20 pb-6",                    // Mobil iç boşluk
        "md:px-6 md:pt-24 md:pb-6",          // Masaüstü iç boşluk
        "md:pl-[21rem]",                      // Kenar çubuğu genişliği (16rem) + boşluk (5rem)
        isSidebarCollapsed && "md:pl-[7.5rem]", // Daraltılmış kenar çubuğu genişliği (4.5rem) + boşluk (3rem)
        "max-w-[1600px] mx-auto"              // Maksimum genişlik sınırı
      )}>
        <div className="w-full space-y-6">
          {children}
        </div>
      </main>
    </div>
    </ClientOnly>
  )
} 