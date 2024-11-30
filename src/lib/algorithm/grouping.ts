import { getGroupWeight } from './utils/weight';
import { isValidGrouping } from './utils/validation';
import { generateSolutionDescription } from './utils/format';
import { checkVolumeUtilization } from './utils/volume';
import { generateAllPossibleCombinations } from './utils/combinations';
import type { ResponseData, Solution } from '@/types/grouping';
import type { Product } from '@/types/geometry';

/**
 * Find optimal grouping solutions for products within a single mold
 */
export function findOptimalGroups(products: Product[]): ResponseData {
  // Check volume utilization first
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

  // Generate all possible groupings
  const combinations = generateAllPossibleCombinations({
    items: products,
    validate: (groups) => ({ 
      valid: isValidGrouping(groups).valid 
    }),
    maxGroups: 2, // We only want to split into 2 groups for weight balance
    minItemsPerGroup: 1
  });

  // Extract just the groups from combinations
  const possibleGroups = combinations.map(c => c.groups);

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

  // Convert to our solution format
  const solutions: Solution[] = possibleGroups.map((groups, index) => ({
    solutionId: index + 1,
    groups: groups.map((group, groupIndex) => ({
      groupId: groupIndex + 1,
      weights: group.map((p) => p.weight),
      totalWeight: getGroupWeight(group),
    })),
  }));

  // Generate descriptions for each solution
  const descriptions = solutions.map((_, index) => {
    const groups = possibleGroups[index];
    if (!groups) {
      throw new Error(`Missing groups for solution ${index + 1}`);
    }
    return generateSolutionDescription(groups, index + 1);
  });

  // Ensure we have at least one solution before accessing it
  if (solutions.length === 0) {
    throw new Error('No solutions available');
  }

  const firstSolution = solutions[0];
  if (!firstSolution || firstSolution.groups.length < 2) {
    throw new Error('Invalid solution structure');
  }

  return {
    weightDiff: Math.abs(
        firstSolution.groups[0]!.totalWeight - firstSolution.groups[1]!.totalWeight
    ),
    weights: products.map((p) => p.weight),
    message: {
      general: `找到${possibleGroups.length}种分组方案`,
      volumeUtilization: volumeCheck.message,
      solutions: descriptions,
    },
    totalSolutions: possibleGroups.length,
    solutions,
  };
}

// const mockProducts: Product[] = [
//   { weight: 5, dimensions: { length: 100, width: 50, height: 30 } },
//   { weight: 300, dimensions: { length: 150, width: 80, height: 30 } },
//   { weight: 550, dimensions: { length: 200, width: 100, height: 30 } },
//   { weight: 830, dimensions: { length: 250, width: 120, height: 30 } },
// ];
// const result = findOptimalGroups(mockProducts);

// console.log('result', result);
// // bun run src/lib/algorithm/grouping.ts
