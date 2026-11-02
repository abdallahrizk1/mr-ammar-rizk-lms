'use server';

import { createR2UploadPresignedUrl } from '@/lib/server/r2-presign';

export interface PresignUploadResponse {
  success: boolean;
  uploadUrl?: string;
  fileKey?: string;
  publicUrl?: string;
  error?: string;
}

export async function getUploadPresignedUrlAction({
  fileName,
  contentType,
  folder,
}: {
  fileName: string;
  contentType: string;
  folder: 'forum' | 'receipts';
}): Promise<PresignUploadResponse> {
  try {
    const hasKeys = Boolean(
      process.env.R2_ACCESS_KEY_ID &&
      process.env.R2_SECRET_ACCESS_KEY &&
      process.env.R2_ACCOUNT_ID &&
      process.env.R2_BUCKET_NAME
    );

    if (!hasKeys) {
      return {
        success: false,
        error: 'خدمة التخزين السحابي (Cloudflare R2) غير مهيأة بالسيرفر. يرجى إضافة مفاتيح R2 في .env.local لحفظ الملفات.',
      };
    }

    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedMimeTypes.includes(contentType)) {
      return {
        success: false,
        error: 'نوع الملف غير مدعوم، يرجى رفع صورة صالحة (JPG, PNG, WebP)',
      };
    }

    const sanitized = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const objectKey = `${folder}/${Date.now()}-${sanitized}`;

    const uploadUrl = await createR2UploadPresignedUrl({
      objectKey,
      contentType,
      expiresInSeconds: 3600,
    });

    const publicDomain = process.env.NEXT_PUBLIC_R2_PUBLIC_DOMAIN || '';
    const publicUrl = publicDomain ? `https://${publicDomain}/${objectKey}` : `/${objectKey}`;

    return {
      success: true,
      uploadUrl,
      fileKey: objectKey,
      publicUrl,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'تعذر إنشاء رابط رفع الملف';
    return {
      success: false,
      error: msg,
    };
  }
}
