// FormData compression utility - compress images before adding to FormData

import { compressImage } from './imageCompression';

export const compressFormDataImages = async (formData) => {
  const entries = Array.from(formData.entries());
  const compressedData = new FormData();

  for (const [key, value] of entries) {
    if (value instanceof File && value.type.startsWith('image/')) {
      try {
        console.log(`🖼️ Compressing ${key}: ${(value.size / 1024).toFixed(2)}KB...`);
        const compressed = await compressImage(value, 1920, 1080, 0.8);
        console.log(`✅ ${key} compressed: ${(compressed.size / 1024).toFixed(2)}KB`);
        compressedData.append(key, compressed, value.name);
      } catch (err) {
        console.warn(`⚠️ Compression failed for ${key}, using original:`, err);
        compressedData.append(key, value, value.name);
      }
    } else {
      compressedData.append(key, value);
    }
  }

  return compressedData;
};

export default {
  compressFormDataImages
};
