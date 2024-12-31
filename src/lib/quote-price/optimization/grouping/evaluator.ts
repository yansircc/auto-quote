/**
 * @description 产品分组评估器
 *
 * 本文件包含用于评估产品分组风险和成本的函数，主要用于：
 * 1. 计算产品组合的风险评分
 * 2. 评估产品组合的成本
 * 3. 检查产品组合的可行性
 *
 * 依赖：
 * - Product 类型：定义产品的基本属性
 * - RiskConfig 类型：定义风险配置规则
 * - CavityConfig 类型：定义穴数配置规则
 * - GroupingConfig 类型：定义分组配置规则
 *
 * 主要函数：
 * 1. evaluateGroupRisk: 计算产品组合的风险评分
 * 2. evaluateGroupCost: 评估产品组合的成本
 * 3. evaluateGroupFeasibility: 检查产品组合的可行性
 */

import { type RiskConfig, RiskLevel } from "../../risk/types";
import type { DetailedProductProps } from "../../core";
import type { CavityConfig, GroupingConfig } from "../types";
import { calculateRiskAssessment } from "../../risk";
import { checkGroupCompatibility } from "./compatibility";

/**
 * 评估产品组合的风险
 * @param {Product[]} products 产品列表
 * @param {number[]} cavities 穴数列表
 * @param {RiskConfig} riskConfig 风险配置
 * @param {GroupingConfig} groupingConfig 分组配置
 * @returns {{ score: number; level: RiskLevel }} 风险评分和等级
 */
export function evaluateGroupRisk(
  products: DetailedProductProps[],
  cavities: number[],
  riskConfig: RiskConfig,
): { score: number; level: RiskLevel } {
  // TODO:
  // 1. 使用 calculateRiskAssessment 计算风险
  // 2. 返回风险评分和等级

  if (!products.length || !cavities.length) {
    throw new Error("产品列表或穴数列表不能为空");
  }

  if (products.length !== cavities.length) {
    throw new Error("产品数量与穴数数量不匹配");
  }

  const riskAssessment = calculateRiskAssessment(
    products,
    cavities,
    riskConfig,
  );
  return {
    score: riskAssessment.score,
    level: riskAssessment.level,
  };
}

/**
 * 评估一组产品的成本
 * @param {Product[]} products 产品列表
 * @param {number[]} cavities 穴数列表
 * @param {{ score: number; level: RiskLevel }} risk 风险评估结果
 * @returns {number} 成本
 */
export function evaluateGroupCost(
  products: DetailedProductProps[],
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

  if (!products.length || !cavities.length) {
    throw new Error("产品列表或穴数列表不能为空");
  }

  // 计算基础成本
  const baseCost = products.reduce((total, product, index) => {
    return total + product?.shots * (cavities[index] ?? 0);
  }, 0);

  // 根据风险等级调整成本
  const riskMultipliers = {
    [RiskLevel.LOW]: 1,
    [RiskLevel.MEDIUM]: 1.1,
    [RiskLevel.HIGH]: 1.2,
    [RiskLevel.EXTREME]: 1.3,
  };
  if (!riskMultipliers[risk.level]) {
    throw new Error(`Invalid risk level: ${risk.level}`);
  }
  const cost = baseCost * riskMultipliers[risk.level];
  return Number(cost.toFixed(2));
}

/**
 * 评估一组产品的可行性
 * @param {Product[]} products 产品列表
 * @param {number[]} cavities 穴数列表
 * @param {GroupingConfig} config 分组配置
 * @returns {boolean} 是否可行
 */
export function evaluateGroupFeasibility(
  products: DetailedProductProps[],
  cavities: number[],
  cavityConfig: CavityConfig,
  groupingConfig: GroupingConfig,
): boolean {
  // TODO:
  // 1. 检查产品组合是否兼容
  // 2. 检查穴数比例
  // 3. 检查风险是否可接受

  if (!products.length || !cavities.length) {
    throw new Error("产品列表或穴数列表不能为空");
  }

  if (products.length !== cavities.length) {
    throw new Error("产品数量与穴数数量不匹配");
  }

  // 检查产品组合是否兼容
  if (!checkGroupCompatibility(products, groupingConfig)) {
    return false;
  }

  // 检查穴数比例
  const maxCavity = Math.max(...cavities);
  const minCavity = Math.min(...cavities);
  if (maxCavity / minCavity > cavityConfig.ratioConstraints.max) {
    return false;
  }

  const riskConfig: RiskConfig = {
    weights: {
      materialDifference: 1,
      colorTransition: 1,
      quantityRatio: 1,
      structure: 1,
    },
    thresholds: {
      low: 30,
      medium: 60,
      high: 80,
      extreme: 100,
    },
  };

  // 检查风险是否可接受
  const risk = evaluateGroupRisk(products, cavities, riskConfig);
  if (risk.level === RiskLevel.EXTREME) {
    return false;
  }

  return true;
}
