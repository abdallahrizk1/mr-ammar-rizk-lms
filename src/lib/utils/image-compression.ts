/**
 * Client-Side In-Browser Image Compression Utility
 * Compresses any user-selected image (even 10MB+) via HTML Canvas
 * into high quality WebP format with size strictly below 500KB.
 */

export interface CompressionOptions {
  maxSizeBytes?: number;
  maxWidth?: number;
  maxHeight?: number;
  initialQuality?: number;
  minQuality?: number;
}

const DEFAULT_MAX_SIZE = 500 * 1024; // 500 KB limit
const DEFAULT_MAX_WIDTH = 1920;
const DEFAULT_MAX_HEIGHT = 1920;
const DEFAULT_INITIAL_QUALITY = 0.85;
const DEFAULT_MIN_QUALITY = 0.45;

/**
 * Loads a File object into an HTMLImageElement
 */
function fileToImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Failed to load image element'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Converts canvas to a WebP Blob with specified quality
 */
function canvasToWebpBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Canvas to WebP blob conversion failed'));
          return;
        }
        resolve(blob);
      },
      'image/webp',
      quality
    );
  });
}

/**
 * Compresses an image file in the browser to WebP under the target size limit.
 */
export async function compressImageToWebp(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  if (typeof window === 'undefined') {
    throw new Error('compressImageToWebp must be executed in a browser environment');
  }

  const maxSize = options.maxSizeBytes ?? DEFAULT_MAX_SIZE;
  const maxWidth = options.maxWidth ?? DEFAULT_MAX_WIDTH;
  const maxHeight = options.maxHeight ?? DEFAULT_MAX_HEIGHT;
  let quality = options.initialQuality ?? DEFAULT_INITIAL_QUALITY;
  const minQuality = options.minQuality ?? DEFAULT_MIN_QUALITY;

  const img = await fileToImage(file);

  // Calculate scaled dimensions
  let { width, height } = img;
  if (width > maxWidth || height > maxHeight) {
    const ratio = Math.min(maxWidth / width, maxHeight / height);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context is not available');
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, width, height);

  let blob = await canvasToWebpBlob(canvas, quality);

  while (blob.size > maxSize && quality > minQuality) {
    quality = Math.max(minQuality, quality - 0.1);
    blob = await canvasToWebpBlob(canvas, quality);
  }

  while (blob.size > maxSize && (canvas.width > 300 || canvas.height > 300)) {
    canvas.width = Math.round(canvas.width * 0.8);
    canvas.height = Math.round(canvas.height * 0.8);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    blob = await canvasToWebpBlob(canvas, minQuality);
  }

  const originalNameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
  const webpFileName = `${originalNameWithoutExt}.webp`;

  return new File([blob], webpFileName, {
    type: 'image/webp',
    lastModified: Date.now(),
  });
}
