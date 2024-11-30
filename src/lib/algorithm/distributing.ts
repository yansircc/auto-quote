import type { 
  Product, 
  ResponseData, 
  MoldDistribution, 
  DistributionSolution, 
  DistributionResult 
} from './types';
import { findOptimalGroups } from './grouping';
import { generateAllPossibleCombinations } from './utils/combinations';
import { checkVolumeUtilization } from './utils/volume';

/**
 * Validate if a distribution of products across molds is feasible
 */
function validateDistribution(groups: Product[][]): { 
  valid: boolean; 
  result: ResponseData[] | undefined;
} {
  // Check volume utilization and grouping feasibility for each mold
  const results: ResponseData[] = [];
  
  for (const products of groups) {
    // Check volume utilization first
    const volumeCheck = checkVolumeUtilization(products);
    if (!volumeCheck.canGroup) {
      return { valid: false, result: undefined };
    }

    // Try to find optimal groups within this mold
    const groupingResult = findOptimalGroups(products);
    if (groupingResult.totalSolutions === 0) {
      return { valid: false, result: undefined };
    }

    results.push(groupingResult);
  }

  return { valid: true, result: results };
}

/**
 * Find all possible ways to distribute products across different molds
 */
export function findOptimalDistribution(products: Product[]): DistributionResult {
  // Generate all possible distributions
  const distributions = generateAllPossibleCombinations({
    items: products,
    validate: validateDistribution,
    maxGroups: products.length, // Maximum one product per mold
    minItemsPerGroup: 1        // At least one product per mold
  });

  if (distributions.length === 0) {
    return {
      solutions: [],
      totalSolutions: 0,
      message: {
        general: '未找到可行的模具分配方案'
      }
    };
  }

  // Convert the results into our desired format
  const validDistributions = distributions
    .filter((dist): dist is { groups: Product[][]; validationResult: ResponseData[] } => 
      dist.validationResult !== undefined && 
      dist.validationResult.length === dist.groups.length
    );

  const solutions: DistributionSolution[] = validDistributions
    .map((dist, index) => ({
      solutionId: index + 1,
      totalMolds: dist.groups.length,
      molds: dist.groups.map((products, moldIndex): MoldDistribution => {
        const result = dist.validationResult[moldIndex];
        if (!result) {
          throw new Error(`Missing validation result for mold ${moldIndex + 1}`);
        }
        return {
          moldId: moldIndex + 1,
          products,
          groupingResult: result
        };
      })
    }));

  // Sort solutions by number of molds (prefer fewer molds)
  solutions.sort((a, b) => a.totalMolds - b.totalMolds);

  return {
    solutions,
    totalSolutions: solutions.length,
    message: {
      general: `找到${solutions.length}种可行的模具分配方案`,
      details: solutions.map(s => 
        `方案${s.solutionId}：使用${s.totalMolds}个模具`)
    }
  };
}

function formatWeight(weight: number): string {
  return `${weight}g`;
}

function formatProducts(products: Product[]): string {
  return `[${products.map(p => formatWeight(p.weight)).join(', ')}]`;
}

export function formatDistributionResult(result: DistributionResult): string {
  let output = '\n=== 模具分配方案 ===\n';
  output += `${result.message.general}\n`;
  
  result.solutions.forEach(solution => {
    output += `\n方案 ${solution.solutionId}：使用 ${solution.totalMolds} 个模具\n`;
    
    solution.molds.forEach(mold => {
      output += `\n模具 ${mold.moldId}：\n`;
      output += `├─ 产品分布：${formatProducts(mold.products)}\n`;
      output += `├─ 体积利用率：${mold.groupingResult.message.volumeUtilization}\n`;
      output += '├─ 分组方案：\n';
      
      mold.groupingResult.solutions.forEach((groupSolution, index) => {
        const groups = groupSolution.groups.map(g => 
          `[${g.weights.map(w => formatWeight(w)).join(', ')}]`
        ).join(' / ');
        output += `│  方案${index + 1}：${groups}\n`;
        output += `│  └─ 最大重量差：${formatWeight(mold.groupingResult.weightDiff)}\n`;
      });
    });
    output += '\n────────────────\n';
  });
  
  return output;
}

// const mockProducts: Product[] = [
//   { id: 0, weight: 350, dimensions: { length: 100, width: 50, height: 30 } },
//   { id: 1, weight: 300, dimensions: { length: 150, width: 80, height: 30 } },
//   { id: 2, weight: 500, dimensions: { length: 200, width: 100, height: 30 } },
//   { id: 3, weight: 550, dimensions: { length: 200, width: 100, height: 30 } },
//   { id: 4, weight: 430, dimensions: { length: 250, width: 120, height: 30 } },
// ];

// const result = findOptimalDistribution(mockProducts);
// console.log(formatDistributionResult(result));
