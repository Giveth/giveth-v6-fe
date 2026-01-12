import type { ProjectCartItem } from '@/context/CartContext'
import type { RoundCheckoutStatus } from '@/hooks/useMultiRoundCheckout'
import type { GroupedProjects } from '@/lib/types/cart'

const STORAGE_KEY = 'giveth_checkout_receipt_v1'

export type CheckoutReceipt = {
  createdAt: number
  qfRoundGroups: GroupedProjects[]
  nonQfProjects: ProjectCartItem[]
  roundStatuses: Array<[number, RoundCheckoutStatus]>
  overallStatus: 'idle' | 'preparing' | 'in_progress' | 'completed' | 'failed'
  overallError?: string
}

export function saveCheckoutReceipt(receipt: CheckoutReceipt) {
  if (typeof window === 'undefined') return
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(receipt))
  } catch {
    // ignore
  }
}

export function loadCheckoutReceipt(): CheckoutReceipt | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as CheckoutReceipt
  } catch {
    return null
  }
}

export function clearCheckoutReceipt() {
  if (typeof window === 'undefined') return
  try {
    window.sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}
