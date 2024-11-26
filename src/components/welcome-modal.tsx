"use client"

import {useEffect, useState} from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useAppDispatch } from "@/store/hooks"
import { setTransactions } from "@/store/slices/transactionsSlice"
import { setBudgets } from "@/store/slices/budgetsSlice"
import { mockTransactions, mockBudgets } from "@/lib/mock-data"

export function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(false)
  const dispatch = useAppDispatch()

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem("hasSeenWelcome")
    if (!hasSeenWelcome) {
      setIsOpen(true)
      localStorage.setItem("hasSeenWelcome", "true")
    }
  }, [])

  const handleLoadMockData = () => {
    dispatch(setTransactions(mockTransactions))
    dispatch(setBudgets(mockBudgets))
    setIsOpen(false)
  }

  return (
    <Dialog 
      open={isOpen} 
      onClose={() => setIsOpen(false)}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bütçe Takip'e Hoş Geldiniz! 👋</DialogTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Bütçe Takip ile gelir ve giderlerinizi kolayca takip edebilir, 
            bütçe hedefleri belirleyebilir ve finansal durumunuzu analiz edebilirsiniz.
          </p>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <p className="text-sm text-muted-foreground">
            Başlamak için hemen yeni bir işlem ekleyebilir veya örnek verilerle 
            uygulamayı keşfedebilirsiniz.
          </p>
          <p className="text-sm text-muted-foreground">
            Örnek veriler, uygulamanın tüm özelliklerini test etmenize olanak sağlar.
          </p>
          <p className="text-sm text-muted-foreground">
            Dilediğiniz zaman ayarlar -&gt; geliştirici sekmesinden örnek verileri yükleyebilir veya tüm verileri silebilirsiniz.
          </p>
        </div>
        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Boş Başla
          </Button>
          <Button onClick={handleLoadMockData}>
            Örnek Verilerle Başla
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
