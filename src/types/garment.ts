export type GarmentType = '衣服' | '裤子' | '外套' | '毛衣' | '裙子' | '内衣' | '其他';

export type Material = '羊毛' | '真丝' | '棉' | '聚酯纤维' | '亚麻' | '牛仔' | '皮革' | '混纺' | '其他';

export type CareMethod = '水洗' | '干洗' | '水温≤30°' | '不可漂白' | '不可烘干' | '低温熨烫' | '中温熨烫' | '高温熨烫';

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
  createdAt: string;
  updatedAt: string;
}

export const GARMENT_TYPES: GarmentType[] = ['衣服', '裤子', '外套', '毛衣', '裙子', '内衣', '其他'];

export const MATERIALS: Material[] = ['羊毛', '真丝', '棉', '聚酯纤维', '亚麻', '牛仔', '皮革', '混纺', '其他'];

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
