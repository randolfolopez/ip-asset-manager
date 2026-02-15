import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') // trademark, tradename

  if (type === 'tradename') {
    const items = await prisma.tradeName.findMany({
      include: { entity: true, attachments: true },
      orderBy: { name: 'asc' },
    })
    return NextResponse.json({ tradeNames: items })
  }

  const trademarks = await prisma.trademark.findMany({
    include: { entity: true, vertical: true, attachments: true },
    orderBy: { name: 'asc' },
  })
  const tradeNames = await prisma.tradeName.findMany({
    include: { entity: true, attachments: true },
    orderBy: { name: 'asc' },
  })

  return NextResponse.json({ trademarks, tradeNames })
}

export async function POST(req: NextRequest) {
  const body = await req.json()

  if (body._type === 'tradename') {
    const item = await prisma.tradeName.create({
      data: {
        name: body.name,
        expediente: body.expediente || null,
        certificate: body.certificate || null,
        entityId: body.entityId || null,
        status: body.status || 'registered',
        registeredAt: body.registeredAt ? new Date(body.registeredAt) : null,
        expiryDate: body.expiryDate ? new Date(body.expiryDate) : null,
        renewalCost: body.renewalCost ? parseFloat(body.renewalCost) : null,
        notes: body.notes || null,
      },
    })
    return NextResponse.json(item, { status: 201 })
  }

  const trademark = await prisma.trademark.create({
    data: {
      name: body.name,
      type: body.type || 'marca',
      niceClass: body.niceClass || null,
      expediente: body.expediente || null,
      certificate: body.certificate || null,
      entityId: body.entityId || null,
      verticalId: body.verticalId || null,
      status: body.status || 'registered',
      registeredAt: body.registeredAt ? new Date(body.registeredAt) : null,
      expiryDate: body.expiryDate ? new Date(body.expiryDate) : null,
      renewalCost: body.renewalCost ? parseFloat(body.renewalCost) : null,
      logoUrl: body.logoUrl || null,
      notes: body.notes || null,
    },
  })
  return NextResponse.json(trademark, { status: 201 })
}
