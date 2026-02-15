export const dynamic = "force-dynamic";
import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { randomUUID } from 'crypto'

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get('file') as File
  const assetType = formData.get('assetType') as string // trademark, tradename, mercantile
  const assetId = formData.get('assetId') as string

  if (!file || !assetType || !assetId) {
    return NextResponse.json({ error: 'Missing file, assetType, or assetId' }, { status: 400 })
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const ext = path.extname(file.name)
  const filename = `${randomUUID()}${ext}`
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', assetType)
  await mkdir(uploadDir, { recursive: true })

  const filepath = path.join(uploadDir, filename)
  await writeFile(filepath, buffer)

  const data: any = {
    filename,
    originalName: file.name,
    mimeType: file.type,
    size: buffer.length,
    path: `/uploads/${assetType}/${filename}`,
  }

  if (assetType === 'trademark') data.trademarkId = parseInt(assetId)
  else if (assetType === 'tradename') data.tradeNameId = parseInt(assetId)
  else if (assetType === 'mercantile') data.mercantileId = parseInt(assetId)

  const attachment = await prisma.attachment.create({ data })
  return NextResponse.json(attachment, { status: 201 })
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  await prisma.attachment.delete({ where: { id: parseInt(id) } })
  return NextResponse.json({ ok: true })
}
