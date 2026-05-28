// Image compression utility to reduce file size and prevent HTTP 413 errors

export const compressImage = (file, maxWidth = 1920, maxHeight = 1080, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Calculate new dimensions maintaining aspect ratio
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        // Create canvas and compress
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to blob
        canvas.toBlob(
          (blob) => {
            // Create new file from blob
            const compressedFile = new File(
              [blob],
              file.name,
              { type: 'image/jpeg', lastModified: Date.now() }
            );

            console.log(`📸 Image compressée: ${(file.size / 1024).toFixed(2)}KB → ${(compressedFile.size / 1024).toFixed(2)}KB`);
            resolve(compressedFile);
          },
          'image/jpeg',
          quality
        );
      };

      img.onerror = () => {
        reject(new Error('Impossible de charger l\'image'));
      };

      img.src = event.target.result;
    };

    reader.onerror = () => {
      reject(new Error('Erreur lecture du fichier'));
    };

    reader.readAsDataURL(file);
  });
};

// Compress multiple images
export const compressImages = async (files) => {
  const compressed = [];
  for (const file of files) {
    if (file.type.startsWith('image/')) {
      try {
        const result = await compressImage(file);
        compressed.push(result);
      } catch (err) {
        console.error('Erreur compression:', err);
        compressed.push(file); // Fallback to original
      }
    } else {
      compressed.push(file);
    }
  }
  return compressed;
};

// Check if file size is acceptable
export const isFileSizeAcceptable = (file, maxSizeMB = 5) => {
  const maxBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxBytes;
};

export default {
  compressImage,
  compressImages,
  isFileSizeAcceptable
};
