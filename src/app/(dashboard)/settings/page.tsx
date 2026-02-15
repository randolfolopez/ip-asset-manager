export const dynamic = "force-dynamic";
'use client'

import { useState, useEffect } from 'react'
import Modal from '@/components/ui/Modal'

export default function SettingsPage() {
  const [entities, setEntities] = useState<any[]>([])
  const [entityModal, setEntityModal] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/entities').then(r => r.json()).then(d => setEntities(d.entities))
  }, [])

  const addEntity = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    const fd = new FormData(e.currentTarget)
    const body = { name: fd.get('name'), rnc: fd.get('rnc'), type: fd.get('type') }
    await fetch('/api/entities', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    const res = await fetch('/api/entities').then(r => r.json())
    setEntities(res.entities)
    setSaving(false)
    setEntityModal(false)
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-gray-400 text-sm">Configuración del sistema</p>
      </div>

      {/* Entities */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
          <div>
            <h3 className="text-white font-semibold">Entidades / Titulares</h3>
            <p className="text-gray-500 text-xs mt-0.5">Empresas y personas que poseen activos</p>
          </div>
          <button onClick={() => setEntityModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm">
            + Nueva
          </button>
        </div>
        <div className="divide-y divide-gray-800">
          {entities.length === 0 ? (
            <div className="px-5 py-6 text-center text-gray-500 text-sm">No hay entidades. Ejecuta /api/seed primero.</div>
          ) : entities.map(e => (
            <div key={e.id} className="flex items-center justify-between px-5 py-3">
              <div>
                <span className="text-white text-sm">{e.name}</span>
                {e.rnc && <span className="text-gray-500 text-xs ml-2">RNC: {e.rnc}</span>}
              </div>
              <span className="text-gray-600 text-xs">{e.type || '-'}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Telegram Config */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h3 className="text-white font-semibold mb-3">Alertas por Telegram</h3>
        <p className="text-gray-500 text-sm mb-4">Configura un bot de Telegram para recibir alertas de renovación.</p>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Bot Token</label>
            <input type="text" placeholder="123456:ABC-DEF..."
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Chat ID</label>
            <input type="text" placeholder="-100123456789"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <p className="text-gray-600 text-xs">El bot de Telegram se configurará vía n8n después del deploy.</p>
        </div>
      </div>

      {/* API Keys */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h3 className="text-white font-semibold mb-3">API Keys</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Cloudflare API Token</label>
            <input type="password" placeholder="••••••••"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
        <p className="text-gray-600 text-xs mt-3">Se almacenarán como variables de entorno en el servidor.</p>
      </div>

      {/* Quick Actions */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h3 className="text-white font-semibold mb-3">Acciones Rápidas</h3>
        <div className="flex gap-3">
          <button onClick={async () => {
            const res = await fetch('/api/seed', { method: 'POST' })
            const data = await res.json()
            alert(JSON.stringify(data, null, 2))
            const ref = await fetch('/api/entities').then(r => r.json())
            setEntities(ref.entities)
          }} className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
            🌱 Seed Data
          </button>
        </div>
      </div>

      <Modal open={entityModal} onClose={() => setEntityModal(false)} title="Nueva Entidad">
        <form onSubmit={addEntity} className="space-y-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Nombre *</label>
            <input name="name" required className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">RNC</label>
              <input name="rnc" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Tipo</label>
              <select name="type" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">-</option>
                <option value="SRL">SRL</option>
                <option value="SA">SA</option>
                <option value="EIRL">EIRL</option>
                <option value="Persona Física">Persona Física</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setEntityModal(false)} className="px-4 py-2 text-gray-400 hover:text-white text-sm">Cancelar</button>
            <button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium">
              {saving ? 'Guardando...' : 'Crear'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
