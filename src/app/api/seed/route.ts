export const dynamic = "force-dynamic";
import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

const verticals = [
  'farmacia', 'pets', 'deportes', 'turismo', 'bienes_raices', 'entretenimiento',
  'media', 'legal', 'escolar', 'finanzas', 'seguros', 'comercio', 'salud',
  'flores', 'empleo', 'eventos', 'politica', 'lifestyle', 'tecnologia', 'servicios',
]

const countries = [
  { code: 'DO', name: 'República Dominicana' }, { code: 'PE', name: 'Perú' },
  { code: 'CO', name: 'Colombia' }, { code: 'MX', name: 'México' },
  { code: 'AR', name: 'Argentina' }, { code: 'EC', name: 'Ecuador' },
  { code: 'VE', name: 'Venezuela' }, { code: 'CR', name: 'Costa Rica' },
  { code: 'GT', name: 'Guatemala' }, { code: 'BO', name: 'Bolivia' },
  { code: 'HN', name: 'Honduras' }, { code: 'PA', name: 'Panamá' },
  { code: 'BR', name: 'Brasil' }, { code: 'US', name: 'Estados Unidos' },
  { code: 'ES', name: 'España' },
]

export async function POST() {
  // Create admin user
  const existing = await prisma.user.findUnique({ where: { email: 'admin@go.com.do' } })
  if (!existing) {
    const hash = await bcrypt.hash('changeme123', 12)
    await prisma.user.create({
      data: { email: 'admin@go.com.do', password: hash, name: 'Randolfo', role: 'admin' },
    })
  }

  // Upsert verticals
  for (const slug of verticals) {
    await prisma.vertical.upsert({
      where: { slug },
      update: {},
      create: { slug, name: slug.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) },
    })
  }

  // Upsert countries
  for (const c of countries) {
    await prisma.country.upsert({
      where: { code: c.code },
      update: {},
      create: c,
    })
  }

  return NextResponse.json({
    message: 'Seed complete',
    admin: 'admin@go.com.do / changeme123',
    verticals: verticals.length,
    countries: countries.length,
  })
}
