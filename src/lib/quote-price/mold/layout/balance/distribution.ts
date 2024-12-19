import type { Product } from "../../../product/types";

/**
 * 计算分布平衡评分
 * @param {Product[]} products 产品列表
 * @param {number[]} cavities 每个产品的穴数
 * @param {[number, number]} layout 布局尺寸 [宽度, 深度]
 * @returns {number} 分布平衡评分 (0-100)
 */
export function calculateDistributionBalance(
  products: Product[],
  cavities: number[],
  layout: [number, number],
): number {
  // TODO:
  // 1. 评估产品在模具中的空间分布
  // 2. 考虑重心分布和力的平衡
  // 3. 确保模具开合时的稳定性
  return 0;
}
