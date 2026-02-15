import { prisma } from '@/lib/db'
import { daysUntil, formatCurrency, formatDate, urgencyColor } from '@/lib/utils'
import Link from 'next/link'

async function getStats() {
  const [
    totalDomains,
    activeDomains,
    parkedDomains,
    totalTrademarks,
    totalTradeNames,
    totalMercantile,
    watchlistCount,
    domains,
    trademarks,
    tradeNames,
    mercantiles,
  ] = await Promise.all([
    prisma.domain.count(),
    prisma.domain.count({ where: { status: 'active' } }),
    prisma.domain.count({ where: { status: 'parked' } }),
    prisma.trademark.count(),
    prisma.tradeName.count(),
    prisma.mercantileRecord.count(),
    prisma.domainWatchlist.count(),
    prisma.domain.findMany({
      where: { renewalDate: { not: null } },
      orderBy: { renewalDate: 'asc' },
      take: 100,
      select: { id: true, domainFull: true, renewalDate: true, annualCostUsd: true, status: true },
    }),
    prisma.trademark.findMany({
      where: { expiryDate: { not: null } },
      orderBy: { expiryDate: 'asc' },
      take: 10,
      select: { id: true, name: true, expiryDate: true, status: true },
    }),
    prisma.tradeName.findMany({
      where: { expiryDate: { not: null } },
      orderBy: { expiryDate: 'asc' },
      take: 10,
      select: { id: true, name: true, expiryDate: true, status: true },
    }),
    prisma.mercantileRecord.findMany({
      where: { renewalDate: { not: null } },
      orderBy: { renewalDate: 'asc' },
      take: 10,
      select: { id: true, companyName: true, renewalDate: true, status: true },
    }),
  ])

  const domainCost = domains.reduce((sum, d) => sum + (d.annualCostUsd || 0), 0)

  // Upcoming renewals across all asset types
  const allRenewals = [
    ...domains.map((d) => ({ type: 'Dominio', name: d.domainFull, date: d.renewalDate!, href: `/domains/${d.id}` })),
    ...trademarks.map((t) => ({ type: 'Marca', name: t.name, date: t.expiryDate!, href: `/onapi` })),
    ...tradeNames.map((t) => ({ type: 'Nombre Comercial', name: t.name, date: t.expiryDate!, href: `/onapi` })),
    ...mercantiles.map((m) => ({ type: 'Reg. Mercantil', name: m.companyName, date: m.renewalDate!, href: `/mercantile` })),
  ]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 15)

  const urgentCount = allRenewals.filter((r) => {
    const d = daysUntil(r.date)
    return d !== null && d < 30
  }).length

  const warningCount = allRenewals.filter((r) => {
    const d = daysUntil(r.date)
    return d !== null && d >= 30 && d < 90
  }).length

  return {
    totalDomains, activeDomains, parkedDomains,
    totalTrademarks, totalTradeNames, totalMercantile,
    watchlistCount, domainCost, allRenewals, urgentCount, warningCount,
  }
}

export default async function DashboardPage() {
  const stats = await getStats()
  const totalAssets = stats.totalDomains + stats.totalTrademarks + stats.totalTradeNames + stats.totalMercantile

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">Resumen de activos de propiedad intelectual</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Activos" value={totalAssets} icon="📊" />
        <StatCard label="Dominios" value={stats.totalDomains} sub={`${stats.activeDomains} activos`} icon="🌐" href="/domains" />
        <StatCard label="Marcas / NC" value={stats.totalTrademarks + stats.totalTradeNames} sub="ONAPI" icon="🛡️" href="/onapi" />
        <StatCard label="Reg. Mercantil" value={stats.totalMercantile} icon="🏢" href="/mercantile" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Costo Anual Dominios" value={formatCurrency(stats.domainCost)} icon="💰" />
        <StatCard label="Watchlist" value={stats.watchlistCount} icon="👁️" href="/watchlist" />
        <StatCard label="Vencen < 30 días" value={stats.urgentCount} icon="🔴" alert={stats.urgentCount > 0} />
        <StatCard label="Vencen < 90 días" value={stats.warningCount} icon="🟡" />
      </div>

      {/* Upcoming Renewals */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
          <h2 className="text-white font-semibold">Próximas Renovaciones</h2>
          <Link href="/calendar" className="text-blue-400 text-sm hover:text-blue-300">Ver calendario →</Link>
        </div>
        <div className="divide-y divide-gray-800">
          {stats.allRenewals.length === 0 ? (
            <div className="px-5 py-8 text-center text-gray-500">No hay renovaciones programadas</div>
          ) : (
            stats.allRenewals.map((item, i) => {
              const days = daysUntil(item.date)
              return (
                <Link key={i} href={item.href} className="flex items-center justify-between px-5 py-3 hover:bg-gray-800/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded">{item.type}</span>
                    <span className="text-white text-sm">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-gray-400 text-sm">{formatDate(item.date)}</span>
                    <span className={`text-sm font-medium ${urgencyColor(days)}`}>
                      {days !== null ? (days < 0 ? `Venció hace ${Math.abs(days)}d` : `${days}d`) : '-'}
                    </span>
                  </div>
                </Link>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, sub, icon, href, alert }: {
  label: string; value: string | number; sub?: string; icon: string; href?: string; alert?: boolean
}) {
  const Wrapper = href ? Link : 'div'
  return (
    <Wrapper href={href || ''} className={`bg-gray-900 border rounded-xl p-4 ${alert ? 'border-red-500/50' : 'border-gray-800'} ${href ? 'hover:border-gray-700 transition-colors cursor-pointer' : ''}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-400 text-sm">{label}</span>
        <span className="text-lg">{icon}</span>
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
      {sub && <div className="text-gray-500 text-xs mt-1">{sub}</div>}
    </Wrapper>
  )
}
