export const dynamic = "force-dynamic";
import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const records = await prisma.mercantileRecord.findMany({
    include: { entity: true, attachments: true },
    orderBy: { companyName: 'asc' },
  })
  return NextResponse.json({ records })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const record = await prisma.mercantileRecord.create({
    data: {
      companyName: body.companyName,
      rnc: body.rnc || null,
      companyType: body.companyType || null,
      chamber: body.chamber || null,
      registryNumber: body.registryNumber || null,
      entityId: body.entityId || null,
      status: body.status || 'active',
      registeredAt: body.registeredAt ? new Date(body.registeredAt) : null,
      renewalDate: body.renewalDate ? new Date(body.renewalDate) : null,
      renewalCost: body.renewalCost ? parseFloat(body.renewalCost) : null,
      notes: body.notes || null,
    },
  })
  return NextResponse.json(record, { status: 201 })
}
