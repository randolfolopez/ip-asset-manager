'use client'

import { useState, useEffect, useCallback } from 'react'
import Modal from '@/components/ui/Modal'
import { formatDate, statusBadge, daysUntil, urgencyColor, formatCurrency } from '@/lib/utils'

export default function WatchlistPage() {
  const [items, setItems] = useState<any[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [saving, setSaving] = useState(false)

  const fetchData = useCallback(async () => {
    const res = await fetch('/api/watchlist')
    const data = await res.json()
    setItems(data.items)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    const fd = new FormData(e.currentTarget)
    const body: any = {}
    fd.forEach((v, k) => { body[k] = v === '' ? null : v })

    if (editing) {
      await fetch(`/api/watchlist/${editing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    } else {
      await fetch('/api/watchlist', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    }
    setSaving(false)
    setModalOpen(false)
    fetchData()
  }

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar de watchlist?')) return
    await fetch(`/api/watchlist/${id}`, { method: 'DELETE' })
    fetchData()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Watchlist</h1>
          <p className="text-gray-400 text-sm">{items.length} dominios monitoreados</p>
        </div>
        <button onClick={() => { setEditing(null); setModalOpen(true) }} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
          + Agregar Dominio
        </button>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800 text-left">
              <th className="px-4 py-3 text-xs font-medium text-gray-400 uppercase">Dominio</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-400 uppercase">Dueño</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-400 uppercase">Registrar</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-400 uppercase">Estado</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-400 uppercase">Vencimiento</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-400 uppercase">Días</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-400 uppercase">Precio Est.</th>
              <th className="px-4 py-3 w-20"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {items.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-500">No hay dominios en watchlist</td></tr>
            ) : items.map((item) => {
              const days = daysUntil(item.expiryDate)
              const badge = statusBadge(item.status)
              return (
                <tr key={item.id} className="hover:bg-gray-800/50 cursor-pointer" onClick={() => { setEditing(item); setModalOpen(true) }}>
                  <td className="px-4 py-3 text-white text-sm font-medium">{item.domainFull}</td>
                  <td className="px-4 py-3 text-gray-400 text-sm">{item.currentOwner || '-'}</td>
                  <td className="px-4 py-3 text-gray-400 text-sm">{item.registrar || '-'}</td>
                  <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full ${badge.bg}`}>{badge.text}</span></td>
                  <td className="px-4 py-3 text-gray-400 text-sm">{formatDate(item.expiryDate)}</td>
                  <td className={`px-4 py-3 text-sm font-medium ${urgencyColor(days)}`}>{days !== null ? `${days}d` : '-'}</td>
                  <td className="px-4 py-3 text-gray-400 text-sm">{formatCurrency(item.estimatedPrice)}</td>
                  <td className="px-4 py-3">
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(item.id) }}
                      className="text-gray-600 hover:text-red-400 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? `Editar: ${editing.domainFull}` : 'Agregar a Watchlist'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div><label className="block text-xs text-gray-500 mb-1">Nombre *</label>
              <input name="name" defaultValue={editing?.name} required className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
            <div><label className="block text-xs text-gray-500 mb-1">TLD *</label>
              <input name="tld" defaultValue={editing?.tld} required placeholder=".do" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
            <div><label className="block text-xs text-gray-500 mb-1">Dominio Completo *</label>
              <input name="domainFull" defaultValue={editing?.domainFull} required className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-xs text-gray-500 mb-1">Dueño Actual</label>
              <input name="currentOwner" defaultValue={editing?.currentOwner} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
            <div><label className="block text-xs text-gray-500 mb-1">Registrar</label>
              <input name="registrar" defaultValue={editing?.registrar} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div><label className="block text-xs text-gray-500 mb-1">Fecha Vencimiento</label>
              <input name="expiryDate" type="date" defaultValue={editing?.expiryDate?.split('T')[0]} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
            <div><label className="block text-xs text-gray-500 mb-1">Precio Estimado (USD)</label>
              <input name="estimatedPrice" type="number" step="0.01" defaultValue={editing?.estimatedPrice} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
            <div><label className="block text-xs text-gray-500 mb-1">Estado</label>
              <select name="status" defaultValue={editing?.status || 'monitoring'} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="monitoring">Monitoreando</option><option value="expired">Expirado</option>
                <option value="available">Disponible</option><option value="offer_sent">Oferta Enviada</option>
                <option value="acquired">Adquirido</option><option value="discarded">Descartado</option>
              </select></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-xs text-gray-500 mb-1">Prioridad</label>
              <select name="priority" defaultValue={editing?.priority || 'medium'} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="high">Alta</option><option value="medium">Media</option><option value="low">Baja</option>
              </select></div>
            <div><label className="block text-xs text-gray-500 mb-1">Vertical</label>
              <input name="vertical" defaultValue={editing?.vertical} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
          </div>
          <div><label className="block text-xs text-gray-500 mb-1">Notas</label>
            <textarea name="notes" defaultValue={editing?.notes || ''} rows={2} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-gray-400 hover:text-white text-sm">Cancelar</button>
            <button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium">
              {saving ? 'Guardando...' : editing ? 'Guardar' : 'Agregar'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
