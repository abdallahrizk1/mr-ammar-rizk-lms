import 'server-only';
import { AwsClient } from 'aws4fetch';

/**
 * Cloudflare R2 Presigned URL Generator
 * Compatible with Edge Runtime and Cloudflare Workers using lightweight aws4fetch.
 * Strictly isolates R2 credentials to the server layer.
 */

const FOUR_HOURS_IN_SECONDS = 14400; // 4 hours validity for HLS chunk folders / uploads

function getR2Client(): AwsClient {
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!accessKeyId || !secretAccessKey) {
    throw new Error('R2_SERVER_CREDENTIALS_MISSING: مفاتيح الوصول لـ Cloudflare R2 غير معرفة بالسيرفر');
  }

  return new AwsClient({
    accessKeyId,
    secretAccessKey,
    service: 's3',
    region: 'auto',
  });
}

export interface PresignUploadParams {
  objectKey: string;
  contentType: string;
  expiresInSeconds?: number;
}

export async function createR2UploadPresignedUrl({
  objectKey,
  contentType,
  expiresInSeconds = FOUR_HOURS_IN_SECONDS,
}: PresignUploadParams): Promise<string> {
  const accountId = process.env.R2_ACCOUNT_ID;
  const bucketName = process.env.R2_BUCKET_NAME;

  if (!accountId || !bucketName) {
    throw new Error('R2_BUCKET_CONFIG_MISSING: إعدادات الحاوية لـ Cloudflare R2 غير مكتملة');
  }

  const client = getR2Client();
  const endpointUrl = new URL(
    `https://${accountId}.r2.cloudflarestorage.com/${bucketName}/${objectKey}`
  );

  endpointUrl.searchParams.set('X-Amz-Expires', String(expiresInSeconds));

  const signedRequest = await client.sign(
    new Request(endpointUrl.toString(), {
      method: 'PUT',
      headers: {
        'Content-Type': contentType,
      },
    }),
    {
      aws: { signQuery: true },
    }
  );

  return signedRequest.url;
}
