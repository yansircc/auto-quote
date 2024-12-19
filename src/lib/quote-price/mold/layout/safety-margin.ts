import type { Product } from "../../product/types";

/**
 * 计算安全边距
 * @param {Product[]} products 产品列表
 * @returns {[number, number]} [边缘裕度, 高度裕度]
 */
export function calculateSafetyMargin(products: Product[]): [number, number] {
  // TODO:
  // 1. 根据产品尺寸计算需要的边缘裕度
  // 2. 根据产品高度计算需要的高度裕度
  // 3. 考虑产品的材料特性
  // 4. 考虑生产工艺要求
  return [0, 0];
}
