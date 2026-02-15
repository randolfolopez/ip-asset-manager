export const dynamic = "force-dynamic";
'use client'

import { useState, useEffect, useCallback } from 'react'
import Modal from '@/components/ui/Modal'
import { formatDate, formatCurrency, statusBadge, daysUntil, urgencyColor } from '@/lib/utils'

type Domain = any
type RefData = { verticals: any[]; countries: any[]; entities: any[] }

export default function DomainsPage() {
  const [domains, setDomains] = useState<Domain[]>([])
  const [refData, setRefData] = useState<RefData>({ verticals: [], countries: [], entities: [] })
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterVertical, setFilterVertical] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Domain | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const fetchDomains = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ page: page.toString(), limit: '50' })
    if (search) params.set('search', search)
    if (filterStatus) params.set('status', filterStatus)
    if (filterVertical) params.set('vertical', filterVertical)
    const res = await fetch(`/api/domains?${params}`)
    const data = await res.json()
    setDomains(data.domains)
    setTotal(data.total)
    setLoading(false)
  }, [page, search, filterStatus, filterVertical])

  useEffect(() => { fetchDomains() }, [fetchDomains])
  useEffect(() => {
    fetch('/api/refdata').then(r => r.json()).then(setRefData)
  }, [])

  const openNew = () => { setEditing(null); setModalOpen(true) }
  const openEdit = (d: Domain) => { setEditing(d); setModalOpen(true) }

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    const fd = new FormData(e.currentTarget)
    const body: any = {}
    fd.forEach((v, k) => { body[k] = v === '' ? null : v })
    // Parse booleans
    body.cfEmailRouting = fd.get('cfEmailRouting') === 'on'
    body.hasLanding = fd.get('hasLanding') === 'on'
    body.hasLeadCapture = fd.get('hasLeadCapture') === 'on'

    if (editing) {
      await fetch(`/api/domains/${editing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    } else {
      await fetch('/api/domains', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    }
    setSaving(false)
    setModalOpen(false)
    fetchDomains()
  }

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar este dominio?')) return
    await fetch(`/api/domains/${id}`, { method: 'DELETE' })
    fetchDomains()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dominios</h1>
          <p className="text-gray-400 text-sm">{total} dominios registrados</p>
        </div>
        <button onClick={openNew} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          + Nuevo Dominio
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <input
          type="text"
          placeholder="Buscar dominio..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-white text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1) }}
          className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">Todos los estados</option>
          <option value="active">Activo</option>
          <option value="parked">Parked</option>
          <option value="redirect">Redirect</option>
          <option value="pointer">Pointer</option>
        </select>
        <select value={filterVertical} onChange={(e) => { setFilterVertical(e.target.value); setPage(1) }}
          className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">Todas las verticales</option>
          {refData.verticals.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800 text-left">
                <th className="px-4 py-3 text-xs font-medium text-gray-400 uppercase">Dominio</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-400 uppercase">Vertical</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-400 uppercase">País</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-400 uppercase">Estado</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-400 uppercase">Renovación</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-400 uppercase">Días</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-400 uppercase">Costo</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-400 uppercase w-20"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {loading ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-500">Cargando...</td></tr>
              ) : domains.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-500">No hay dominios</td></tr>
              ) : domains.map((d) => {
                const days = daysUntil(d.renewalDate)
                const badge = statusBadge(d.status)
                return (
                  <tr key={d.id} className="hover:bg-gray-800/50 cursor-pointer" onClick={() => openEdit(d)}>
                    <td className="px-4 py-3 text-white text-sm font-medium">{d.domainFull}</td>
                    <td className="px-4 py-3 text-gray-400 text-sm">{d.vertical?.name || '-'}</td>
                    <td className="px-4 py-3 text-gray-400 text-sm">{d.country?.code || '-'}</td>
                    <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full ${badge.bg}`}>{badge.text}</span></td>
                    <td className="px-4 py-3 text-gray-400 text-sm">{formatDate(d.renewalDate)}</td>
                    <td className={`px-4 py-3 text-sm font-medium ${urgencyColor(days)}`}>{days !== null ? (days < 0 ? `${days}d` : `${days}d`) : '-'}</td>
                    <td className="px-4 py-3 text-gray-400 text-sm">{formatCurrency(d.annualCostUsd)}</td>
                    <td className="px-4 py-3">
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(d.id) }}
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
        {total > 50 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-800">
            <span className="text-gray-500 text-sm">Página {page} de {Math.ceil(total / 50)}</span>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                className="px-3 py-1 bg-gray-800 text-white text-sm rounded disabled:opacity-30">← Anterior</button>
              <button disabled={page >= Math.ceil(total / 50)} onClick={() => setPage(p => p + 1)}
                className="px-3 py-1 bg-gray-800 text-white text-sm rounded disabled:opacity-30">Siguiente →</button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? `Editar: ${editing.domainFull}` : 'Nuevo Dominio'} wide>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <Field label="Nombre" name="name" defaultValue={editing?.name} placeholder="farmacia" required />
            <Field label="TLD" name="tld" defaultValue={editing?.tld} placeholder=".do" required />
            <Field label="Dominio Completo" name="domainFull" defaultValue={editing?.domainFull} placeholder="farmacia.do" required />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <SelectField label="Vertical" name="verticalId" defaultValue={editing?.verticalId}
              options={refData.verticals.map(v => ({ value: v.id, label: v.name }))} />
            <SelectField label="País" name="countryId" defaultValue={editing?.countryId}
              options={refData.countries.map(c => ({ value: c.id, label: `${c.code} - ${c.name}` }))} />
            <SelectField label="Titular" name="entityId" defaultValue={editing?.entityId}
              options={refData.entities.map(e => ({ value: e.id, label: e.name }))} />
          </div>
          <div className="grid grid-cols-4 gap-4">
            <SelectField label="Estado" name="status" defaultValue={editing?.status || 'parked'}
              options={[{ value: 'active', label: 'Activo' }, { value: 'parked', label: 'Parked' }, { value: 'redirect', label: 'Redirect' }, { value: 'pointer', label: 'Pointer' }]} />
            <SelectField label="Prioridad" name="priority" defaultValue={editing?.priority || 'low'}
              options={[{ value: 'high', label: 'Alta' }, { value: 'medium', label: 'Media' }, { value: 'low', label: 'Baja' }]} />
            <Field label="Registrar" name="registrar" defaultValue={editing?.registrar} placeholder="NIC.do" />
            <Field label="Costo Anual (USD)" name="annualCostUsd" defaultValue={editing?.annualCostUsd} type="number" step="0.01" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Field label="Fecha Registro" name="registeredAt" defaultValue={editing?.registeredAt?.split('T')[0]} type="date" />
            <Field label="Fecha Renovación" name="renewalDate" defaultValue={editing?.renewalDate?.split('T')[0]} type="date" />
            <Field label="Subtipo" name="subtype" defaultValue={editing?.subtype} />
          </div>

          <div className="border-t border-gray-800 pt-4 mt-4">
            <h4 className="text-gray-400 text-sm font-medium mb-3">Cloudflare</h4>
            <div className="grid grid-cols-3 gap-4">
              <Field label="Zone ID" name="cfZoneId" defaultValue={editing?.cfZoneId} />
              <Field label="SSL Mode" name="cfSslMode" defaultValue={editing?.cfSslMode} placeholder="full" />
              <Field label="Email Destino" name="cfEmailDest" defaultValue={editing?.cfEmailDest} />
            </div>
            <div className="mt-3">
              <label className="flex items-center gap-2 text-sm text-gray-400">
                <input type="checkbox" name="cfEmailRouting" defaultChecked={editing?.cfEmailRouting} className="rounded bg-gray-800 border-gray-700" />
                Email Routing activo
              </label>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-4 mt-4">
            <h4 className="text-gray-400 text-sm font-medium mb-3">Hosting</h4>
            <div className="grid grid-cols-3 gap-4">
              <Field label="Provider" name="hostingProvider" defaultValue={editing?.hostingProvider} />
              <Field label="Server IP" name="serverIp" defaultValue={editing?.serverIp} />
              <Field label="Framework" name="framework" defaultValue={editing?.framework} />
            </div>
            <div className="flex gap-4 mt-3">
              <label className="flex items-center gap-2 text-sm text-gray-400">
                <input type="checkbox" name="hasLanding" defaultChecked={editing?.hasLanding} className="rounded bg-gray-800 border-gray-700" />
                Landing page
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-400">
                <input type="checkbox" name="hasLeadCapture" defaultChecked={editing?.hasLeadCapture} className="rounded bg-gray-800 border-gray-700" />
                Lead capture
              </label>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-4 mt-4">
            <h4 className="text-gray-400 text-sm font-medium mb-3">Redirect</h4>
            <div className="grid grid-cols-3 gap-4">
              <Field label="Redirect To" name="redirectTo" defaultValue={editing?.redirectTo} />
              <Field label="Tipo" name="redirectType" defaultValue={editing?.redirectType} placeholder="301" />
              <Field label="Worker/Rule" name="workerRule" defaultValue={editing?.workerRule} />
            </div>
          </div>

          <div className="border-t border-gray-800 pt-4 mt-4">
            <label className="block text-sm text-gray-400 mb-1">Notas</label>
            <textarea name="notes" defaultValue={editing?.notes || ''} rows={3}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-gray-400 hover:text-white text-sm transition-colors">Cancelar</button>
            <button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              {saving ? 'Guardando...' : editing ? 'Guardar Cambios' : 'Crear Dominio'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

function Field({ label, name, defaultValue, type, placeholder, required, step }: any) {
  return (
    <div>
      <label className="block text-xs text-gray-500 mb-1">{label}</label>
      <input type={type || 'text'} name={name} defaultValue={defaultValue || ''} placeholder={placeholder} required={required} step={step}
        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
    </div>
  )
}

function SelectField({ label, name, defaultValue, options }: { label: string; name: string; defaultValue?: any; options: { value: any; label: string }[] }) {
  return (
    <div>
      <label className="block text-xs text-gray-500 mb-1">{label}</label>
      <select name={name} defaultValue={defaultValue || ''}
        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
        <option value="">-</option>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )
}
