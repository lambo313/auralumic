import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const UPLOAD_DIR = process.env.UPLOAD_DIR || './public/uploads';
const MAX_SIZE = Number(process.env.NEXT_PUBLIC_UPLOAD_MAX_SIZE) || 5 * 1024 * 1024; // 5MB

export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'File too large' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type' },
        { status: 400 }
      );
    }

    // Create unique filename
    const timestamp = Date.now();
    const extension = file.name.split('.').pop();
    const filename = `${userId}-${timestamp}.${extension}`;
    
    // Ensure upload directory exists
    const uploadPath = join(process.cwd(), UPLOAD_DIR);
    if (!existsSync(uploadPath)) {
      await mkdir(uploadPath, { recursive: true });
    }
    
    await writeFile(join(uploadPath, filename), Buffer.from(await file.arrayBuffer()));

    // Return the URL to the uploaded file
    const fileUrl = `/uploads/${filename}`;
    
    return NextResponse.json({ url: fileUrl });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    );
  }
}
