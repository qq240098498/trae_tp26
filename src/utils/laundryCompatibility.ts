import { Garment, CareMethod, CompatibilityConflict, CompatibilityResult } from '@/types/garment';

const WASH_METHODS: CareMethod[] = ['水洗', '干洗'];
const IRON_METHODS: CareMethod[] = ['低温熨烫', '中温熨烫', '高温熨烫'];

interface CareCategory {
  wash: CareMethod | null;
  waterTemp: CareMethod | null;
  bleach: CareMethod | null;
  dry: CareMethod | null;
  iron: CareMethod | null;
}

function categorizeCareMethods(methods: CareMethod[]): CareCategory {
  return {
    wash: methods.find((m) => WASH_METHODS.includes(m)) || null,
    waterTemp: methods.includes('水温≤30°') ? '水温≤30°' : null,
    bleach: methods.includes('不可漂白') ? '不可漂白' : null,
    dry: methods.includes('不可烘干') ? '不可烘干' : null,
    iron: methods.find((m) => IRON_METHODS.includes(m)) || null,
  };
}

const IRON_TEMP_ORDER: Record<string, number> = {
  '低温熨烫': 1,
  '中温熨烫': 2,
  '高温熨烫': 3,
};

const MATERIAL_SEPARATION_RULES: Array<{
  materials: string[];
  type: string;
  description: string;
  suggestion: string;
}> = [
  {
    materials: ['羊毛', '真丝'],
    type: '精致面料',
    description: '精致面料易损伤，需单独洗护',
    suggestion: '精致面料建议单独手洗或干洗',
  },
  {
    materials: ['牛仔'],
    type: '牛仔面料',
    description: '牛仔易掉色，可能染坏其他衣物',
    suggestion: '牛仔建议单独洗涤，防止掉色染色',
  },
  {
    materials: ['内衣'],
    type: '贴身衣物',
    description: '贴身衣物应与外衣分开洗涤，更卫生',
    suggestion: '内衣建议单独手洗',
  },
];

function checkMaterialSeparation(
  g1: Garment,
  g2: Garment
): CompatibilityConflict | null {
  for (const rule of MATERIAL_SEPARATION_RULES) {
    const g1Matches = rule.materials.includes(g1.material) || (rule.type === '贴身衣物' && g1.type === '内衣');
    const g2Matches = rule.materials.includes(g2.material) || (rule.type === '贴身衣物' && g2.type === '内衣');
    const oneMatches = g1Matches !== g2Matches;

    if (oneMatches && (g1Matches || g2Matches)) {
      return {
        type: rule.type,
        description: rule.description,
        garmentIds: [g1.id, g2.id],
        garmentNames: [g1.name, g2.name],
        conflictingMethods: ['水洗', '水洗'],
        suggestion: rule.suggestion,
      };
    }
  }
  return null;
}

function checkCareMethods(
  g1: Garment,
  g2: Garment
): CompatibilityConflict | null {
  const c1 = categorizeCareMethods(g1.careMethods);
  const c2 = categorizeCareMethods(g2.careMethods);

  if (c1.wash && c2.wash && c1.wash !== c2.wash) {
    return {
      type: '洗护方式',
      description: `「${g1.name}」要求${c1.wash}，「${g2.name}」要求${c2.wash}，方式不同`,
      garmentIds: [g1.id, g2.id],
      garmentNames: [g1.name, g2.name],
      conflictingMethods: [c1.wash, c2.wash],
      suggestion: `${c1.wash}与${c2.wash}不能混用，请分开洗`,
    };
  }

  if (c1.waterTemp !== c2.waterTemp) {
    const hasCold = c1.waterTemp || c2.waterTemp;
    if (hasCold) {
      const coldGarment = c1.waterTemp ? g1 : g2;
      const otherGarment = c1.waterTemp ? g2 : g1;
      return {
        type: '水温要求',
        description: `「${coldGarment.name}」要求冷水洗涤，「${otherGarment.name}」无此限制，高温可能损伤精致面料`,
        garmentIds: [g1.id, g2.id],
        garmentNames: [g1.name, g2.name],
        conflictingMethods: ['水温≤30°', '水洗'],
        suggestion: '为保护精致衣物，建议冷水衣物单独洗涤',
      };
    }
  }

  if (c1.bleach !== c2.bleach) {
    const noBleachGarment = c1.bleach ? g1 : g2;
    const otherGarment = c1.bleach ? g2 : g1;
    return {
      type: '漂白要求',
      description: `「${noBleachGarment.name}」不可漂白，「${otherGarment.name}」可能需要漂白处理`,
      garmentIds: [g1.id, g2.id],
      garmentNames: [g1.name, g2.name],
      conflictingMethods: ['不可漂白', '水洗'],
      suggestion: '含有不可漂白衣物时，请避免使用漂白剂，建议分开洗',
    };
  }

  if (c1.dry !== c2.dry) {
    const noDryGarment = c1.dry ? g1 : g2;
    const otherGarment = c1.dry ? g2 : g1;
    return {
      type: '烘干要求',
      description: `「${noDryGarment.name}」不可烘干，「${otherGarment.name}」可烘干`,
      garmentIds: [g1.id, g2.id],
      garmentNames: [g1.name, g2.name],
      conflictingMethods: ['不可烘干', '水洗'],
      suggestion: '不可烘干衣物请单独取出晾干，建议分批处理',
    };
  }

  if (c1.iron && c2.iron && c1.iron !== c2.iron) {
    const order1 = IRON_TEMP_ORDER[c1.iron] || 0;
    const order2 = IRON_TEMP_ORDER[c2.iron] || 0;
    if (Math.abs(order1 - order2) >= 2) {
      return {
        type: '熨烫温度',
        description: `「${g1.name}」要求${c1.iron}，「${g2.name}」要求${c2.iron}，温度差异大`,
        garmentIds: [g1.id, g2.id],
        garmentNames: [g1.name, g2.name],
        conflictingMethods: [c1.iron, c2.iron],
        suggestion: '熨烫温度差异大，建议按温度要求分组熨烫',
      };
    }
  }

  return null;
}

