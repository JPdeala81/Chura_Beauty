// FormData compression utility - compress images AGGRESSIVELY before adding to FormData

import { compressImage } from './imageCompression';

export const compressFormDataImages = async (formData) => {
  const entries = Array.from(formData.entries());
  const compressedData = new FormData();
  let totalOriginal = 0;
  let totalCompressed = 0;

  for (const [key, value] of entries) {
    if (value instanceof File && value.type.startsWith('image/')) {
      try {
        const originalSize = value.size;
        totalOriginal += originalSize;

        console.log(`🖼️ [${key}] Compressing: ${(originalSize / 1024 / 1024).toFixed(2)}MB...`);

        // Try aggressive compression first
        let compressed = await compressImage(value, 1280, 720, 0.7);

        // If still too large, compress again
        if (compressed.size > 1024 * 1024) { // > 1MB
          console.warn(`⚠️ [${key}] First pass still large, trying ultra compression...`);
          compressed = await compressImage(value, 800, 600, 0.5);
        }

        totalCompressed += compressed.size;
        const reduction = ((1 - compressed.size / originalSize) * 100).toFixed(1);
        console.log(`✅ [${key}] Compressed: ${(originalSize / 1024 / 1024).toFixed(2)}MB → ${(compressed.size / 1024 / 1024).toFixed(2)}MB (${reduction}% reduction)`);

        compressedData.append(key, compressed, value.name);
      } catch (err) {
        console.error(`❌ [${key}] Compression FAILED:`, err.message);
        // Don't use original - reject it to prevent 413
        throw new Error(`Impossible de compresser ${key}: ${err.message}`);
      }
    } else {
      // Non-image files
      if (value instanceof File) {
        console.log(`📄 [${key}] Non-image file: ${(value.size / 1024).toFixed(2)}KB`);
        totalOriginal += value.size;
        totalCompressed += value.size;
      }
      compressedData.append(key, value);
    }
  }

  console.log(`📊 Total: ${(totalOriginal / 1024 / 1024).toFixed(2)}MB → ${(totalCompressed / 1024 / 1024).toFixed(2)}MB`);

  return compressedData;
};

export default {
  compressFormDataImages
};
