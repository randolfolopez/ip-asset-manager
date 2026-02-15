'use client'

import { useState, useEffect, useCallback } from 'react'
import Modal from '@/components/ui/Modal'
import { formatDate, statusBadge, daysUntil, urgencyColor, formatCurrency } from '@/lib/utils'

export default function OnapiPage() {
  const [trademarks, setTrademarks] = useState<any[]>([])
  const [tradeNames, setTradeNames] = useState<any[]>([])
  const [entities, setEntities] = useState<any[]>([])
  const [verticals, setVerticals] = useState<any[]>([])
  const [tab, setTab] = useState<'trademarks' | 'tradenames'>('trademarks')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [saving, setSaving] = useState(false)

  const fetchData = useCallback(async () => {
    const [onapiRes, refRes] = await Promise.all([
      fetch('/api/onapi').then(r => r.json()),
      fetch('/api/refdata').then(r => r.json()),
    ])
    setTrademarks(onapiRes.trademarks)
    setTradeNames(onapiRes.tradeNames)
    setEntities(refRes.entities)
    setVerticals(refRes.verticals)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const openNew = () => { setEditing(null); setModalOpen(true) }
  const openEdit = (item: any) => { setEditing(item); setModalOpen(true) }

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    const fd = new FormData(e.currentTarget)
    const body: any = { _type: tab === 'tradenames' ? 'tradename' : 'trademark' }
    fd.forEach((v, k) => { if (k !== 'file') body[k] = v === '' ? null : v })

    let savedItem: any
    if (editing) {
      const res = await fetch(`/api/onapi/${editing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      savedItem = await res.json()
    } else {
      const res = await fetch('/api/onapi', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      savedItem = await res.json()
    }

    // Upload file if selected
    const file = fd.get('file') as File
    if (file && file.size > 0) {
      const uploadData = new FormData()
      uploadData.append('file', file)
      uploadData.append('assetType', tab === 'tradenames' ? 'tradename' : 'trademark')
      uploadData.append('assetId', savedItem.id.toString())
      await fetch('/api/upload', { method: 'POST', body: uploadData })
    }

    setSaving(false)
    setModalOpen(false)
    fetchData()
  }

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar este registro?')) return
    const type = tab === 'tradenames' ? 'tradename' : 'trademark'
    await fetch(`/api/onapi/${id}?type=${type}`, { method: 'DELETE' })
    fetchData()
  }

  const items = tab === 'trademarks' ? trademarks : tradeNames

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">ONAPI</h1>
          <p className="text-gray-400 text-sm">Marcas y Nombres Comerciales</p>
        </div>
        <button onClick={openNew} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          + Nuevo Registro
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-900 p-1 rounded-lg w-fit">
        <button onClick={() => setTab('trademarks')}
          className={`px-4 py-2 rounded-md text-sm transition-colors ${tab === 'trademarks' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white'}`}>
          Marcas ({trademarks.length})
        </button>
        <button onClick={() => setTab('tradenames')}
          className={`px-4 py-2 rounded-md text-sm transition-colors ${tab === 'tradenames' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white'}`}>
          Nombres Comerciales ({tradeNames.length})
        </button>
      </div>

      {/* Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800 text-left">
              <th className="px-4 py-3 text-xs font-medium text-gray-400 uppercase">Nombre</th>
              {tab === 'trademarks' && <th className="px-4 py-3 text-xs font-medium text-gray-400 uppercase">Clase Niza</th>}
              <th className="px-4 py-3 text-xs font-medium text-gray-400 uppercase">Expediente</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-400 uppercase">Titular</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-400 uppercase">Estado</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-400 uppercase">Vencimiento</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-400 uppercase">Días</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-400 uppercase">Archivos</th>
              <th className="px-4 py-3 w-20"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {items.length === 0 ? (
              <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-500">No hay registros</td></tr>
            ) : items.map((item) => {
              const days = daysUntil(item.expiryDate)
              const badge = statusBadge(item.status)
              return (
                <tr key={item.id} className="hover:bg-gray-800/50 cursor-pointer" onClick={() => openEdit(item)}>
                  <td className="px-4 py-3 text-white text-sm font-medium">{item.name}</td>
                  {tab === 'trademarks' && <td className="px-4 py-3 text-gray-400 text-sm">{item.niceClass || '-'}</td>}
                  <td className="px-4 py-3 text-gray-400 text-sm">{item.expediente || '-'}</td>
                  <td className="px-4 py-3 text-gray-400 text-sm">{item.entity?.name || '-'}</td>
                  <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full ${badge.bg}`}>{badge.text}</span></td>
                  <td className="px-4 py-3 text-gray-400 text-sm">{formatDate(item.expiryDate)}</td>
                  <td className={`px-4 py-3 text-sm font-medium ${urgencyColor(days)}`}>{days !== null ? `${days}d` : '-'}</td>
                  <td className="px-4 py-3 text-gray-400 text-sm">{item.attachments?.length || 0}</td>
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

      {/* Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? `Editar: ${editing.name}` : `Nuevo ${tab === 'trademarks' ? 'Marca' : 'Nombre Comercial'}`} wide>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Nombre *</label>
              <input name="name" defaultValue={editing?.name} required
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            {tab === 'trademarks' && (
              <div>
                <label className="block text-xs text-gray-500 mb-1">Clase Niza</label>
                <input name="niceClass" defaultValue={editing?.niceClass}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            )}
            <div>
              <label className="block text-xs text-gray-500 mb-1">No. Expediente</label>
              <input name="expediente" defaultValue={editing?.expediente}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">No. Certificado</label>
              <input name="certificate" defaultValue={editing?.certificate}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Titular</label>
              <select name="entityId" defaultValue={editing?.entityId || ''}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">-</option>
                {entities.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Estado</label>
              <select name="status" defaultValue={editing?.status || 'registered'}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="pending">Pendiente</option>
                <option value="published">Publicado</option>
                <option value="registered">Registrado</option>
                <option value="renewed">Renovado</option>
                <option value="expired">Vencido</option>
                <option value="opposed">Oposición</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Costo Renovación (USD)</label>
              <input name="renewalCost" type="number" step="0.01" defaultValue={editing?.renewalCost}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Fecha Registro</label>
              <input name="registeredAt" type="date" defaultValue={editing?.registeredAt?.split('T')[0]}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Fecha Vencimiento</label>
              <input name="expiryDate" type="date" defaultValue={editing?.expiryDate?.split('T')[0]}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          {/* File Upload */}
          <div className="border-t border-gray-800 pt-4">
            <label className="block text-xs text-gray-500 mb-1">Adjuntar Certificado (PDF, imagen)</label>
            <input name="file" type="file" accept=".pdf,.jpg,.jpeg,.png,.webp"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:bg-blue-600 file:text-white hover:file:bg-blue-700" />
            {editing?.attachments?.length > 0 && (
              <div className="mt-2 space-y-1">
                {editing.attachments.map((att: any) => (
                  <div key={att.id} className="flex items-center gap-2 text-sm">
                    <span className="text-gray-400">📎 {att.originalName}</span>
                    <a href={att.path} target="_blank" className="text-blue-400 hover:text-blue-300">Ver</a>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Notas</label>
            <textarea name="notes" defaultValue={editing?.notes || ''} rows={2}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-gray-400 hover:text-white text-sm">Cancelar</button>
            <button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium">
              {saving ? 'Guardando...' : editing ? 'Guardar Cambios' : 'Crear'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