function findConflicts(garments: Garment[]): CompatibilityConflict[] {
  const conflicts: CompatibilityConflict[] = [];
  for (let i = 0; i < garments.length; i++) {
    for (let j = i + 1; j < garments.length; j++) {
      const careConflict = checkCareMethods(garments[i], garments[j]);
      if (careConflict) conflicts.push(careConflict);
      const materialConflict = checkMaterialSeparation(garments[i], garments[j]);
      if (materialConflict) {
        const isDuplicate = conflicts.some(
          (c) =>
            (c.garmentIds[0] === materialConflict.garmentIds[0] &&
              c.garmentIds[1] === materialConflict.garmentIds[1] &&
              c.type === materialConflict.type) ||
            (c.garmentIds[0] === materialConflict.garmentIds[1] &&
              c.garmentIds[1] === materialConflict.garmentIds[0] &&
              c.type === materialConflict.type)
        );
        if (!isDuplicate) conflicts.push(materialConflict);
      }
    }
  }
  return conflicts;
}

function groupCompatibleGarments(
  garments: Garment[],
  conflicts: CompatibilityConflict[]
): Garment[][] {
  if (garments.length <= 1) return garments.length ? [garments] : [];

  const conflictMap = new Map<string, Set<string>>();
  garments.forEach((g) => conflictMap.set(g.id, new Set()));
  conflicts.forEach((c) => {
    conflictMap.get(c.garmentIds[0])?.add(c.garmentIds[1]);
    conflictMap.get(c.garmentIds[1])?.add(c.garmentIds[0]);
  });

  const groups: Garment[][] = [];
  const assigned = new Set<string>();

  for (const garment of garments) {
    if (assigned.has(garment.id)) continue;

    const group: Garment[] = [garment];
    assigned.add(garment.id);
    const groupConflicts = new Set<string>(conflictMap.get(garment.id) || []);

    for (const other of garments) {
      if (assigned.has(other.id)) continue;
      const otherConflicts = conflictMap.get(other.id) || new Set();
      const conflictsWithGroup = [...groupConflicts].some((id) => id === other.id);
      const conflictsInGroup = group.some((g) => otherConflicts.has(g.id));
      if (!conflictsWithGroup && !conflictsInGroup) {
        group.push(other);
        assigned.add(other.id);
        otherConflicts.forEach((id) => groupConflicts.add(id));
      }
    }

    groups.push(group);
  }

  return groups;
}

export function checkCompatibility(garments: Garment[]): CompatibilityResult {
  if (garments.length === 0) {
    return { isCompatible: true, conflicts: [], groups: [] };
  }
  if (garments.length === 1) {
    return { isCompatible: true, conflicts: [], groups: [garments] };
  }

  const conflicts = findConflicts(garments);
  const groups = groupCompatibleGarments(garments, conflicts);

  return {
    isCompatible: conflicts.length === 0,
    conflicts,
    groups,
  };
}

export function getConflictSummary(conflicts: CompatibilityConflict[]): string[] {
  const typeSet = new Set<string>();
  conflicts.forEach((c) => typeSet.add(c.type));
  return Array.from(typeSet);
}
