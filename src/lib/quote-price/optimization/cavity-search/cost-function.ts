import type { Product } from "../../product/types";

/**
 * 计算模具成本
 * @param {Product[]} products 产品列表
 * @param {number[]} cavities 穴数列表
 * @returns {number} 模具成本
 */
export function calculateMoldCost(
  products: Product[],
  cavities: number[],
): number {
  // TODO:
  // 1. 通过布局算法得到最小模具体积
  // 2. 计算模具材料成本
  // 3. 计算供应商运维费
  // 4. 计算毛利
  // 5. 计算额外加工费
  return 0;
}

/**
 * 计算产品成本
 * @param {Product[]} products 产品列表
 * @param {number[]} cavities 穴数列表
 * @returns {number} 产品成本
 */
export function calculateProductCost(
  products: Product[],
  cavities: number[],
): number {
  // TODO:
  // 1. 计算材料成本
  // 2. 计算材料损耗
  // 3. 计算加工费用
  return 0;
}

/**
 * 计算总成本
 * @param {Product[]} products 产品列表
 * @param {number[]} cavities 穴数列表
 * @returns {number} 总成本
 */
export function calculateTotalCost(
  products: Product[],
  cavities: number[],
): number {
  // TODO:
  // 1. 计算模具成本
  // 2. 计算产品成本
  // 3. 返回总成本
  return 0;
}
