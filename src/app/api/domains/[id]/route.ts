export const dynamic = "force-dynamic";
import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const domain = await prisma.domain.findUnique({
    where: { id: parseInt(params.id) },
    include: { vertical: true, country: true, entity: true, whoisChecks: { orderBy: { checkedAt: 'desc' }, take: 5 } },
  })
  if (!domain) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(domain)
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json()
  const data: any = {}
  const fields = [
    'name', 'tld', 'domainFull', 'subtype', 'status', 'priority', 'registrar',
    'cfZoneId', 'cfNameserver1', 'cfNameserver2', 'cfSslMode', 'cfEmailDest',
    'hostingProvider', 'serverIp', 'coolifyResource', 'containerName', 'framework',
    'redirectTo', 'redirectType', 'workerRule', 'notes',
  ]
  fields.forEach((f) => { if (body[f] !== undefined) data[f] = body[f] })

  const intFields = ['verticalId', 'countryId', 'entityId', 'port']
  intFields.forEach((f) => { if (body[f] !== undefined) data[f] = body[f] ? parseInt(body[f]) : null })

  const boolFields = ['cfEmailRouting', 'hasLanding', 'hasLeadCapture']
  boolFields.forEach((f) => { if (body[f] !== undefined) data[f] = body[f] })

  const floatFields = ['annualCostUsd']
  floatFields.forEach((f) => { if (body[f] !== undefined) data[f] = body[f] ? parseFloat(body[f]) : null })

  const dateFields = ['registeredAt', 'renewalDate']
  dateFields.forEach((f) => { if (body[f] !== undefined) data[f] = body[f] ? new Date(body[f]) : null })

  const domain = await prisma.domain.update({ where: { id: parseInt(params.id) }, data })
  return NextResponse.json(domain)
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  await prisma.domain.delete({ where: { id: parseInt(params.id) } })
  return NextResponse.json({ ok: true })
}
