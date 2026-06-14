const STORAGE_KEY = 'garment-care:garments';
const LAUNDRY_STORAGE_KEY = 'garment-care:laundry-batches';
const DRY_CLEANING_STORAGE_KEY = 'garment-care:dry-cleaning-records';

export function loadGarmentsFromStorage<T>(): T[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveGarmentsToStorage<T>(garments: T[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(garments));
  } catch (e) {
    console.error('Failed to save garments:', e);
  }
}

export function loadLaundryBatchesFromStorage<T>(): T[] {
  try {
    const data = localStorage.getItem(LAUNDRY_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveLaundryBatchesToStorage<T>(batches: T[]): void {
  try {
    localStorage.setItem(LAUNDRY_STORAGE_KEY, JSON.stringify(batches));
  } catch (e) {
    console.error('Failed to save laundry batches:', e);
  }
}

export function loadDryCleaningRecordsFromStorage<T>(): T[] {
  try {
    const data = localStorage.getItem(DRY_CLEANING_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveDryCleaningRecordsToStorage<T>(records: T[]): void {
  try {
    localStorage.setItem(DRY_CLEANING_STORAGE_KEY, JSON.stringify(records));
  } catch (e) {
    console.error('Failed to save dry cleaning records:', e);
  }
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

export function compressImage(file: File, maxWidth = 800, quality = 0.6): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const base64 = canvas.toDataURL('image/jpeg', quality);
        resolve(base64);
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}
