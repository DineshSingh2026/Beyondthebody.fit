/**
 * Resize and compress an image file to stay under ~2MB when base64-encoded,
 * so the avatar upload request stays within limits.
 */
const MAX_BASE64_LENGTH = Math.ceil(2 * 1024 * 1024 * (4 / 3)); // ~2.67MB for 2MB image
const MAX_DIM = 1024;

export function compressImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const w = img.width;
      const h = img.height;
      let width = w;
      let height = h;
      if (w > MAX_DIM || h > MAX_DIM) {
        if (w >= h) {
          width = MAX_DIM;
          height = Math.round((h * MAX_DIM) / w);
        } else {
          height = MAX_DIM;
          width = Math.round((w * MAX_DIM) / h);
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas not supported'));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      let quality = 0.88;
      let dataUrl = canvas.toDataURL('image/jpeg', quality);
      while (dataUrl.length > MAX_BASE64_LENGTH && quality > 0.2) {
        quality -= 0.12;
        dataUrl = canvas.toDataURL('image/jpeg', quality);
      }
      if (dataUrl.length > MAX_BASE64_LENGTH) {
        dataUrl = canvas.toDataURL('image/jpeg', 0.5);
      }
      resolve(dataUrl);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    img.src = url;
  });
}
