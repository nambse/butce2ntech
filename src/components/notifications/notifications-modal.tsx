"use client"

import { Modal, ModalHeader, ModalTitle, ModalContent } from "@/components/ui/modal"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { markAsRead, deleteNotification } from "@/store/slices/notificationsSlice"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { BellIcon, TrashIcon } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { tr } from "date-fns/locale"
import { Badge } from "../ui/badge"
import { formatCurrency } from "@/lib/format"

// Bildirim modalı için prop tipleri
interface NotificationsModalProps {
  open: boolean           // Modalın açık/kapalı durumu
  onClose: () => void    // Modal kapatma işlevi
}

export function NotificationsModal({ open, onClose }: NotificationsModalProps) {
  const dispatch = useAppDispatch()
  const notifications = useAppSelector((state) => state.notifications.items)

  // Bildirim türüne göre renk sınıfı belirleme
  const getNotificationColorClass = (type: string) => {
    switch (type) {
      case 'budget_alert': return "bg-warning"     // Bütçe uyarısı
      case 'saving_tip': return "bg-success"       // Tasarruf önerisi
      case 'system': return "bg-primary"           // Sistem bildirimi
      default: return "bg-primary"
    }
  }

  return (
    <Modal open={open} onClose={onClose}>
      <ModalHeader>
        <ModalTitle>Tüm Bildirimler</ModalTitle>
      </ModalHeader>
      <ModalContent>
        {/* Kaydırılabilir bildirim listesi */}
        <div className="max-h-[60vh] overflow-y-auto -mx-6 px-6">
          {notifications.length === 0 ? (
            // Bildirim yoksa gösterilecek boş durum
            <div className="py-8 text-center">
              <BellIcon className="h-12 w-12 mx-auto text-muted-foreground/20" />
              <p className="mt-2 text-sm text-muted-foreground">
                Henüz bildiriminiz bulunmuyor
              </p>
            </div>
          ) : (
            // Bildirim listesi
            <div className="space-y-1 py-2">
              {notifications.map(notification => (
                <div
                  key={notification.id}
                  className={cn(
                    "group relative flex flex-col gap-1 rounded-lg border p-4 text-sm",
                    !notification.read && "bg-muted/50" // Okunmamış bildirimleri vurgula
                  )}
                >
                  {/* Silme butonu */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-2 h-8 w-8 opacity-0 group-hover:opacity-100"
                    onClick={() => dispatch(deleteNotification(notification.id))}
                    aria-label="Bildirimi Sil"
                  >
                    <TrashIcon className="h-4 w-4 text-muted-foreground" />
                  </Button>

                  {/* Bildirim içeriği */}
                  <div 
                    className="cursor-pointer"
                    onClick={() => !notification.read && dispatch(markAsRead(notification.id))}
                  >
                    {/* Bildirim başlığı ve türü */}
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "w-2 h-2 rounded-full shrink-0",
                        getNotificationColorClass(notification.type)
                      )} />
                      <p className="font-medium pr-8">{notification.title}</p>
                    </div>

                    {/* Bildirim mesajı */}
                    <p className="text-muted-foreground mt-1 pl-4">
                      {notification.message}
                    </p>

                    {/* Bildirim detayları (varsa) */}
                    {notification.data && (
                      <div className="mt-2 pl-4 flex flex-wrap gap-2">
                        {notification.data.spent && (
                          <Badge variant="outline">
                            Harcama: {formatCurrency(notification.data.spent)}
                          </Badge>
                        )}
                        {notification.data.limit && (
                          <Badge variant="outline">
                            Limit: {formatCurrency(notification.data.limit)}
                          </Badge>
                        )}
                        {notification.data.percentage && (
                          <Badge variant="outline">
                            {notification.data.percentage.toFixed(0)}%
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Bildirim tarihi */}
                    <p className="text-[11px] text-muted-foreground/60 mt-2 pl-4">
                      {formatDistanceToNow(new Date(notification.createdAt), { 
                        addSuffix: true,
                        locale: tr 
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </ModalContent>
    </Modal>
  )
} 