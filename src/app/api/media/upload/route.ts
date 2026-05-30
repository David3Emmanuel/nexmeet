import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    const MAX_SIZE = 5 * 1024 * 1024 // 5 MB

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Only JPEG, PNG, WebP and GIF images are allowed' }, { status: 415 })
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File exceeds the 5 MB limit' }, { status: 413 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder: 'nexmeet' }, (error, result) => {
          if (error || !result) reject(error ?? new Error('Upload failed'))
          else resolve(result as { secure_url: string })
        })
        .end(buffer)
    })

    return NextResponse.json({ url: result.secure_url })
  } catch (err) {
    console.error('[media/upload]', err)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
