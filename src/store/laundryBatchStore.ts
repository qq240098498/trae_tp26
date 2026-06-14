import { create } from 'zustand';
import { LaundryBatch, LaundryStatus } from '@/types/garment';
import { loadLaundryBatchesFromStorage, saveLaundryBatchesToStorage, generateId } from '@/utils/storage';

interface LaundryBatchState {
  batches: LaundryBatch[];
  load: () => void;
  create: (data: { name: string; garmentIds: string[] }) => string;
  update: (id: string, data: Partial<LaundryBatch>) => void;
  remove: (id: string) => void;
  getById: (id: string) => LaundryBatch | undefined;
  updateStatus: (id: string, status: LaundryStatus) => void;
  filterByStatus: (status?: LaundryStatus) => LaundryBatch[];
}

export const useLaundryBatchStore = create<LaundryBatchState>((set, get) => ({
  batches: [],

  load: () => {
    const batches = loadLaundryBatchesFromStorage<LaundryBatch>();
    set({ batches });
  },

  create: (data) => {
    const id = generateId();
    const now = new Date().toISOString();
    const newBatch: LaundryBatch = {
      ...data,
      id,
      status: '待洗',
      createdAt: now,
      updatedAt: now,
    };
    const updated = [newBatch, ...get().batches];
    set({ batches: updated });
    saveLaundryBatchesToStorage(updated);
    return id;
  },

  update: (id, data) => {
    const updated = get().batches.map((b) =>
      b.id === id
        ? { ...b, ...data, updatedAt: new Date().toISOString() }
        : b
    );
    set({ batches: updated });
    saveLaundryBatchesToStorage(updated);
  },

  remove: (id) => {
    const updated = get().batches.filter((b) => b.id !== id);
    set({ batches: updated });
    saveLaundryBatchesToStorage(updated);
  },

  getById: (id) => {
    return get().batches.find((b) => b.id === id);
  },

  updateStatus: (id, status) => {
    const now = new Date().toISOString();
    const updated = get().batches.map((b) =>
      b.id === id
        ? {
            ...b,
            status,
            updatedAt: now,
            completedAt: status === '已完成' ? now : b.completedAt,
          }
        : b
    );
    set({ batches: updated });
    saveLaundryBatchesToStorage(updated);
  },

  filterByStatus: (status) => {
    if (!status) return get().batches;
    return get().batches.filter((b) => b.status === status);
  },
}));
