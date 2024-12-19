import type { Product } from "./types";

/**
 * 计算材料损耗费用
 * @param {number} productMaterialCost 总产品材料成本
 * @param {number} wasteRate 损耗系数(百分比)
 * @returns {number} 损耗费用
 */
export function calculateWasteCost(
  productMaterialCost: number,
  wasteRate: number,
): number {
  // TODO:
  // 1. 总损耗费用 = 总产品材料成本 × 损耗系数
  return 0;
}
