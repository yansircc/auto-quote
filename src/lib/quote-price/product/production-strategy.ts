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
  
  if (!products || products.length === 0) {
    throw new Error('产品列表不能为空');
  }

  const firstProduct = products[0];
  if (!firstProduct) {
    throw new Error('产品信息不能为空');
  }
  const hasDifferentColors = products.some(p => p.color !== firstProduct.color);
  const hasDifferentMaterials = products.some(p => p.material.name !== firstProduct.material.name);

  if (hasDifferentColors || hasDifferentMaterials) {
    return ProductionStrategy.SEQUENTIAL;
  }

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

  if (!group.products.length) {
    throw new Error('产品组不能为空');
  }

  if (!group.cavities || group.cavities.length !== group.products.length) {
    throw new Error('穴数信息不完整或不匹配');
  }

  const strategy = determineProductionStrategy(group.products);

  // 同时生产
  if (strategy === ProductionStrategy.SIMULTANEOUS) {
    return Math.max(...group.products.map((p, index) => 
      Math.ceil(p.quantity / (group.cavities[index] ?? 1))
    ));
  }

  // 分批生产
  return group.products.reduce((total, p, index) => 
    total + Math.ceil(p.quantity / (group.cavities[index] ?? 1)), 0
  );
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

  if (!products.length) {
    throw new Error('产品列表不能为空');
  }

  const uniqueColors = new Set(products.map(p => p.color));
  return uniqueColors.size - 1;
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

  if (!group.products.length) {
    throw new Error('产品组不能为空');
  }

  const strategy = determineProductionStrategy(group.products);

  // 同时生产
  if (strategy === ProductionStrategy.SIMULTANEOUS) {
    return [group.products];
  }

  // 按颜色分组
  const colorGroups = new Map<string, Product[]>();
  
  group.products.forEach(product => {
    const existingGroup = colorGroups.get(product.color) ?? [];
    colorGroups.set(product.color, [...existingGroup, product]);
  });

  // 转换为批次数组
  return Array.from(colorGroups.values());
}
