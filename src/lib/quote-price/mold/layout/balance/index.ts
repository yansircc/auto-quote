import type { Product } from "../../../product/types";
import { calculateGeometricBalance } from "./geometry/geometric-balance";
import { calculateDistributionBalance } from "./distribution";
import { calculateFlowBalance } from "./flow/flow-balance";

/**
 * 布局评分配置
 */
export interface BalanceConfig {
  // 各项评分的权重
  weights: {
    geometric: number; // 几何平衡权重
    distribution: number; // 分布平衡权重
    flow: number; // 流动平衡权重
  };
  // 最低分阈值
  minScore: number;
}

/**
 * 计算布局综合评分
 * @param {Product[]} products 产品列表
 * @param {number[]} cavities 每个产品的穴数
 * @param {[number, number]} layout 布局尺寸 [宽度, 深度]
 * @param {BalanceConfig} config 评分配置
 * @returns {number} 综合评分 (0-100)
 */
export function calculateLayoutScore(
  products: Product[],
  cavities: number[],
  layout: [number, number],
  config: BalanceConfig,
): number {
  const geometricBalance = calculateGeometricBalance(
    products,
    cavities,
    layout,
  );
  const distributionBalance = calculateDistributionBalance(
    products,
    cavities,
    layout,
  );
  const flowBalance = calculateFlowBalance(products, cavities, layout);

  const weightedScore =
    geometricBalance * config.weights.geometric +
    distributionBalance * config.weights.distribution +
    flowBalance * config.weights.flow;

  const totalScore = Math.min(100, Math.max(0, weightedScore));

  return totalScore >= config.minScore ? totalScore : 0;
}

export * from "./geometry/geometric-balance";
export * from "./distribution";
export * from "./flow/flow-balance";
