export const dynamic = "force-dynamic";
import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json()
  const item = await prisma.domainWatchlist.update({
    where: { id: parseInt(params.id) },
    data: {
      name: body.name,
      tld: body.tld,
      domainFull: body.domainFull,
      currentOwner: body.currentOwner || null,
      registrar: body.registrar || null,
      expiryDate: body.expiryDate ? new Date(body.expiryDate) : null,
      estimatedPrice: body.estimatedPrice ? parseFloat(body.estimatedPrice) : null,
      status: body.status,
      priority: body.priority,
      vertical: body.vertical || null,
      notes: body.notes || null,
    },
  })
  return NextResponse.json(item)
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  await prisma.domainWatchlist.delete({ where: { id: parseInt(params.id) } })
  return NextResponse.json({ ok: true })
}
