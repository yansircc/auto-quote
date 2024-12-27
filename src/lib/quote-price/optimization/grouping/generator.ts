import type { Product } from "../../product/types";
import type { GroupingConfig, ProductGroup, CavityConfig } from "../types";
import { evaluateGroupRisk, evaluateGroupFeasibility } from "./evaluator";
import { checkProductCompatibility } from "./compatibility";
import { type RiskConfig } from "../../risk/types";

/**
 * 生成所有可能的产品分组
 * @param {Product[]} products 产品列表
 * @param {GroupingConfig} groupingConfig 分组配置
 * @param {CavityConfig} cavityConfig 穴数配置
 * @returns {ProductGroup[]} 分组列表
 */
export function generateAllGroups(
  products: Product[],
  groupingConfig: GroupingConfig,
  cavityConfig: CavityConfig,
): ProductGroup[] {
  // TODO:
  // 1. 根据强制组合选项生成可能的分组：
  //    - allowDifferentMaterials
  //    - allowDifferentColors
  // 2. 为每个分组：
  //    - 生成穴数方案
  //    - 计算风险评分
  //    - 确定风险等级

  if (!products.length) {
    throw new Error("产品列表不能为空");
  }

  const groups: ProductGroup[] = [];
  const maxGroupSize = products.length;

  // 生成所有可能的��合
  for (let size = 1; size <= maxGroupSize; size++) {
    generateCombinations(products, size).forEach(combination => {
      // 检查组合是否可行
      if (isValidCombination(combination, groupingConfig)) {
        // 生成穴数方案
        const cavities = generateCavityArrangement(combination, cavityConfig);
        if (cavities.length > 0) {
          // 计算风险评分
          const risk = evaluateGroupRisk(combination, cavities, getRiskConfig());
          
          // 创建分组
          groups.push({
            products: combination,
            cavities,
            riskScore: risk.score,
            riskLevel: risk.level,
          });
        }
      }
    });
  }

  return groups;
}

/**
 * 生成启发式分组
 * @param {Product[]} products 产品列表
 * @param {GroupingConfig} groupingConfig 分组配置
 * @param {CavityConfig} cavityConfig 穴数配置
 * @returns {ProductGroup[]} 分组列表
 */
export function generateHeuristicGroups(
  products: Product[],
  groupingConfig: GroupingConfig,
  cavityConfig: CavityConfig,
): ProductGroup[] {
  // TODO:
  // 1. 根据材料和颜色相似度分组
  // 2. 考虑强制组合选项
  // 3. 为每个分组：
  //    - 生成穴数方案
  //    - 计算风险评分
  //    - 确定风险等级

  if (!products.length) {
    throw new Error("产品列表不能为空");
  }

  const groups: ProductGroup[] = [];
  const unassignedProducts = [...products];

  while (unassignedProducts.length > 0) {
    const currentProduct = unassignedProducts[0];
    if (!currentProduct) {
      throw new Error("当前产品不能为空");
    }
    const compatibleProducts = findCompatibleProducts(
      currentProduct,
      unassignedProducts.slice(1),
      groupingConfig
    );

    // 创建新分组
    const groupProducts = [currentProduct, ...compatibleProducts].slice(
      0,
      cavityConfig.maxCombinations
    );

    // 生成穴数方案
    const cavities = generateCavityArrangement(groupProducts, cavityConfig);
    
    if (cavities.length > 0) {
      // 计算风险评分
      const risk = evaluateGroupRisk(groupProducts, cavities, getRiskConfig());

      // 添加分组
      groups.push({
        products: groupProducts,
        cavities,
        riskScore: risk.score,
        riskLevel: risk.level,
      });
    }

    // 从未分配列表中移除已分配的产品
    groupProducts.forEach(product => {
      const index = unassignedProducts.findIndex(p => p?.id === product?.id);
      if (index !== -1) {
        unassignedProducts.splice(index, 1);
      }
    });
  }

  return groups;
}

// 辅助函数

function generateCombinations<T>(items: T[], size: number): T[][] {
  if (size === 0) return [[]];
  if (items.length === 0) return [];

  const first = items[0];
  const rest = items.slice(1);
  
  // 确保 first 不为 undefined
  if (first === undefined) return [];
  
  const combsWithFirst = generateCombinations(rest, size - 1).map(comb => [first, ...comb]);
  const combsWithoutFirst = generateCombinations(rest, size);

  return [...combsWithFirst, ...combsWithoutFirst];
}

function isValidCombination(products: Product[], config: GroupingConfig): boolean {
  if (products.length < 2) return true;

  for (let i = 0; i < products.length - 1; i++) {
    for (let j = i + 1; j < products.length; j++) {
      const product1 = products[i];
      const product2 = products[j];
      if (!product1 || !product2 || !checkProductCompatibility(product1, product2, config)) {
        return false;
      }
    }
  }
  return true;
}

function generateCavityArrangement(products: Product[], config: CavityConfig): number[] {
  // 简单实现：每个产品分配最小穴数
  return products.map(() => config.ratioConstraints.min);
}

function findCompatibleProducts(
  target: Product,
  candidates: Product[],
  config: GroupingConfig
): Product[] {
  return candidates.filter(product => 
    checkProductCompatibility(target, product, config)
  );
}

function getRiskConfig(): RiskConfig {
  return {
    weights: {
      materialDifference: 1,
      colorTransition: 1,
      quantityRatio: 1,
      structure: 1,
    },
    thresholds: {
      low: 30,
      medium: 60,
      high: 80,
      extreme: 100,
    },
  };
}
