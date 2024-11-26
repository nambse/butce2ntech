"use client"

import { WalletIcon, MenuIcon, BellIcon, SearchIcon, PlusIcon, XIcon, MinusIcon, ChevronRightIcon, ZapIcon, SunIcon, MoonIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { useCallback, useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"
import { useTheme } from "@/components/theme-provider"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { updateTheme } from "@/store/slices/settingsSlice"
import { selectUnreadNotifications, markAllAsRead, markAsRead } from "@/store/slices/notificationsSlice"
import { TransactionForm } from "@/components/transactions/transaction-form"
import { addTransaction } from "@/store/slices/transactionsSlice"
import { NotificationsModal } from "@/components/notifications/notifications-modal"
import { formatDistanceToNow } from "date-fns"
import { tr } from "date-fns/locale"
import { SearchResults } from "@/components/search/search-results"
import { setSearchQuery, setSearchResults, setIsSearching, clearSearch } from "@/store/slices/searchSlice"
import { searchTransactions } from "@/lib/search"
import debounce from "lodash/debounce"

// Header bileşeni için tip tanımlamaları
interface HeaderProps {
  onMenuClick?: () => void
  isSidebarCollapsed?: boolean
  isSidebarOpen?: boolean
  className?: string
}

// Sayfa başlıklarının tanımlanması
const pageTitles: Record<string, string> = {
  "/overview": "Genel Bakış",
  "/transactions": "Gelir Gider İşlemleri",
  "/budgets": "Bütçe Limitleri",
  "/reports": "Finansal Raporlar",
  "/settings": "Uygulama Ayarları",
}

export function Header({ onMenuClick, isSidebarCollapsed, isSidebarOpen, className }: HeaderProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isTransactionFormOpen, setIsTransactionFormOpen] = useState(false)
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('expense')
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false)

  const searchContainerRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const pathname = usePathname()
  const { theme } = useTheme()
  const dispatch = useAppDispatch()
  const notifications = useAppSelector(selectUnreadNotifications)
  const transactions = useAppSelector((state) => state.transactions.items)
  const searchResults = useAppSelector((state) => state.search.results)
  const isSearching = useAppSelector((state) => state.search.isSearching)

  // Arama işlemini debounce ile geciktirme
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      dispatch(setIsSearching(true))
      const results = searchTransactions(transactions, query)
      dispatch(setSearchResults(results))
      dispatch(setIsSearching(false))
    }, 300),
    [transactions]
  )

  // Arama sorgusunu güncelleme
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    dispatch(setSearchQuery(query))
    debouncedSearch(query)
  }

  // Arama alanı dışına tıklandığında kapanma işlemi
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false)
        dispatch(clearSearch())
      }
    }

    if (isSearchOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isSearchOpen])

  // Ekran boyutu değiştiğinde mobil arama alanının kapatılması
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsSearchOpen(false)
        dispatch(clearSearch())
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // İşlem işleyicileri
  const handleThemeToggle = () => {
    const newTheme = theme === 'system' ? 'light' : theme === 'light' ? 'dark' : 'light'
    dispatch(updateTheme(newTheme))
  }

  const handleQuickTransaction = (type: 'income' | 'expense') => {
    setTransactionType(type)
    setIsTransactionFormOpen(true)
  }

  const handleMarkAllAsRead = () => {
    dispatch(markAllAsRead())
  }

  const handleMarkAsRead = (id: string) => {
    dispatch(markAsRead(id))
  }

  return (
    <div className={cn(
      "fixed z-40",
      "top-0 left-0 right-0",
      isSidebarOpen ? "hidden" : "block",
      "md:block",
      "md:top-6 md:right-6",
      "md:left-[calc(16rem+5rem)]",
      isSidebarCollapsed && "md:left-[calc(4.5rem+3rem)]",
      "transition-all duration-300 ease-in-out"
    )}>
      <header className={cn(
        "bg-card/80 backdrop-blur-sm supports-[backdrop-filter]:bg-card/60 shadow-sm",
        "border-b border-border",
        "md:border md:rounded-lg",
        theme === 'dark' && "border-border/40",
        className
      )}>
        <div className="flex h-14 items-center justify-between px-4">
          {/* Left Section */}
          <div className={cn(
            "flex items-center gap-3",
            isSearchOpen && "hidden md:flex"
          )}>
            {/* Mobile Menu Button & App Name */}
            <div className="flex items-center gap-3 md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={onMenuClick}
                className="hover:bg-accent"
              >
                <MenuIcon className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-2">
                <WalletIcon className="h-5 w-5 text-primary" />
                <span className="font-semibold">Bütçe Takip</span>
              </div>
            </div>

            {/* Desktop Title Section */}
            {isSidebarCollapsed ? (
              <div className="hidden md:flex items-center gap-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <WalletIcon className="h-6 w-6 text-primary shrink-0" />
                  <span className="font-medium tracking-tight truncate text-foreground">
                    Bütçe Takip
                  </span>
                  <ChevronRightIcon className="h-4 w-4 text-muted-foreground" />
                </div>
                <span className="font-semibold text-foreground">
                  {pageTitles[pathname] || ""}
                </span>
              </div>
            ) : (
              <h1 className="hidden md:block text-base font-semibold text-">
                {pageTitles[pathname] || ""}
              </h1>
            )}
          </div>

          {/* Mobile Search */}
          {isSearchOpen && (
            <div 
              ref={searchContainerRef}
              className={cn(
                "absolute inset-x-0 top-0 h-14 px-4 flex items-center gap-2",
                "bg-card border-b border-border",
                theme === 'dark' && "border-border/40",
                "md:hidden"
              )}
            >
              <div className="relative flex-1">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  ref={searchInputRef}
                  placeholder="İşlem veya kategori ara..."
                  className="pl-9 w-full bg-background/60"
                  onChange={handleSearchChange}
                  autoFocus
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setIsSearchOpen(false)
                  dispatch(clearSearch())
                }}
              >
                <XIcon className="h-5 w-5" />
              </Button>
            </div>
          )}

          {/* Right Section */}
          <div className={cn(
            "flex items-center gap-2",
            isSearchOpen && "hidden md:flex"
          )}>
            {/* Desktop Search */}
            <div className="relative hidden md:block">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="İşlem veya kategori ara..."
                  className="pl-9 w-[300px] bg-background/60"
                  onChange={handleSearchChange}
                />
              </div>
              <SearchResults 
                results={searchResults}
                isSearching={isSearching}
                onClose={() => dispatch(clearSearch())}
              />
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              {/* Mobile Actions */}
              <div className="flex md:hidden items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsSearchOpen(true)}
                >
                  <SearchIcon className="h-5 w-5" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                    >
                      <PlusIcon className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent 
                    align="end" 
                    className="w-[280px]"
                  >
                    <div className="p-2">
                      <h3 className="px-2 py-1.5 text-sm font-medium text-muted-foreground">Hızlı İşlemler</h3>
                      <div className="mt-1">
                        <DropdownMenuItem 
                          className="flex items-center gap-2.5 py-3 px-3 rounded-md cursor-pointer hover:bg-muted"
                          onClick={() => handleQuickTransaction('income')}
                        >
                          <div className="h-8 w-8 flex items-center justify-center rounded-md bg-success/10">
                            <PlusIcon className="h-4 w-4 text-success" />
                          </div>
                          <div>
                            <p className="font-medium">Gelir Ekle</p>
                            <p className="text-xs text-muted-foreground">Yeni gelir işlemi oluştur</p>
                          </div>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="flex items-center gap-2.5 py-3 px-3 rounded-md cursor-pointer hover:bg-muted mt-1"
                          onClick={() => handleQuickTransaction('expense')}
                        >
                          <div className="h-8 w-8 flex items-center justify-center rounded-md bg-error/10">
                            <MinusIcon className="h-4 w-4 text-error" />
                          </div>
                          <div>
                            <p className="font-medium">Gider Ekle</p>
                            <p className="text-xs text-muted-foreground">Yeni gider işlemi oluştur</p>
                          </div>
                        </DropdownMenuItem>
                      </div>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Desktop Search & Actions */}
              <div className="hidden md:flex items-center gap-3">
                {/* Add Transaction Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost">
                      <ZapIcon className="h-4 w-4 mr-2" />
                      Hızlı İşlemler
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent 
                    align="end" 
                    className="w-[320px]"
                  >
                    <div className="p-2">
                      <h3 className="px-2 py-1.5 text-sm font-medium text-muted-foreground">Hızlı İşlem</h3>
                      <div className="mt-1">
                        <DropdownMenuItem 
                          className="flex items-center gap-2.5 py-3 px-3 rounded-md cursor-pointer hover:bg-muted"
                          onClick={() => handleQuickTransaction('income')}
                        >
                          <div className="h-8 w-8 flex items-center justify-center rounded-md bg-success/10">
                            <PlusIcon className="h-4 w-4 text-success" />
                          </div>
                          <div>
                            <p className="font-medium">Gelir Ekle</p>
                            <p className="text-xs text-muted-foreground">Yeni gelir işlemi oluştur</p>
                          </div>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="flex items-center gap-2.5 py-3 px-3 rounded-md cursor-pointer hover:bg-muted mt-1"
                          onClick={() => handleQuickTransaction('expense')}
                        >
                          <div className="h-8 w-8 flex items-center justify-center rounded-md bg-error/10">
                            <MinusIcon className="h-4 w-4 text-error" />
                          </div>
                          <div>
                            <p className="font-medium">Gider Ekle</p>
                            <p className="text-xs text-muted-foreground">Yeni gider işlemi oluştur</p>
                          </div>
                        </DropdownMenuItem>
                      </div>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Common Actions */}
              {!isSearchOpen && (
                <div className="flex items-center gap-1.5 md:gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="relative"
                      >
                        <BellIcon className="h-5 w-5" />
                        {notifications.length > 0 && (
                          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-warning rounded-full ring-2 ring-card" />
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent 
                      align="end" 
                      className="w-[320px] md:w-[380px]"
                    >
                      <div className="flex items-center justify-between px-4 py-3 border-b">
                        <div>
                          <h3 className="font-medium">Bildirimler</h3>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {notifications.length > 0 
                              ? `${notifications.length} okunmamış bildirim` 
                              : 'Bildirim bulunmuyor'
                            }
                          </p>
                        </div>
                        {notifications.length > 0 && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 px-3 text-xs hover:bg-muted shrink-0"
                            onClick={handleMarkAllAsRead}
                          >
                            Tümünü Okundu İşaretle
                          </Button>
                        )}
                      </div>
                      <div className="py-1.5 max-h-[min(70vh,480px)] overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="px-4 py-8 text-center">
                            <BellIcon className="h-12 w-12 mx-auto text-muted-foreground/20" />
                            <p className="mt-2 text-sm text-muted-foreground">
                              Şu anda okunmamış bildiriminiz bulunmuyor
                            </p>
                          </div>
                        ) : (
                          <div className="px-2">
                            {notifications.map(notification => (
                              <DropdownMenuItem 
                                key={notification.id} 
                                className="px-3 py-3 rounded-md hover:bg-muted focus:bg-muted cursor-pointer my-0.5"
                                onClick={() => handleMarkAsRead(notification.id)}
                              >
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className={cn(
                                      "w-2 h-2 rounded-full shrink-0",
                                      notification.type === 'budget_alert' && "bg-warning",
                                      notification.type === 'saving_tip' && "bg-success",
                                      notification.type === 'system' && "bg-primary"
                                    )} />
                                    <p className="text-sm font-medium line-clamp-1">{notification.title}</p>
                                  </div>
                                  <p className="text-xs text-muted-foreground line-clamp-2 pl-4">
                                    {notification.message}
                                  </p>
                                  <p className="text-[10px] text-muted-foreground/60 pl-4">
                                    {formatDistanceToNow(new Date(notification.createdAt), { 
                                      addSuffix: true,
                                      locale: tr 
                                    })}
                                  </p>
                                </div>
                              </DropdownMenuItem>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="p-2 border-t">
                        <Button 
                          variant="ghost" 
                          className="w-full justify-center text-sm h-9 hover:bg-muted"
                          onClick={() => {
                            setIsNotificationsModalOpen(true)
                            document.body.click() // Close the dropdown
                          }}
                        >
                          {notifications.length > 0 
                            ? "Tüm Bildirimleri Görüntüle"
                            : "Geçmiş Bildirimleri Görüntüle"
                          }
                        </Button>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleThemeToggle}
                  >
                    <span className="sr-only">Tema Değiştir</span>
                    <MoonIcon className="h-5 w-5 dark:hidden" />
                    <SunIcon className="h-5 w-5 hidden dark:block" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* İşlem formu */}
      <TransactionForm
        open={isTransactionFormOpen}
        onOpenChange={setIsTransactionFormOpen}
        initialData={{ type: transactionType, amount: 0 } as any}
        onSubmit={(data) => {
          dispatch(addTransaction({
            ...data,
            amount: data.type === 'expense' ? -Math.abs(data.amount) : Math.abs(data.amount)
          }))
          setIsTransactionFormOpen(false)
        }}
      />

      {/* Bildirimler modalı */}
      <NotificationsModal 
        open={isNotificationsModalOpen}
        onClose={() => setIsNotificationsModalOpen(false)}
      />
    </div>
  )
} 