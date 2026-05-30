import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { generateFormQuestions } from '@/ai'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json() as { title?: string; about?: string; count?: number }

  if (!body.title || !body.about) {
    return NextResponse.json({ error: 'title and about are required' }, { status: 400 })
  }

  const requestedCount = Number(body.count) || 5;
  const clampedCount = Math.min(Math.max(requestedCount, 1), 5);

  const questions = await generateFormQuestions(
    { title: body.title, about: body.about },
    clampedCount,
  )

  return NextResponse.json({ form_fields: questions })
}
