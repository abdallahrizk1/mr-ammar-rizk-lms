import 'server-only';

/**
 * Server-Side Image Security Validator
 * Validates uploaded WebP files on Edge / Node runtimes:
 * 1. Rejects payload if size > 500KB
 * 2. Verifies true WebP Magic Bytes (RIFF + WEBP header)
 * Protects Cloudflare R2 from disguised executables or oversized payloads.
 */

const MAX_WEBP_SIZE_BYTES = 500 * 1024; // 500 KB strict limit

export async function validateUploadedWebpFile(file: File): Promise<Uint8Array> {
  if (!file || file.size === 0) {
    throw new Error('INVALID_FILE: لم يتم تقديم ملف صالح');
  }

  if (file.size > MAX_WEBP_SIZE_BYTES) {
    throw new Error('PAYLOAD_TOO_LARGE: حجم الصورة يتجاوز الحد الأقصى المسموح (500KB)');
  }

  const buffer = new Uint8Array(await file.arrayBuffer());

  if (buffer.byteLength > MAX_WEBP_SIZE_BYTES || buffer.byteLength < 12) {
    throw new Error('INVALID_IMAGE_SIZE: حجم بايتات الصورة غير صالح');
  }

  // Magic Bytes Check:
  // Bytes 0..3 === "RIFF" (0x52, 0x49, 0x46, 0x46)
  const isRiffHeader =
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46;

  // Bytes 8..11 === "WEBP" (0x57, 0x45, 0x42, 0x50)
  const isWebpSignature =
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50;

  if (!isRiffHeader || !isWebpSignature) {
    throw new Error('INVALID_MAGIC_BYTES: الملف المرفوع ليس صورة WebP حقيقية أو يحتوي على ترويسة تالفة');
  }

  return buffer;
}
