export type GarmentType = '衣服' | '裤子' | '外套' | '毛衣' | '裙子' | '内衣' | '其他';

export type Material = '羊毛' | '真丝' | '棉' | '聚酯纤维' | '亚麻' | '牛仔' | '皮革' | '混纺' | '其他';

export type CareMethod = '水洗' | '干洗' | '水温≤30°' | '不可漂白' | '不可烘干' | '低温熨烫' | '中温熨烫' | '高温熨烫';

export type Season = '春季' | '夏季' | '秋季' | '冬季' | '四季';

export type StorageStatus = '当前可穿' | '换季收纳';

export interface Garment {
  id: string;
  name: string;
  type: GarmentType;
  brand: string;
  material: Material;
  purchaseDate: string;
  purchasePrice: number;
  careMethods: CareMethod[];
  labelPhotos: string[];
  season: Season;
  storageStatus: StorageStatus;
  storageLocation: string;
  lastStorageDate?: string;
  lastRetrievalDate?: string;
  createdAt: string;
  updatedAt: string;
}

export const GARMENT_TYPES: GarmentType[] = ['衣服', '裤子', '外套', '毛衣', '裙子', '内衣', '其他'];

export const MATERIALS: Material[] = ['羊毛', '真丝', '棉', '聚酯纤维', '亚麻', '牛仔', '皮革', '混纺', '其他'];

export const SEASONS: Season[] = ['春季', '夏季', '秋季', '冬季', '四季'];

export const STORAGE_STATUSES: StorageStatus[] = ['当前可穿', '换季收纳'];

export const SEASON_ICONS: Record<Season, string> = {
  '春季': 'Flower2',
  '夏季': 'Sun',
  '秋季': 'Leaf',
  '冬季': 'Snowflake',
  '四季': 'Sparkles',
};

export const SEASON_COLORS: Record<Season, string> = {
  '春季': 'bg-green-100 text-green-700',
  '夏季': 'bg-orange-100 text-orange-700',
  '秋季': 'bg-amber-100 text-amber-700',
  '冬季': 'bg-sky-100 text-sky-700',
  '四季': 'bg-purple-100 text-purple-700',
};

export const STORAGE_STATUS_COLORS: Record<StorageStatus, string> = {
  '当前可穿': 'bg-emerald-100 text-emerald-700',
  '换季收纳': 'bg-slate-100 text-slate-600',
};

export const CARE_METHODS: CareMethod[] = ['水洗', '干洗', '水温≤30°', '不可漂白', '不可烘干', '低温熨烫', '中温熨烫', '高温熨烫'];

export const GARMENT_TYPE_ICONS: Record<GarmentType, string> = {
  '衣服': 'Shirt',
  '裤子': 'Jeans',
  '外套': 'Coat',
  '毛衣': 'Sweater',
  '裙子': 'Skirt',
  '内衣': 'Underwear',
  '其他': 'Package',
};

export const MATERIAL_COLORS: Record<Material, string> = {
  '羊毛': 'bg-amber-100 text-amber-800',
  '真丝': 'bg-rose-100 text-rose-800',
  '棉': 'bg-sky-100 text-sky-800',
  '聚酯纤维': 'bg-orange-100 text-orange-800',
  '亚麻': 'bg-lime-100 text-lime-800',
  '牛仔': 'bg-blue-100 text-blue-800',
  '皮革': 'bg-yellow-900/10 text-yellow-900',
  '混纺': 'bg-purple-100 text-purple-800',
  '其他': 'bg-gray-100 text-gray-700',
};

export type LaundryStatus = '待洗' | '已完成' | '已取消';

export interface CompatibilityConflict {
  type: string;
  description: string;
  garmentIds: [string, string];
  garmentNames: [string, string];
  conflictingMethods: [CareMethod, CareMethod];
  suggestion: string;
}

export interface CompatibilityResult {
  isCompatible: boolean;
  conflicts: CompatibilityConflict[];
  groups: Garment[][];
}

export interface LaundryBatch {
  id: string;
  name: string;
  garmentIds: string[];
  status: LaundryStatus;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export const LAUNDRY_STATUSES: LaundryStatus[] = ['待洗', '已完成', '已取消'];

export type DryCleaningStatus = '送洗中' | '已取回' | '已取消';

export interface DryCleaningRating {
  score: number;
  comment: string;
  createdAt: string;
}

export interface DryCleaningRecord {
  id: string;
  garmentIds: string[];
  sendDate: string;
  laundryShop: string;
  pickupDate: string;
  cost: number;
  status: DryCleaningStatus;
  reminderEnabled: boolean;
  reminderShown: boolean;
  rating?: DryCleaningRating;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  pickedUpAt?: string;
}

export const DRY_CLEANING_STATUSES: DryCleaningStatus[] = ['送洗中', '已取回', '已取消'];
