export const dynamic = "force-dynamic";
import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json()
  const id = parseInt(params.id)

  if (body._type === 'tradename') {
    const item = await prisma.tradeName.update({
      where: { id },
      data: {
        name: body.name,
        expediente: body.expediente || null,
        certificate: body.certificate || null,
        entityId: body.entityId || null,
        status: body.status,
        registeredAt: body.registeredAt ? new Date(body.registeredAt) : null,
        expiryDate: body.expiryDate ? new Date(body.expiryDate) : null,
        renewalCost: body.renewalCost ? parseFloat(body.renewalCost) : null,
        notes: body.notes || null,
      },
    })
    return NextResponse.json(item)
  }

  const trademark = await prisma.trademark.update({
    where: { id },
    data: {
      name: body.name,
      type: body.type,
      niceClass: body.niceClass || null,
      expediente: body.expediente || null,
      certificate: body.certificate || null,
      entityId: body.entityId || null,
      verticalId: body.verticalId || null,
      status: body.status,
      registeredAt: body.registeredAt ? new Date(body.registeredAt) : null,
      expiryDate: body.expiryDate ? new Date(body.expiryDate) : null,
      renewalCost: body.renewalCost ? parseFloat(body.renewalCost) : null,
      logoUrl: body.logoUrl || null,
      notes: body.notes || null,
    },
  })
  return NextResponse.json(trademark)
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type')

  if (type === 'tradename') {
    await prisma.tradeName.delete({ where: { id: parseInt(params.id) } })
  } else {
    await prisma.trademark.delete({ where: { id: parseInt(params.id) } })
  }
  return NextResponse.json({ ok: true })
}
