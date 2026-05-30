import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { generateFormQuestions } from '@/ai/questions/generate';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { title, about } = await req.json();
    if (!title || !about) {
      return NextResponse.json({ error: 'title and about are required' }, { status: 400 });
    }

    const form_fields = await generateFormQuestions({ title, about } as any, 5);
    return NextResponse.json({ form_fields });
  } catch (err: any) {
    console.error('generate/questions error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
