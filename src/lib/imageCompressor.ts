/**
 * Utility to automatically compress and resize images uploaded to the product catalog
 * to optimize storefront page load times and reduce memory footprint.
 */

export interface ImageCompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 to 1.0
  mimeType?: 'image/webp' | 'image/jpeg' | 'image/png';
}

export interface ImageCompressResult {
  dataUrl: string;
  originalSizeBytes: number;
  compressedSizeBytes: number;
  width: number;
  height: number;
  savingsPercentage: number;
}

const DEFAULT_OPTIONS: Required<ImageCompressOptions> = {
  maxWidth: 1200,
  maxHeight: 1200,
  quality: 0.82,
  mimeType: 'image/webp',
};

/**
 * Format bytes into human-readable size (KB, MB)
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

/**
 * Automatically resizes and compresses an image File using HTML5 Canvas.
 */
export async function compressAndResizeImage(
  file: File,
  customOptions?: ImageCompressOptions
): Promise<ImageCompressResult> {
  const options = { ...DEFAULT_OPTIONS, ...customOptions };
  const originalSizeBytes = file.size;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error('Failed to read image file'));

    reader.onload = (event) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to load image for compression'));

      img.onload = () => {
        try {
          // Calculate target width and height maintaining aspect ratio
          let { width, height } = img;
          const { maxWidth, maxHeight } = options;

          if (width > maxWidth || height > maxHeight) {
            const widthRatio = maxWidth / width;
            const heightRatio = maxHeight / height;
            const bestRatio = Math.min(widthRatio, heightRatio);

            width = Math.round(width * bestRatio);
            height = Math.round(height * bestRatio);
          }

          // Create canvas for high-quality rendering
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Canvas 2D context not available'));
            return;
          }

          // Image smoothing for superior resizing quality
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          // Draw resized image
          ctx.drawImage(img, 0, 0, width, height);

          // Test if WebP is supported, fallback to image/jpeg if needed
          let mime = options.mimeType;
          let dataUrl = canvas.toDataURL(mime, options.quality);

          if (!dataUrl.startsWith(`data:${mime}`)) {
            mime = 'image/jpeg';
            dataUrl = canvas.toDataURL(mime, options.quality);
          }

          // Estimate compressed size in bytes from dataUrl length
          const head = `data:${mime};base64,`;
          const base64Length = dataUrl.length - head.length;
          const compressedSizeBytes = Math.round((base64Length * 3) / 4);

          const savingsPercentage = originalSizeBytes > 0
            ? Math.max(0, Math.round(((originalSizeBytes - compressedSizeBytes) / originalSizeBytes) * 100))
            : 0;

          resolve({
            dataUrl,
            originalSizeBytes,
            compressedSizeBytes,
            width,
            height,
            savingsPercentage,
          });
        } catch (err) {
          reject(err);
        }
      };

      img.src = event.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Utility to compress an existing Data URL or HTTP image URL
 */
export async function compressDataUrl(
  dataUrlOrUrl: string,
  customOptions?: ImageCompressOptions
): Promise<string> {
  const options = { ...DEFAULT_OPTIONS, ...customOptions };

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      let { width, height } = img;
      const { maxWidth, maxHeight } = options;

      if (width > maxWidth || height > maxHeight) {
        const widthRatio = maxWidth / width;
        const heightRatio = maxHeight / height;
        const bestRatio = Math.min(widthRatio, heightRatio);

        width = Math.round(width * bestRatio);
        height = Math.round(height * bestRatio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(dataUrlOrUrl);
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      const compressed = canvas.toDataURL(options.mimeType, options.quality);
      resolve(compressed.length < dataUrlOrUrl.length ? compressed : dataUrlOrUrl);
    };

    img.onerror = () => resolve(dataUrlOrUrl);
    img.src = dataUrlOrUrl;
  });
}
