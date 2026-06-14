import { create } from 'zustand';
import { Garment, GarmentType, Material, CARE_METHODS } from '@/types/garment';
import { loadGarmentsFromStorage, saveGarmentsToStorage, generateId } from '@/utils/storage';

interface GarmentState {
  garments: Garment[];
  load: () => void;
  add: (garment: Omit<Garment, 'id' | 'createdAt' | 'updatedAt'>) => string;
  update: (id: string, data: Partial<Garment>) => void;
  remove: (id: string) => void;
  getById: (id: string) => Garment | undefined;
  search: (query: string) => Garment[];
  filter: (type?: GarmentType, material?: Material) => Garment[];
}

export const useGarmentStore = create<GarmentState>((set, get) => ({
  garments: [],

  load: () => {
    const garments = loadGarmentsFromStorage<Garment>();
    set({ garments });
  },

  add: (garment) => {
    const id = generateId();
    const now = new Date().toISOString();
    const newGarment: Garment = {
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
        g.type.toLowerCase().includes(q)
    );
  },

  filter: (type, material) => {
    let result = get().garments;
    if (type) result = result.filter((g) => g.type === type);
    if (material) result = result.filter((g) => g.material === material);
    return result;
  },
}));

export function getCareMethodLabel(method: string): string {
  return CARE_METHODS.includes(method as (typeof CARE_METHODS)[number]) ? method : method;
}
