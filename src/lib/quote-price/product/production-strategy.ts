import type { Product } from "./types";
import type { ProductGroup } from "./types";
import { ProductionStrategy } from "./types";

/**
 * 确定产品组的生产策略
 * @param {Product[]} products 产品列表
 * @returns {ProductionStrategy} 生产策略
 */
export function determineProductionStrategy(
  products: Product[],
): ProductionStrategy {
  // TODO:
  // 1. 检查产品颜色是否相同
  // 2. 检查产品材料是否兼容
  // 3. 返回对应的生产策略：
  //    - SIMULTANEOUS: 可以同时生产
  //    - SEQUENTIAL: 需要分批生产
  return ProductionStrategy.SIMULTANEOUS;
}

/**
 * 计算生产模次
 * @param {ProductGroup} group 产品组
 * @returns {number} 总模次
 */
export function calculateProductionShots(group: ProductGroup): number {
  // TODO:
  // 1. 根据生产策略计算总模次：
  //    - 同时生产：由需求最高的产品决定
  //    - 分批生产：每个产品分别计算，然后求和
  // 2. 对每个产品：模次 = 向上取整(需求量 / 穴数)
  return 0;
}

/**
 * 计算换色次数
 * @param {Product[]} products 产品列表
 * @returns {number} 换色次数
 */
export function calculateColorChanges(products: Product[]): number {
  // TODO:
  // 1. 统计不同颜色的数量
  // 2. 换色次数 = 不同颜色数量 - 1
  return 0;
}

/**
 * 生成生产批次顺序
 * @param {ProductGroup} group 产品组
 * @returns {Product[][]} 生产批次列表
 */
export function generateProductionBatches(group: ProductGroup): Product[][] {
  // TODO:
  // 1. 根据生产策略生成批次：
  //    - 同时生产：一个批次包含所有产品
  //    - 分批生产：按颜色分组，每组一个批次
  // 2. 考虑换色顺序，尽量减少清洗次数
  return [];
}
