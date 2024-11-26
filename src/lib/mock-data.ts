import { Transaction } from "@/types/transaction"
import { Budget } from "@/types/budget"
import { Notification } from "@/types/notification"

const now = new Date()
const currentMonth = now.getMonth()
const currentYear = now.getFullYear()

export const mockTransactions: Transaction[] = [
  // Gelirler
  {
    id: "transaction-mock-1",
    type: "income",
    amount: 25000,
    category: "maas",
    description: "Aralık Maaşı - Teknoloji A.Ş.",
    date: new Date(currentYear, currentMonth, 15).toISOString(),
    createdAt: new Date(currentYear, currentMonth, 15).toISOString(),
    updatedAt: new Date(currentYear, currentMonth, 15).toISOString()
  },
  {
    id: "transaction-mock-2",
    type: "income",
    amount: 3500,
    category: "ek-gelir",
    description: "Freelance Proje Ödemesi - XYZ Yazılım",
    date: new Date(currentYear, currentMonth, 20).toISOString(),
    createdAt: new Date(currentYear, currentMonth, 20).toISOString(),
    updatedAt: new Date(currentYear, currentMonth, 20).toISOString()
  },
  {
    id: "transaction-mock-3",
    type: "income",
    amount: 2000,
    category: "yatirim",
    description: "Hisse Senedi Kar Payı - Borsa İstanbul",
    date: new Date(currentYear, currentMonth, 5).toISOString(),
    createdAt: new Date(currentYear, currentMonth, 5).toISOString(),
    updatedAt: new Date(currentYear, currentMonth, 5).toISOString()
  },

  // Giderler
  {
    id: "transaction-mock-4",
    type: "expense",
    amount: -4500,
    category: "market",
    description: "Aylık Market Alışverişi - Migros",
    date: new Date(currentYear, currentMonth, 3).toISOString(),
    createdAt: new Date(currentYear, currentMonth, 3).toISOString(),
    updatedAt: new Date(currentYear, currentMonth, 3).toISOString()
  },
  {
    id: "transaction-mock-5",
    type: "expense",
    amount: -2800,
    category: "market",
    description: "Haftalık Market - A101",
    date: new Date(currentYear, currentMonth, 10).toISOString(),
    createdAt: new Date(currentYear, currentMonth, 10).toISOString(),
    updatedAt: new Date(currentYear, currentMonth, 10).toISOString()
  },
  {
    id: "transaction-mock-6",
    type: "expense",
    amount: -850,
    category: "faturalar",
    description: "Elektrik Faturası - CK Enerji",
    date: new Date(currentYear, currentMonth, 12).toISOString(),
    createdAt: new Date(currentYear, currentMonth, 12).toISOString(),
    updatedAt: new Date(currentYear, currentMonth, 12).toISOString()
  },
  {
    id: "transaction-mock-7",
    type: "expense",
    amount: -450,
    category: "faturalar",
    description: "Su Faturası - İSKİ",
    date: new Date(currentYear, currentMonth, 12).toISOString(),
    createdAt: new Date(currentYear, currentMonth, 12).toISOString(),
    updatedAt: new Date(currentYear, currentMonth, 12).toISOString()
  },
  {
    id: "transaction-mock-8",
    type: "expense",
    amount: -250,
    category: "ulasim",
    description: "Akbil Yükleme - İBB",
    date: new Date(currentYear, currentMonth, 8).toISOString(),
    createdAt: new Date(currentYear, currentMonth, 8).toISOString(),
    updatedAt: new Date(currentYear, currentMonth, 8).toISOString()
  },
  {
    id: "transaction-mock-9",
    type: "expense",
    amount: -1200,
    category: "saglik",
    description: "Özel Muayene - Özel Hastane",
    date: new Date(currentYear, currentMonth, 18).toISOString(),
    createdAt: new Date(currentYear, currentMonth, 18).toISOString(),
    updatedAt: new Date(currentYear, currentMonth, 18).toISOString()
  },
  {
    id: "transaction-mock-10",
    type: "expense",
    amount: -3500,
    category: "egitim",
    description: "Online Kurs Üyeliği - Udemy",
    date: new Date(currentYear, currentMonth, 1).toISOString(),
    createdAt: new Date(currentYear, currentMonth, 1).toISOString(),
    updatedAt: new Date(currentYear, currentMonth, 1).toISOString()
  },
  {
    id: "transaction-mock-11",
    type: "expense",
    amount: -750,
    category: "eglence",
    description: "Sinema + Yemek - Cinemaximum",
    date: new Date(currentYear, currentMonth, 22).toISOString(),
    createdAt: new Date(currentYear, currentMonth, 22).toISOString(),
    updatedAt: new Date(currentYear, currentMonth, 22).toISOString()
  },
  {
    id: "transaction-mock-12",
    type: "expense",
    amount: -2500,
    category: "giyim",
    description: "Kışlık Kıyafetler - LC Waikiki",
    date: new Date(currentYear, currentMonth, 25).toISOString(),
    createdAt: new Date(currentYear, currentMonth, 25).toISOString(),
    updatedAt: new Date(currentYear, currentMonth, 25).toISOString()
  }
]

