import { getWeightDiff, getMaxWeightRatio, getGroupWeight } from './weight';

interface Product {
  weight: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
}

interface GroupResult {
  valid: boolean;
  reason?: string;
  weightDiff?: number;
  allowedWeightDiff?: number;
}

/**
 * 判断一个分组方案是否合格
 */
export function isValidGrouping(groups: Product[][]): GroupResult {
  // 1. 检查组数是否至少为2
  if (groups.length < 2) {
    return {
      valid: false,
      reason: '分组数量必须至少为2组',
    };
  }

  // 2. 计算重量差异
  const groupWeights = groups.map(getGroupWeight);
  const maxWeight = Math.max(...groupWeights);
  const minWeight = Math.min(...groupWeights);
  const actualWeightDiff = maxWeight - minWeight;
  const allowedWeightDiff = getWeightDiff(groups.flat());
  const maxAllowedRatio = getMaxWeightRatio(groups.flat());

  // 3. 检查重量比例
  const weightRatio = maxWeight / minWeight;
  if (weightRatio > maxAllowedRatio) {
    return {
      valid: false,
      reason: `重量比例${weightRatio.toFixed(2)}超过允许的${maxAllowedRatio}`,
      weightDiff: actualWeightDiff,
      allowedWeightDiff,
    };
  }

  // 4. 检查重量差异是否在允许范围内
  if (actualWeightDiff > allowedWeightDiff) {
    return {
      valid: false,
      reason: `重量差异${actualWeightDiff}克超过允许的${allowedWeightDiff}克`,
      weightDiff: actualWeightDiff,
      allowedWeightDiff,
    };
  }

  // 5. 检查是否有产品重量超过1000克
  if (groups.flat().some((p) => p.weight >= 1000)) {
    return {
      valid: false,
      reason: '存在重量超过1000克的产品，需要分开做模具',
      weightDiff: actualWeightDiff,
      allowedWeightDiff,
    };
  }

  return {
    valid: true,
    weightDiff: actualWeightDiff,
    allowedWeightDiff,
  };
}

/**
 * 标准化分组，用于去重
 */
export function normalizeGrouping(grouping: Product[][]): string {
  const sortedGroups = grouping.map((group) => [...group].sort((a, b) => a.weight - b.weight));
  sortedGroups.sort((a, b) => getGroupWeight(a) - getGroupWeight(b));
  return JSON.stringify(sortedGroups);
}
