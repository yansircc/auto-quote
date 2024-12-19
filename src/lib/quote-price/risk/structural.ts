import type { Product } from "../product/types";
import type { RiskConfig } from "./types";

/**
 * 计算单边承压风险
 * @param {Product[]} products 产品列表
 * @param {number[]} cavities 穴数列表
 * @returns {number} 风险分数 (0-100)
 */
export function calculateUnilateralPressureRisk(
  products: Product[],
  cavities: number[],
): number {
  // TODO:
  // 1. 评估不均匀受力风险：
  //    - 部分型腔未使用时的不均匀受力
  return 0;
}

/**
 * 计算温度分布风险
 * @param {Product[]} products 产品列表
 * @returns {number} 风险分数 (0-100)
 */
export function calculateTemperatureDistributionRisk(
  products: Product[],
): number {
  // TODO:
  // 1. 评估温度不均匀风险：
  //    - 不同材料的加工温度差异
  return 0;
}

/**
 * 计算流道平衡风险
 * @param {Product[]} products 产品列表
 * @param {number[]} cavities 穴数列表
 * @returns {number} 风险分数 (0-100)
 */
export function calculateFlowBalanceRisk(
  products: Product[],
  cavities: number[],
): number {
  // TODO:
  // 1. 评估材料流动不均匀风险：
  //    - 材料流动不均匀
  return 0;
}
