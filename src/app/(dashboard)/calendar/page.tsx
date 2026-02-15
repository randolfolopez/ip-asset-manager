import { prisma } from '@/lib/db'
import { formatDate, daysUntil, urgencyColor } from '@/lib/utils'

async function getRenewals() {
  const [domains, trademarks, tradeNames, mercantiles] = await Promise.all([
    prisma.domain.findMany({ where: { renewalDate: { not: null } }, select: { id: true, domainFull: true, renewalDate: true, annualCostUsd: true, status: true }, orderBy: { renewalDate: 'asc' } }),
    prisma.trademark.findMany({ where: { expiryDate: { not: null } }, select: { id: true, name: true, expiryDate: true, renewalCost: true, status: true }, orderBy: { expiryDate: 'asc' } }),
    prisma.tradeName.findMany({ where: { expiryDate: { not: null } }, select: { id: true, name: true, expiryDate: true, renewalCost: true, status: true }, orderBy: { expiryDate: 'asc' } }),
    prisma.mercantileRecord.findMany({ where: { renewalDate: { not: null } }, select: { id: true, companyName: true, renewalDate: true, renewalCost: true, status: true }, orderBy: { renewalDate: 'asc' } }),
  ])

  return [
    ...domains.map(d => ({ type: 'Dominio', name: d.domainFull, date: d.renewalDate!, cost: d.annualCostUsd, icon: '🌐' })),
    ...trademarks.map(t => ({ type: 'Marca', name: t.name, date: t.expiryDate!, cost: t.renewalCost, icon: '🛡️' })),
    ...tradeNames.map(t => ({ type: 'Nombre Comercial', name: t.name, date: t.expiryDate!, cost: t.renewalCost, icon: '📝' })),
    ...mercantiles.map(m => ({ type: 'Reg. Mercantil', name: m.companyName, date: m.renewalDate!, cost: m.renewalCost, icon: '🏢' })),
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

export default async function CalendarPage() {
  const renewals = await getRenewals()

  // Group by month
  const grouped: Record<string, typeof renewals> = {}
  renewals.forEach(r => {
    const key = new Date(r.date).toLocaleDateString('es-DO', { year: 'numeric', month: 'long' })
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(r)
  })

  const expired = renewals.filter(r => daysUntil(r.date)! < 0)
  const urgent = renewals.filter(r => { const d = daysUntil(r.date); return d !== null && d >= 0 && d < 30 })
  const warning = renewals.filter(r => { const d = daysUntil(r.date); return d !== null && d >= 30 && d < 90 })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Calendario de Renovaciones</h1>
        <p className="text-gray-400 text-sm">{renewals.length} renovaciones programadas</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
          <div className="text-red-400 text-sm">Vencidos</div>
          <div className="text-2xl font-bold text-red-400 mt-1">{expired.length}</div>
        </div>
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
          <div className="text-yellow-400 text-sm">Urgente (&lt; 30d)</div>
          <div className="text-2xl font-bold text-yellow-400 mt-1">{urgent.length}</div>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
          <div className="text-blue-400 text-sm">Próximo (&lt; 90d)</div>
          <div className="text-2xl font-bold text-blue-400 mt-1">{warning.length}</div>
        </div>
      </div>

      {/* Timeline */}
      {Object.entries(grouped).map(([month, items]) => (
        <div key={month} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-800 bg-gray-900/50">
            <h3 className="text-white font-semibold capitalize">{month}</h3>
            <span className="text-gray-500 text-xs">{items.length} renovaciones</span>
          </div>
          <div className="divide-y divide-gray-800">
            {items.map((item, i) => {
              const days = daysUntil(item.date)
              return (
                <div key={i} className="flex items-center justify-between px-5 py-3">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{item.icon}</span>
                    <div>
                      <div className="text-white text-sm font-medium">{item.name}</div>
                      <div className="text-gray-500 text-xs">{item.type}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="text-gray-400 text-sm">{item.cost ? `$${item.cost.toFixed(2)}` : '-'}</span>
                    <span className="text-gray-400 text-sm w-24">{formatDate(item.date)}</span>
                    <span className={`text-sm font-medium w-16 text-right ${urgencyColor(days)}`}>
                      {days !== null ? (days < 0 ? `${days}d` : `${days}d`) : '-'}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
