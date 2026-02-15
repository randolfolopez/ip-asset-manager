import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const items = await prisma.domainWatchlist.findMany({
    include: { whoisChecks: { orderBy: { checkedAt: 'desc' }, take: 1 } },
    orderBy: { expiryDate: 'asc' },
  })
  return NextResponse.json({ items })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const item = await prisma.domainWatchlist.create({
    data: {
      name: body.name,
      tld: body.tld,
      domainFull: body.domainFull,
      currentOwner: body.currentOwner || null,
      registrar: body.registrar || null,
      expiryDate: body.expiryDate ? new Date(body.expiryDate) : null,
      estimatedPrice: body.estimatedPrice ? parseFloat(body.estimatedPrice) : null,
      status: body.status || 'monitoring',
      priority: body.priority || 'medium',
      vertical: body.vertical || null,
      notes: body.notes || null,
    },
  })
  return NextResponse.json(item, { status: 201 })
}
