/**
 * Resmi yeniden boyutlandırır ve WebP formatına çevirir.
 * @param {File} file - Orijinal dosya
 * @param {object} options
 * @param {number} options.maxSize - Maksimum genişlik/yükseklik (px) — varsayılan 1200
 * @param {number} options.quality - WebP kalitesi 0-1 arası — varsayılan 0.82
 * @returns {Promise<{ blob: Blob, width: number, height: number }>}
 */
export function optimizeImage(file, { maxSize = 1200, quality = 0.82 } = {}) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;

      // Oranı koru, büyük kenarı maxSize'a küçült
      if (width > maxSize || height > maxSize) {
        if (width > height) {
          height = Math.round((height / width) * maxSize);
          width = maxSize;
        } else {
          width = Math.round((width / height) * maxSize);
          height = maxSize;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error('Canvas toBlob failed'));
          resolve({ blob, width, height });
        },
        'image/webp',
        quality
      );
    };
    img.onerror = () => reject(new Error('Resim yüklenemedi'));
    img.src = URL.createObjectURL(file);
  });
}
