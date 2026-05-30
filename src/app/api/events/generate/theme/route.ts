import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { generateTheme } from '@/ai/theme/generate';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { title, about, image_url } = await req.json();
    if (!image_url) {
      return NextResponse.json({ error: 'image_url is required to generate a theme' }, { status: 400 });
    }

    const theme_config = await generateTheme(image_url);
    return NextResponse.json({ theme_config });
  } catch (err: any) {
    console.error('generate/theme error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
