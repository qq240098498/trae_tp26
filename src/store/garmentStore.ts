import { create } from 'zustand';
import { Garment, GarmentType, Material, Season, StorageStatus, CARE_METHODS } from '@/types/garment';
import { loadGarmentsFromStorage, saveGarmentsToStorage, generateId } from '@/utils/storage';

interface GarmentState {
  garments: Garment[];
  load: () => void;
  add: (garment: Omit<Garment, 'id' | 'createdAt' | 'updatedAt'>) => string;
  update: (id: string, data: Partial<Garment>) => void;
  remove: (id: string) => void;
  getById: (id: string) => Garment | undefined;
  search: (query: string) => Garment[];
  filter: (type?: GarmentType, material?: Material, season?: Season, storageStatus?: StorageStatus) => Garment[];
  setStorageStatus: (id: string, status: StorageStatus, location?: string) => void;
  getStoredGarments: () => Garment[];
  getWearableGarments: () => Garment[];
  getGarmentsBySeason: (season: Season) => Garment[];
}

export const useGarmentStore = create<GarmentState>((set, get) => ({
  garments: [],

  load: () => {
    const garments = loadGarmentsFromStorage<Garment>();
    const migrated = garments.map((g) => ({
      season: '四季' as Season,
      storageStatus: '当前可穿' as StorageStatus,
      storageLocation: '',
      ...g,
    }));
    set({ garments: migrated });
  },

  add: (garment) => {
    const id = generateId();
    const now = new Date().toISOString();
    const newGarment: Garment = {
      season: '四季',
      storageStatus: '当前可穿',
      storageLocation: '',
      ...garment,
      id,
      createdAt: now,
      updatedAt: now,
    };
    const updated = [...get().garments, newGarment];
    set({ garments: updated });
    saveGarmentsToStorage(updated);
    return id;
  },

  update: (id, data) => {
    const updated = get().garments.map((g) =>
      g.id === id
        ? { ...g, ...data, updatedAt: new Date().toISOString() }
        : g
    );
    set({ garments: updated });
    saveGarmentsToStorage(updated);
  },

  remove: (id) => {
    const updated = get().garments.filter((g) => g.id !== id);
    set({ garments: updated });
    saveGarmentsToStorage(updated);
  },

  getById: (id) => {
    return get().garments.find((g) => g.id === id);
  },

  search: (query) => {
    const q = query.toLowerCase().trim();
    if (!q) return get().garments;
    return get().garments.filter(
      (g) =>
        g.name.toLowerCase().includes(q) ||
        g.brand.toLowerCase().includes(q) ||
        g.material.toLowerCase().includes(q) ||
        g.type.toLowerCase().includes(q) ||
        g.storageLocation.toLowerCase().includes(q)
    );
  },

  filter: (type, material, season, storageStatus) => {
    let result = get().garments;
    if (type) result = result.filter((g) => g.type === type);
    if (material) result = result.filter((g) => g.material === material);
    if (season) result = result.filter((g) => g.season === season);
    if (storageStatus) result = result.filter((g) => g.storageStatus === storageStatus);
    return result;
  },

  setStorageStatus: (id, status, location) => {
    const now = new Date().toISOString();
    const updated = get().garments.map((g) => {
      if (g.id !== id) return g;
      const updates: Partial<Garment> = {
        storageStatus: status,
        updatedAt: now,
      };
      if (location !== undefined) {
        updates.storageLocation = location;
      }
      if (status === '换季收纳') {
        updates.lastStorageDate = now;
      } else if (status === '当前可穿') {
        updates.lastRetrievalDate = now;
      }
      return { ...g, ...updates };
    });
    set({ garments: updated });
    saveGarmentsToStorage(updated);
  },

  getStoredGarments: () => {
    return get().garments.filter((g) => g.storageStatus === '换季收纳');
  },

  getWearableGarments: () => {
    return get().garments.filter((g) => g.storageStatus === '当前可穿');
  },

  getGarmentsBySeason: (season) => {
    return get().garments.filter((g) => g.season === season || g.season === '四季');
  },
}));

export function getCareMethodLabel(method: string): string {
  return CARE_METHODS.includes(method as (typeof CARE_METHODS)[number]) ? method : method;
}
