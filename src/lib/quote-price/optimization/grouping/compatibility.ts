import type { Product } from "../../product/types";
import type { GroupingConfig } from "../types";

/**
 * 检查两个产品是否可以组合
 * @param {Product} product1 产品1
 * @param {Product} product2 产品2
 * @param {GroupingConfig} config 分组配置
 * @returns {boolean} 是否可以组合
 */
export function checkProductCompatibility(
  product1: Product,
  product2: Product,
  config: GroupingConfig,
): boolean {
  // TODO:
  // 1. 检查材料兼容性
  //    - 如果材料不同且未启用 allowDifferentMaterials，返回 false
  // 2. 检查颜色兼容性
  //    - 如果颜色不同且未启用 allowDifferentColors，返回 false
  return false;
}

/**
 * 检查一组产品是否可以组合
 * @param {Product[]} products 产品列表
 * @param {GroupingConfig} config 分组配置
 * @returns {boolean} 是否可以组合
 */
export function checkGroupCompatibility(
  products: Product[],
  config: GroupingConfig,
): boolean {
  // TODO:
  // 1. 检查每对产品是否兼容
  // 2. 考虑强制组合选项：
  //    - allowDifferentMaterials
  //    - allowDifferentColors
  return false;
}
