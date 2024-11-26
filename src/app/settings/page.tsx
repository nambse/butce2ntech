"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { updateTheme, updateNotificationSettings, updateSettings, AppSettings } from "@/store/slices/settingsSlice"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { 
  SunIcon, MoonIcon, MonitorIcon, BellIcon, 
  CalculatorIcon, TrashIcon, BellOffIcon, 
  AlertTriangleIcon, PiggyBankIcon, 
  LucideIcon,
  WalletIcon,
  FolderIcon,
  CodeIcon
} from "lucide-react"
import { clearAllNotifications } from "@/store/slices/notificationsSlice"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { ClientOnly } from "@/components/client-only"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { CategoryManagement } from "@/components/settings/category-management"
import { setTransactions } from "@/store/slices/transactionsSlice"
import { setBudgets } from "@/store/slices/budgetsSlice"
import { mockTransactions, mockBudgets } from "@/lib/mock-data"

export default function SettingsPage() {
  const dispatch = useAppDispatch()
  const settings = useAppSelector((state) => state.settings.settings)
  const notifications = useAppSelector((state) => state.notifications.items)
  const unreadCount = notifications.filter(n => !n.read).length

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    dispatch(updateTheme(newTheme))
  }

  const handleNotificationChange = (key: keyof AppSettings['notifications'], value: boolean) => {
    dispatch(updateNotificationSettings({ [key]: value }))
  }

  const handleThresholdChange = (values: number[]) => {
    if (values.length > 0) {
      dispatch(updateNotificationSettings({ budgetAlertThreshold: values[0] }))
    }
  }

  const handleDeveloperModeChange = (enabled: boolean) => {
    dispatch(updateSettings({ developer: { enabled } }))
  }

  const handleLoadMockData = () => {
    dispatch(setTransactions(mockTransactions))
    dispatch(setBudgets(mockBudgets))
  }

  const handleClearAllData = () => {
    localStorage.clear()
    window.location.reload()
  }

  return (
    <div className="space-y-6 pb-10">
      <Tabs defaultValue="categories" className="space-y-6">
        <TabsList>
          <TabsTrigger value="categories">Kategoriler</TabsTrigger>
          <TabsTrigger value="notifications">Bildirimler</TabsTrigger>
          <TabsTrigger value="theme">Tema</TabsTrigger>
          <TabsTrigger value="developer">Geliştirici</TabsTrigger>
        </TabsList>

        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderIcon className="h-5 w-5" />
                Kategori Yönetimi
              </CardTitle>
              <CardDescription>
                Gelir ve gider kategorilerinizi düzenleyin
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CategoryManagement />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BellIcon className="h-5 w-5" />
                  <CardTitle>Bildirim Ayarları</CardTitle>
                </div>
                {unreadCount > 0 && (
                  <Badge variant="secondary">
                    {unreadCount} okunmamış
                  </Badge>
                )}
              </div>
              <CardDescription>
                Bildirim tercihlerinizi ve uyarı eşiklerini ayarlayın
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4 divide-y">
                <NotificationSetting
                  icon={BellIcon}
                  title="Bildirimler"
                  description="Tüm bildirimleri aç/kapat"
                  checked={settings.notifications.enabled}
                  onCheckedChange={(checked) => handleNotificationChange('enabled', checked)}
                />

                <NotificationSetting
                  icon={WalletIcon}
                  title="Tasarruf Önerileri"
                  description="Akıllı tasarruf önerileri"
                  checked={settings.notifications.savingTips}
                  onCheckedChange={(checked) => handleNotificationChange('savingTips', checked)}
                  disabled={!settings.notifications.enabled}
                />
                
                <NotificationSetting
                  icon={AlertTriangleIcon}
                  title="Bütçe Uyarıları"
                  description="Bütçe limiti aşımı uyarıları"
                  checked={settings.notifications.budgetAlerts}
                  onCheckedChange={(checked) => handleNotificationChange('budgetAlerts', checked)}
                  disabled={!settings.notifications.enabled}
                />


                <div className="pt-4">
                  <div className="mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertTriangleIcon className="h-4 w-4" />
                        <h4 className="font-medium">Bütçe Uyarı Eşiği</h4>
                      </div>
                      <span className="text-sm font-medium text-muted-foreground">
                        %{settings.notifications.budgetAlertThreshold}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Bütçe limitinin yüzde kaçında uyarı almak istiyorsunuz?
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Slider
                      value={[settings.notifications.budgetAlertThreshold]}
                      onValueChange={handleThresholdChange}
                      min={50}
                      max={100}
                      step={1}
                      disabled={!settings.notifications.enabled || !settings.notifications.budgetAlerts}
                      showValue
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  className="justify-start"
                  onClick={() => dispatch(clearAllNotifications())}
                >
                  <BellOffIcon className="mr-2 h-4 w-4" />
                  Tüm Bildirimleri Temizle
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="theme">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MonitorIcon className="h-5 w-5" />
                Tema Ayarları
              </CardTitle>
              <CardDescription>
                Uygulama görünümünü tercihinize göre özelleştirin
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { value: 'light', icon: SunIcon, label: 'Açık' },
                  { value: 'dark', icon: MoonIcon, label: 'Koyu' },
                  { value: 'system', icon: MonitorIcon, label: 'Sistem' },
                ].map(({ value, icon: Icon, label }) => (
                  <Button
                    key={value}
                    variant={settings.theme === value ? 'default' : 'outline'}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 h-auto",
                      settings.theme === value && "border-2 border-primary"
                    )}
                    onClick={() => handleThemeChange(value as AppSettings['theme'])}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{label}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="developer">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CodeIcon className="h-5 w-5" />
                Geliştirici Araçları
              </CardTitle>
              <CardDescription>
                Geliştirici ve test araçları
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4 divide-y">
                <NotificationSetting
                  icon={CodeIcon}
                  title="Geliştirici Modu"
                  description="Geliştirici araçlarını göster/gizle"
                  checked={settings.developer?.enabled ?? false}
                  onCheckedChange={handleDeveloperModeChange}
                />

                <div className="flex flex-col gap-2 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="justify-start"
                    onClick={handleLoadMockData}
                  >
                    <FolderIcon className="mr-2 h-4 w-4" />
                    Örnek Veri Yükle
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="justify-start text-destructive hover:text-destructive"
                    onClick={handleClearAllData}
                  >
                    <TrashIcon className="mr-2 h-4 w-4" />
                    Tüm Verileri Temizle
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface NotificationSettingProps {
  icon: LucideIcon
  title: string
  description: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  disabled?: boolean
}

function NotificationSetting({
  icon: Icon,
  title,
  description,
  checked,
  onCheckedChange,
  disabled
}: NotificationSettingProps) {
  return (
    <div className="flex items-center justify-between py-4">
      <div className="flex items-start gap-3">
        <Icon className="h-5 w-5 mt-0.5" />
        <div className="space-y-0.5">
          <label className="text-sm font-medium">{title}</label>
          <p className="text-sm text-muted-foreground">
            {description}
          </p>
        </div>
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
      />
    </div>
  )
}