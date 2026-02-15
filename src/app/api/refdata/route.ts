export const dynamic = "force-dynamic";
import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  const [verticals, countries, entities] = await Promise.all([
    prisma.vertical.findMany({ orderBy: { name: 'asc' } }),
    prisma.country.findMany({ orderBy: { name: 'asc' } }),
    prisma.entity.findMany({ orderBy: { name: 'asc' } }),
  ])
  return NextResponse.json({ verticals, countries, entities })
}
