import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { generateTheme } from '@/ai'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json() as { title?: string; about?: string; image_url?: string }

  if (!body.image_url) {
    return NextResponse.json({ error: 'image_url is required' }, { status: 400 })
  }

  const theme = await generateTheme(body.image_url)
  return NextResponse.json({ theme_config: theme })
}
