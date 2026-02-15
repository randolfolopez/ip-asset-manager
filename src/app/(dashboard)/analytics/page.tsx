import { prisma } from '@/lib/db'
import { formatCurrency } from '@/lib/utils'

async function getAnalytics() {
  const domains = await prisma.domain.findMany({
    include: { vertical: true, country: true },
  })

  // By vertical
  const byVertical: Record<string, { count: number; cost: number }> = {}
  domains.forEach(d => {
    const key = d.vertical?.name || 'Sin Vertical'
    if (!byVertical[key]) byVertical[key] = { count: 0, cost: 0 }
    byVertical[key].count++
    byVertical[key].cost += d.annualCostUsd || 0
  })

  // By country
  const byCountry: Record<string, { count: number; cost: number }> = {}
  domains.forEach(d => {
    const key = d.country?.code || 'N/A'
    if (!byCountry[key]) byCountry[key] = { count: 0, cost: 0 }
    byCountry[key].count++
    byCountry[key].cost += d.annualCostUsd || 0
  })

  // By TLD
  const byTld: Record<string, { count: number; cost: number }> = {}
  domains.forEach(d => {
    if (!byTld[d.tld]) byTld[d.tld] = { count: 0, cost: 0 }
    byTld[d.tld].count++
    byTld[d.tld].cost += d.annualCostUsd || 0
  })

  // By status
  const byStatus: Record<string, number> = {}
  domains.forEach(d => { byStatus[d.status] = (byStatus[d.status] || 0) + 1 })

  const totalCost = domains.reduce((s, d) => s + (d.annualCostUsd || 0), 0)

  // ONAPI costs
  const [trademarks, tradeNames, mercantiles] = await Promise.all([
    prisma.trademark.findMany({ select: { renewalCost: true } }),
    prisma.tradeName.findMany({ select: { renewalCost: true } }),
    prisma.mercantileRecord.findMany({ select: { renewalCost: true } }),
  ])
  const onapiCost = [...trademarks, ...tradeNames].reduce((s, t) => s + (t.renewalCost || 0), 0)
  const mercantileCost = mercantiles.reduce((s, m) => s + (m.renewalCost || 0), 0)

  return { byVertical, byCountry, byTld, byStatus, totalCost, onapiCost, mercantileCost, total: domains.length }
}

export default async function AnalyticsPage() {
  const data = await getAnalytics()
  const grandTotal = data.totalCost + data.onapiCost + data.mercantileCost

  const sortedVerticals = Object.entries(data.byVertical).sort((a, b) => b[1].count - a[1].count)
  const sortedCountries = Object.entries(data.byCountry).sort((a, b) => b[1].count - a[1].count)
  const sortedTlds = Object.entries(data.byTld).sort((a, b) => b[1].count - a[1].count)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <p className="text-gray-400 text-sm">Análisis de costos y distribución</p>
      </div>

      {/* Cost Summary */}
      <div className="grid grid-cols-4 gap-4">
        <CostCard label="Costo Total Anual" value={grandTotal} highlight />
        <CostCard label="Dominios" value={data.totalCost} sub={`${data.total} dominios`} />
        <CostCard label="ONAPI" value={data.onapiCost} sub="Marcas + NC" />
        <CostCard label="Registro Mercantil" value={data.mercantileCost} />
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* By Vertical */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-800">
            <h3 className="text-white font-semibold">Por Vertical</h3>
          </div>
          <div className="divide-y divide-gray-800 max-h-96 overflow-y-auto">
            {sortedVerticals.map(([name, { count, cost }]) => (
              <div key={name} className="flex items-center justify-between px-5 py-2.5">
                <div className="flex items-center gap-3">
                  <span className="text-white text-sm">{name}</span>
                  <span className="text-gray-600 text-xs">{count}</span>
                </div>
                <span className="text-gray-400 text-sm">{formatCurrency(cost)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* By Country */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-800">
            <h3 className="text-white font-semibold">Por País</h3>
          </div>
          <div className="divide-y divide-gray-800 max-h-96 overflow-y-auto">
            {sortedCountries.map(([code, { count, cost }]) => (
              <div key={code} className="flex items-center justify-between px-5 py-2.5">
                <div className="flex items-center gap-3">
                  <span className="text-white text-sm">{code}</span>
                  <span className="text-gray-600 text-xs">{count}</span>
                </div>
                <span className="text-gray-400 text-sm">{formatCurrency(cost)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* By TLD */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-800">
            <h3 className="text-white font-semibold">Por TLD</h3>
          </div>
          <div className="divide-y divide-gray-800 max-h-96 overflow-y-auto">
            {sortedTlds.map(([tld, { count, cost }]) => (
              <div key={tld} className="flex items-center justify-between px-5 py-2.5">
                <div className="flex items-center gap-3">
                  <span className="text-white text-sm">{tld}</span>
                  <span className="text-gray-600 text-xs">{count}</span>
                </div>
                <span className="text-gray-400 text-sm">{formatCurrency(cost)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* By Status */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-800">
            <h3 className="text-white font-semibold">Por Estado</h3>
          </div>
          <div className="divide-y divide-gray-800">
            {Object.entries(data.byStatus).sort((a, b) => b[1] - a[1]).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between px-5 py-2.5">
                <span className="text-white text-sm capitalize">{status}</span>
                <span className="text-gray-400 text-sm">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function CostCard({ label, value, sub, highlight }: { label: string; value: number; sub?: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl p-4 ${highlight ? 'bg-blue-600/10 border border-blue-500/30' : 'bg-gray-900 border border-gray-800'}`}>
      <div className="text-gray-400 text-sm">{label}</div>
      <div className={`text-2xl font-bold mt-1 ${highlight ? 'text-blue-400' : 'text-white'}`}>{formatCurrency(value)}</div>
      {sub && <div className="text-gray-500 text-xs mt-1">{sub}</div>}
    </div>
  )
}
