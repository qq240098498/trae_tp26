import { create } from 'zustand';
import { DryCleaningRecord, DryCleaningStatus, DryCleaningRating } from '@/types/garment';
import { loadDryCleaningRecordsFromStorage, saveDryCleaningRecordsToStorage, generateId } from '@/utils/storage';

interface DryCleaningState {
  records: DryCleaningRecord[];
  load: () => void;
  create: (data: {
    garmentIds: string[];
    sendDate: string;
    laundryShop: string;
    pickupDate: string;
    cost: number;
    reminderEnabled?: boolean;
    notes?: string;
  }) => string;
  update: (id: string, data: Partial<DryCleaningRecord>) => void;
  remove: (id: string) => void;
  getById: (id: string) => DryCleaningRecord | undefined;
  updateStatus: (id: string, status: DryCleaningStatus) => void;
  addRating: (id: string, rating: Omit<DryCleaningRating, 'createdAt'>) => void;
  markReminderShown: (id: string) => void;
  getPendingReminders: () => DryCleaningRecord[];
  filterByStatus: (status?: DryCleaningStatus) => DryCleaningRecord[];
}

export const useDryCleaningStore = create<DryCleaningState>((set, get) => ({
  records: [],

  load: () => {
    const records = loadDryCleaningRecordsFromStorage<DryCleaningRecord>();
    set({ records });
  },

  create: (data) => {
    const id = generateId();
    const now = new Date().toISOString();
    const newRecord: DryCleaningRecord = {
      ...data,
      id,
      status: '送洗中',
      reminderEnabled: data.reminderEnabled ?? true,
      reminderShown: false,
      createdAt: now,
      updatedAt: now,
    };
    const updated = [newRecord, ...get().records];
    set({ records: updated });
    saveDryCleaningRecordsToStorage(updated);
    return id;
  },

  update: (id, data) => {
    const updated = get().records.map((r) =>
      r.id === id
        ? { ...r, ...data, updatedAt: new Date().toISOString() }
        : r
    );
    set({ records: updated });
    saveDryCleaningRecordsToStorage(updated);
  },

  remove: (id) => {
    const updated = get().records.filter((r) => r.id !== id);
    set({ records: updated });
    saveDryCleaningRecordsToStorage(updated);
  },

  getById: (id) => {
    return get().records.find((r) => r.id === id);
  },

  updateStatus: (id, status) => {
    const now = new Date().toISOString();
    const updated = get().records.map((r) =>
      r.id === id
        ? {
            ...r,
            status,
            updatedAt: now,
            pickedUpAt: status === '已取回' ? now : r.pickedUpAt,
          }
        : r
    );
    set({ records: updated });
    saveDryCleaningRecordsToStorage(updated);
  },

  addRating: (id, rating) => {
    const now = new Date().toISOString();
    const updated = get().records.map((r) =>
      r.id === id
        ? {
            ...r,
            rating: {
              ...rating,
              createdAt: now,
            },
            updatedAt: now,
          }
        : r
    );
    set({ records: updated });
    saveDryCleaningRecordsToStorage(updated);
  },

  markReminderShown: (id) => {
    const updated = get().records.map((r) =>
      r.id === id
        ? { ...r, reminderShown: true, updatedAt: new Date().toISOString() }
        : r
    );
    set({ records: updated });
    saveDryCleaningRecordsToStorage(updated);
  },

  getPendingReminders: () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];

    return get().records.filter((r) => {
      if (r.status !== '送洗中') return false;
      if (!r.reminderEnabled) return false;
      if (r.reminderShown) return false;
      return r.pickupDate <= todayStr;
    });
  },

  filterByStatus: (status) => {
    if (!status) return get().records;
    return get().records.filter((r) => r.status === status);
  },
}));
