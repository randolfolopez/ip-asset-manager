export const dynamic = "force-dynamic";
import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search') || ''
  const vertical = searchParams.get('vertical') || ''
  const status = searchParams.get('status') || ''
  const country = searchParams.get('country') || ''
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '50')

  const where: any = {}
  if (search) where.domainFull = { contains: search, mode: 'insensitive' }
  if (vertical) where.verticalId = parseInt(vertical)
  if (status) where.status = status
  if (country) where.countryId = parseInt(country)

  const [domains, total] = await Promise.all([
    prisma.domain.findMany({
      where,
      include: { vertical: true, country: true, entity: true },
      orderBy: { domainFull: 'asc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.domain.count({ where }),
  ])

  return NextResponse.json({ domains, total, page, pages: Math.ceil(total / limit) })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const domain = await prisma.domain.create({
    data: {
      name: body.name,
      tld: body.tld,
      domainFull: body.domainFull,
      verticalId: body.verticalId || null,
      countryId: body.countryId || null,
      subtype: body.subtype || null,
      status: body.status || 'parked',
      priority: body.priority || 'low',
      registrar: body.registrar || null,
      entityId: body.entityId || null,
      registeredAt: body.registeredAt ? new Date(body.registeredAt) : null,
      renewalDate: body.renewalDate ? new Date(body.renewalDate) : null,
      annualCostUsd: body.annualCostUsd || null,
      cfZoneId: body.cfZoneId || null,
      cfSslMode: body.cfSslMode || null,
      cfEmailRouting: body.cfEmailRouting || false,
      hostingProvider: body.hostingProvider || null,
      serverIp: body.serverIp || null,
      hasLanding: body.hasLanding || false,
      hasLeadCapture: body.hasLeadCapture || false,
      redirectTo: body.redirectTo || null,
      redirectType: body.redirectType || null,
      notes: body.notes || null,
    },
  })
  return NextResponse.json(domain, { status: 201 })
}
