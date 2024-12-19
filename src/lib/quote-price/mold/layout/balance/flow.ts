import type { Product } from "../../../product/types";

/**
 * 计算流动平衡评分
 * @param {Product[]} products 产品列表
 * @param {number[]} cavities 每个产品的穴数
 * @param {[number, number]} layout 布局尺寸 [宽度, 深度]
 * @returns {number} 流动平衡评分 (0-100)
 */
export function calculateFlowBalance(
  products: Product[],
  cavities: number[],
  layout: [number, number],
): number {
  // TODO:
  // 1. 评估材料在模具中的流动路径
  // 2. 考虑浇口位置和流道设计
  // 3. 确保材料填充的均匀性
  return 0;
}
