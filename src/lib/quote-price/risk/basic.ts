import type { Product } from "../product/types";
import type { RiskConfig } from "./types";

/**
 * 计算材料差异风险
 * @param {Product[]} products 产品列表
 * @returns {number} 风险分数 (0-100)
 */
export function calculateMaterialDifferenceRisk(products: Product[]): number {
  // TODO:
  // 1. 检查不同材料的：
  //    - 收缩率差异
  //    - 加工温度差异
  return 0;
}

/**
 * 计算颜色转换风险
 * @param {Product[]} products 产品列表
 * @returns {number} 风险分数 (0-100)
 */
export function calculateColorTransitionRisk(products: Product[]): number {
  // TODO:
  // 1. 评估颜色转换的难度：
  //    - 清洗不充分导致的污染风险
  return 0;
}

/**
 * 计算数量比例风险
 * @param {Product[]} products 产品列表
 * @param {number[]} cavities 穴数列表
 * @returns {number} 风险分数 (0-100)
 */
export function calculateQuantityRatioRisk(
  products: Product[],
  cavities: number[],
): number {
  // TODO:
  // 1. 评估生产不平衡风险：
  //    - 生产不平衡导致的模具磨损
  return 0;
}
