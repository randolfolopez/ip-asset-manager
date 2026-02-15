export const dynamic = "force-dynamic";
import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const entities = await prisma.entity.findMany({ orderBy: { name: 'asc' } })
  return NextResponse.json({ entities })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const entity = await prisma.entity.create({
    data: {
      name: body.name,
      rnc: body.rnc || null,
      type: body.type || null,
    },
  })
  return NextResponse.json(entity, { status: 201 })
}
