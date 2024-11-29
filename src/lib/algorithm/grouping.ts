import { getGroupWeight } from './utils/weight';
import { isValidGrouping, normalizeGrouping } from './utils/validation';
import { generateSolutionDescription, formatGroupsAsJson } from './utils/format';
import { checkVolumeUtilization } from './utils/volume';
import type { Product, ResponseData } from './types';

/**
 * 生成所有可能的分组组合
 */
function generateAllPossibleGroups(products: Product[]): Product[][][] {
  const result: Product[][][] = [];
  const seenGroupings = new Set<string>();

  function generateCombinations(remaining: Product[], current: Product[][], maxGroups: number) {
    if (remaining.length === 0) {
      const nonEmptyGroups = current.filter((g) => g.length > 0);
      const validationResult = isValidGrouping(nonEmptyGroups);

      if (validationResult.valid) {
        const normalized = normalizeGrouping(nonEmptyGroups);
        if (!seenGroupings.has(normalized)) {
          seenGroupings.add(normalized);
          result.push([...nonEmptyGroups]);
        }
      }
      return;
    }

    const [currentProduct, ...newRemaining] = remaining;

    current.forEach((_, i) => {
      if (currentProduct) {
        const newGroups = current.map((g, idx) => (idx === i ? [...g, currentProduct] : [...g]));
        generateCombinations(newRemaining, newGroups, maxGroups);
      }
    });

    if (current.length < products.length && currentProduct) {
      const newGroups = [...current, [currentProduct]];
      generateCombinations(newRemaining, newGroups, maxGroups);
    }
  }

  generateCombinations(products, [[]], products.length);
  return result;
}

/**
 * 查找最优的产品分组方案
 */
export function findOptimalGroups(products: Product[]): ResponseData {
  // 检查体积利用率
  const volumeCheck = checkVolumeUtilization(products);
  if (!volumeCheck.canGroup) {
    return {
      weightDiff: 0,
      weights: products.map((p) => p.weight),
      message: {
        general: volumeCheck.message ?? '产品不适合分组',
        solutions: [],
      },
      totalSolutions: 0,
      solutions: [],
    };
  }

  const possibleGroups = generateAllPossibleGroups(products);

  if (possibleGroups.length === 0) {
    return {
      weightDiff: 0,
      weights: products.map((p) => p.weight),
      message: {
        general: '未找到符合条件的分组方案',
        solutions: [],
      },
      totalSolutions: 0,
      solutions: [],
    };
  }

  const descriptions = possibleGroups.map((grouping, index) =>
    generateSolutionDescription(grouping, index)
  );

  // 计算第一个分组方案的重量差异
  const firstGrouping = possibleGroups[0];
  if (!firstGrouping) {
    throw new Error('第一个分组方案未定义');
  }
  const groupWeights = firstGrouping.map(getGroupWeight);
  const weightDiff = Math.max(...groupWeights) - Math.min(...groupWeights);

  return {
    weightDiff,
    weights: products.map((p) => p.weight),
    message: {
      general: `找到${possibleGroups.length}种分组方案`,
      volumeUtilization: volumeCheck.message,
      solutions: descriptions,
    },
    totalSolutions: possibleGroups.length,
    solutions: formatGroupsAsJson(possibleGroups),
  };
}

const mockProducts: Product[] = [
  { weight: 5, dimensions: { length: 100, width: 50, height: 30 } },
  { weight: 300, dimensions: { length: 150, width: 80, height: 30 } },
  { weight: 550, dimensions: { length: 200, width: 100, height: 30 } },
  { weight: 830, dimensions: { length: 250, width: 120, height: 30 } },
];
const result = findOptimalGroups(mockProducts);

console.log('result', result);
// bun run src/lib/algorithm/grouping.ts
