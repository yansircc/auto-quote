import { RiskLevel } from "../../risk/types";
import type { Product } from "../../product/types";
import type { GroupingConfig } from "../types";
import { calculateRiskAssessment } from "../../risk";

/**
 * 评估产品组合的风险
 * @param {Product[]} products 产品列表
 * @param {number[]} cavities 穴数列表
 * @param {GroupingConfig} config 分组配置
 * @returns {{ score: number; level: RiskLevel }} 风险评分和等级
 */
export function evaluateGroupRisk(
  products: Product[],
  cavities: number[],
  config: GroupingConfig,
): { score: number; level: RiskLevel } {
  // TODO:
  // 1. 使用 calculateRiskAssessment 计算风险
  // 2. 返回风险评分和等级
  return { score: 0, level: RiskLevel.LOW };
}

/**
 * 评估一组产品的成本
 * @param {Product[]} products 产品列表
 * @param {number[]} cavities 穴数列表
 * @param {{ score: number; level: RiskLevel }} risk 风险评估结果
 * @returns {number} 成本
 */
export function evaluateGroupCost(
  products: Product[],
  cavities: number[],
  risk: { score: number; level: RiskLevel },
): number {
  // TODO:
  // 1. 计算基础成本
  // 2. 根据风险等级调整：
  //    - 低风险：无需调整
  //    - 中等风险：× (1 + 0.1)
  //    - 高风险：× (1 + 0.2)
  //    - 极高风险：× (1 + 0.3)
  return 0;
}

/**
 * 评估一组产品的可行性
 * @param {Product[]} products 产品列表
 * @param {number[]} cavities 穴数列表
 * @param {GroupingConfig} config 分组配置
 * @returns {boolean} 是否可行
 */
export function evaluateGroupFeasibility(
  products: Product[],
  cavities: number[],
  config: GroupingConfig,
): boolean {
  // TODO:
  // 1. 检查材料兼容性
  // 2. 检查颜色兼容性
  // 3. 检查穴数比例
  // 4. 检查风险是否可接受
  return false;
}
