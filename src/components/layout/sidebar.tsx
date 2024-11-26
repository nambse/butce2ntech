"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  WalletIcon,
  PieChartIcon,
  BarChart3Icon,
  SettingsIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  LayoutDashboardIcon,
} from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"

// Kenar çubuğu bileşeni için prop tipleri
interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  isOpen?: boolean                          // Mobil görünümde açık/kapalı durumu
  isCollapsed?: boolean                     // Masaüstü görünümde daraltılmış/genişletilmiş durumu
  onCollapse?: (collapsed: boolean) => void // Daraltma/genişletme işlevi
  onClose?: () => void                      // Mobil görünümde kapatma işlevi
  isMobile?: boolean                        // Mobil görünüm kontrolü
  className?: string                        // Ek stil sınıfları
}

// Ana navigasyon öğeleri
const navigation = [
  {
    name: "Genel Bakış",
    href: "/overview",
    icon: LayoutDashboardIcon,
    description: "Finansal durumunuza genel bakış",
  },
  {
    name: "İşlemler",
    href: "/transactions",
    icon: WalletIcon,
    description: "Gelir ve gider işlemleriniz",
  },
  {
    name: "Bütçe",
    href: "/budgets",
    icon: PieChartIcon,
    description: "Bütçe limitleri ve takibi",
  },
  {
    name: "Raporlar",
    href: "/reports",
    icon: BarChart3Icon,
    description: "Detaylı finansal raporlar",
  },
]

// İkincil navigasyon öğeleri
const secondaryNavigation = [
  {
    name: "Ayarlar",
    href: "/settings",
    icon: SettingsIcon,
    description: "Uygulama ayarları",
  },
]

export function Sidebar({ 
  isOpen, 
  isCollapsed = false,
  onCollapse,
  onClose, 
  isMobile,
  className,
  ...props
}: SidebarProps) {
  const pathname = usePathname()

  // Modified NavigationItem component
  const NavigationItem = ({ item, isActive }: { 
    item: typeof navigation[0], 
    isActive: boolean 
  }) => {
    const handleClick = () => {
      if (isMobile && onClose) {
        onClose()
      }
    }

    return (
      <Link
        key={item.name}
        href={item.href}
        onClick={handleClick}
        title={isCollapsed && !isMobile ? item.description : undefined}
        className={cn(
          "group flex items-center rounded-[var(--radius)] text-sm transition-all duration-300 ease-in-out",
          isActive
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:bg-muted hover:text-foreground hover:shadow-sm",
          !isCollapsed || isMobile ? "gap-x-3 px-3 py-2.5" : "h-10 w-10 justify-center mx-auto"
        )}
      >
        <item.icon className={cn(
          "h-5 w-5 shrink-0 transition-colors duration-200",
          isActive 
            ? "text-primary-foreground" 
            : "text-muted-foreground/70 group-hover:text-foreground/70"
        )} />
        {(!isCollapsed || isMobile) && (
          <div className="flex flex-col truncate">
            <span className={cn(
              "font-medium leading-none",
              !isActive && "text-foreground"
            )}>
              {item.name}
            </span>
            <span className={cn(
              "text-xs mt-1 truncate",
              isActive 
                ? "text-primary-foreground/80" 
                : "text-muted-foreground/80 group-hover:text-foreground/60"
            )}>
              {item.description}
            </span>
          </div>
        )}
      </Link>
    )
  }

  return (
    <div
      {...props}
      className={cn(
        "flex flex-col bg-card h-full",
        !isMobile && [
          "w-64 md:w-64",
          isCollapsed && "md:w-[4.5rem]",
          !isOpen && "-translate-x-full md:translate-x-0",
          "transition-[width,transform] duration-300 ease-in-out",
        ],
        className
      )}
    >
      {/* Logo ve Başlık Alanı */}
      <div className="h-16 flex items-center justify-between px-4 border-b relative">
        <div className={cn(
          "flex items-center gap-3",
          isCollapsed && "justify-center w-full"
        )}>
          {isCollapsed ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onCollapse?.(!isCollapsed)}
              aria-label="Menüyü Genişlet"
            >
              <ChevronRightIcon className="h-4 w-4 text-muted-foreground" />
            </Button>
          ) : (
            <>
            <WalletIcon className="h-6 w-6 text-primary shrink-0" />
              <span className="font-semibold tracking-tight truncate text-foreground">
                Bütçe Takip
              </span>
              {!isMobile && (
                <Button
                  variant="ghost"
                size="icon"
                className="h-8 w-8 absolute right-3"
                onClick={() => onCollapse?.(!isCollapsed)}
                aria-label="Menüyü Daralt"
              >
                <ChevronLeftIcon className="h-4 w-4 text-muted-foreground" />
              </Button>)}
            </>
          )}
        </div>

        {/* Mobil Kapatma Butonu */}
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Menüyü Kapat"
          >
            <ChevronLeftIcon className="h-5 w-5 text-muted-foreground" />
          </Button>
        )}
      </div>

      {/* Ana Navigasyon */}
      <nav className="flex-1 space-y-2 p-2 mt-2">
        {navigation.map((item) => (
          <NavigationItem 
            key={item.name}
            item={item} 
            isActive={pathname === item.href} 
          />
        ))}
      </nav>

      {/* İkincil Navigasyon */}
      <div className="p-2 border-t border-border/60">
        {secondaryNavigation.map((item) => (
          <NavigationItem 
            key={item.name}
            item={item} 
            isActive={pathname === item.href} 
          />
        ))}
      </div>
    </div>
  )
} 