export const mockBudgets: Budget[] = [
  {
    id: "budget-mock-1",
    categoryId: "market",
    category: "Market",
    limit: 8000,
    period: "monthly",
    startDate: new Date(currentYear, currentMonth, 1).toISOString(),
    endDate: new Date(currentYear, currentMonth + 1, 0).toISOString(),
    createdAt: new Date(currentYear, currentMonth, 1).toISOString(),
    updatedAt: new Date(currentYear, currentMonth, 1).toISOString()
  },
  {
    id: "budget-mock-2",
    categoryId: "faturalar",
    category: "Faturalar",
    limit: 2000,
    period: "monthly",
    startDate: new Date(currentYear, currentMonth, 1).toISOString(),
    endDate: new Date(currentYear, currentMonth + 1, 0).toISOString(),
    createdAt: new Date(currentYear, currentMonth, 1).toISOString(),
    updatedAt: new Date(currentYear, currentMonth, 1).toISOString()
  },
  {
    id: "budget-mock-3",
    categoryId: "ulasim",
    category: "Ulaşım",
    limit: 1000,
    period: "monthly",
    startDate: new Date(currentYear, currentMonth, 1).toISOString(),
    endDate: new Date(currentYear, currentMonth + 1, 0).toISOString(),
    createdAt: new Date(currentYear, currentMonth, 1).toISOString(),
    updatedAt: new Date(currentYear, currentMonth, 1).toISOString()
  },
  {
    id: "budget-mock-4",
    categoryId: "saglik",
    category: "Sağlık",
    limit: 2000,
    period: "monthly",
    startDate: new Date(currentYear, currentMonth, 1).toISOString(),
    endDate: new Date(currentYear, currentMonth + 1, 0).toISOString(),
    createdAt: new Date(currentYear, currentMonth, 1).toISOString(),
    updatedAt: new Date(currentYear, currentMonth, 1).toISOString()
  },
  {
    id: "budget-mock-5",
    categoryId: "egitim",
    category: "Eğitim",
    limit: 5000,
    period: "monthly",
    startDate: new Date(currentYear, currentMonth, 1).toISOString(),
    endDate: new Date(currentYear, currentMonth + 1, 0).toISOString(),
    createdAt: new Date(currentYear, currentMonth, 1).toISOString(),
    updatedAt: new Date(currentYear, currentMonth, 1).toISOString()
  },
  {
    id: "budget-mock-6",
    categoryId: "eglence",
    category: "Eğlence",
    limit: 1500,
    period: "monthly",
    startDate: new Date(currentYear, currentMonth, 1).toISOString(),
    endDate: new Date(currentYear, currentMonth + 1, 0).toISOString(),
    createdAt: new Date(currentYear, currentMonth, 1).toISOString(),
    updatedAt: new Date(currentYear, currentMonth, 1).toISOString()
  },
  {
    id: "budget-mock-7",
    categoryId: "giyim",
    category: "Giyim",
    limit: 3000,
    period: "monthly",
    startDate: new Date(currentYear, currentMonth, 1).toISOString(),
    endDate: new Date(currentYear, currentMonth + 1, 0).toISOString(),
    createdAt: new Date(currentYear, currentMonth, 1).toISOString(),
    updatedAt: new Date(currentYear, currentMonth, 1).toISOString()
  }
]

export const mockNotifications: Notification[] = [
  {
    id: "notification-mock-1",
    type: "budget_alert",
    title: "Bütçe Uyarısı: Market",
    message: "Market kategorisinde bütçe limitinin %90'ına ulaştınız.",
    categoryId: "market",
    data: {
      spent: 7200,
      limit: 8000,
      percentage: 90,
      categoryName: "Market"
    },
    read: false,
    createdAt: new Date(currentYear, currentMonth, 15).toISOString()
  },
  {
    id: "notification-mock-2",
    type: "budget_alert",
    title: "Bütçe Uyarısı: Faturalar",
    message: "Faturalar kategorisinde bütçe limitini %15 oranında aştınız!",
    categoryId: "faturalar",
    data: {
      spent: 2300,
      limit: 2000,
      percentage: 115,
      categoryName: "Faturalar"
    },
    read: false,
    createdAt: new Date(currentYear, currentMonth, 12).toISOString()
  }
]
