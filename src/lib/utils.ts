import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function daysUntil(date: Date | null | undefined): number | null {
  if (!date) return null
  const now = new Date()
  const diff = new Date(date).getTime() - now.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('es-DO', { year: 'numeric', month: 'short', day: 'numeric' })
}

export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return '-'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}

export function urgencyColor(days: number | null): string {
  if (days === null) return 'text-gray-400'
  if (days < 0) return 'text-red-500 font-bold'
  if (days < 30) return 'text-red-500'
  if (days < 90) return 'text-yellow-500'
  return 'text-green-500'
}

export function statusBadge(status: string): { bg: string; text: string } {
  const map: Record<string, { bg: string; text: string }> = {
    active: { bg: 'bg-green-100 text-green-800', text: 'Activo' },
    parked: { bg: 'bg-yellow-100 text-yellow-800', text: 'Parked' },
    redirect: { bg: 'bg-blue-100 text-blue-800', text: 'Redirect' },
    pointer: { bg: 'bg-purple-100 text-purple-800', text: 'Pointer' },
    registered: { bg: 'bg-green-100 text-green-800', text: 'Registrado' },
    pending: { bg: 'bg-yellow-100 text-yellow-800', text: 'Pendiente' },
    expired: { bg: 'bg-red-100 text-red-800', text: 'Vencido' },
    monitoring: { bg: 'bg-blue-100 text-blue-800', text: 'Monitoreando' },
    available: { bg: 'bg-green-100 text-green-800', text: 'Disponible' },
    offer_sent: { bg: 'bg-purple-100 text-purple-800', text: 'Oferta Enviada' },
    acquired: { bg: 'bg-green-100 text-green-800', text: 'Adquirido' },
    discarded: { bg: 'bg-gray-100 text-gray-800', text: 'Descartado' },
  }
  return map[status] || { bg: 'bg-gray-100 text-gray-800', text: status }
}
