import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getSession } from '@/lib/auth'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ session: null }, { status: 401 })
  return NextResponse.json({ session })
}

export async function DELETE() {
  const cookieStore = await cookies()
  cookieStore.delete('nexmeet_session')
  return NextResponse.json({ success: true })
}
