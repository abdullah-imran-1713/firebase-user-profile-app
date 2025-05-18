import { NextResponse } from 'next/server';
import { uploadImage } from '@/lib/cloudinary';

type CloudinaryError = {
  message: string;
  http_code?: number;
  error?: Record<string, unknown>;
};

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    // Validate file exists
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Only JPG/PNG/WEBP files allowed' },
        { status: 400 }
      );
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 5MB limit' },
        { status: 400 }
      );
    }

    // Use the imported uploadImage function
    const result = await uploadImage(file);
    console.log('Upload result:', result);
    return NextResponse.json({
      success: true,
      url: result.secure_url
    });

  } catch (error) {
    // Type guard for Cloudinary errors
    console.log('Upload error:', error);
    const isCloudinaryError = (err: unknown): err is CloudinaryError => {
      return typeof err === 'object' && err !== null && 'message' in err;
    };

    if (isCloudinaryError(error)) {
      console.error('Cloudinary error:', {
        message: error.message,
        code: error.http_code,
        details: error.error
      });

      return NextResponse.json(
        { 
          error: error.message,
          code: error.http_code,
          details: error.error
        }, 
        { status: error.http_code || 500 }
      );
    }

    if (error instanceof Error) {
      console.error('Upload error:', error.message);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    console.error('Unknown upload error:', error);
    return NextResponse.json(
      { error: 'Unknown upload error' },
      { status: 500 }
    );
  }
}