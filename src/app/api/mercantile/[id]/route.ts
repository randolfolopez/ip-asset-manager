import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json()
  const record = await prisma.mercantileRecord.update({
    where: { id: parseInt(params.id) },
    data: {
      companyName: body.companyName,
      rnc: body.rnc || null,
      companyType: body.companyType || null,
      chamber: body.chamber || null,
      registryNumber: body.registryNumber || null,
      entityId: body.entityId || null,
      status: body.status,
      registeredAt: body.registeredAt ? new Date(body.registeredAt) : null,
      renewalDate: body.renewalDate ? new Date(body.renewalDate) : null,
      renewalCost: body.renewalCost ? parseFloat(body.renewalCost) : null,
      notes: body.notes || null,
    },
  })
  return NextResponse.json(record)
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  await prisma.mercantileRecord.delete({ where: { id: parseInt(params.id) } })
  return NextResponse.json({ ok: true })
}
