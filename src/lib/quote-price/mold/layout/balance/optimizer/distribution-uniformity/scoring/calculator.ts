import type { UniformityConfig, UniformityInput } from "../core/types";
import { UniformityMetric } from "../core/types";
import {
  calculateMetricScore,
  calculateBonus,
  calculatePenalty,
  calculateWeightedScore,
  normalizeScore,
  type PowerConfig,
  type PenaltyCalcConfig,
  type BonusConfig,
} from "@/lib/quote-price/mold/layout/balance/generic-optimizer";

/**
 * 计算分布均匀性评分
 */
export function calculateScore(
  input: UniformityInput,
  config: UniformityConfig,
) {
  const {
    [UniformityMetric.GridVariance]: gridVariance,
    [UniformityMetric.DensityChange]: densityChange,
    [UniformityMetric.ClusterIndex]: clusterIndex,
  } = input;

  const scores: Record<
    UniformityMetric | "bonus" | "penalty" | "total",
    number
  > = {
    [UniformityMetric.GridVariance]: 0,
    [UniformityMetric.DensityChange]: 0,
    [UniformityMetric.ClusterIndex]: 0,
    bonus: 0,
    penalty: 0,
    total: 0,
  };

  // 处理特殊情况
  if (
    !Number.isFinite(gridVariance) ||
    !Number.isFinite(densityChange) ||
    !Number.isFinite(clusterIndex)
  ) {
    return scores;
  }

  // 分段幂次配置
  const gridVariancePowers: PowerConfig = {
    perfect: 2.5, // 2.5次幂，对网格方差更敏感
    good: 2.0, // 平方函数
    medium: 1.5, // 1.5次幂
    bad: 1.2, // 1.2次幂
  };

  const densityChangePowers: PowerConfig = {
    perfect: 2.2, // 2.2次幂，对密度变化较敏感
    good: 1.8, // 1.8次幂
    medium: 1.5, // 1.5次幂
    bad: 1.2, // 1.2次幂
  };

  const clusterIndexPowers: PowerConfig = {
    perfect: 2.3, // 2.3次幂，对聚集度较敏感
    good: 1.9, // 1.9次幂
    medium: 1.5, // 1.5次幂
    bad: 1.2, // 1.2次幂
  };

  // 计算各维度得分
  scores[UniformityMetric.GridVariance] = calculateMetricScore(
    gridVariance,
    config.thresholds[UniformityMetric.GridVariance],
    config.scores[UniformityMetric.GridVariance],
    gridVariancePowers,
    true, // 使用平滑衰减
  );

  scores[UniformityMetric.DensityChange] = calculateMetricScore(
    densityChange,
    config.thresholds[UniformityMetric.DensityChange],
    config.scores[UniformityMetric.DensityChange],
    densityChangePowers,
    true, // 使用平滑衰减
  );

  scores[UniformityMetric.ClusterIndex] = calculateMetricScore(
    clusterIndex,
    config.thresholds[UniformityMetric.ClusterIndex],
    config.scores[UniformityMetric.ClusterIndex],
    clusterIndexPowers,
    true, // 使用平滑衰减
  );

  // 规范化得分
  scores[UniformityMetric.GridVariance] = normalizeScore(
    scores[UniformityMetric.GridVariance],
  );
  scores[UniformityMetric.DensityChange] = normalizeScore(
    scores[UniformityMetric.DensityChange],
  );
  scores[UniformityMetric.ClusterIndex] = normalizeScore(
    scores[UniformityMetric.ClusterIndex],
  );

  // 计算组合奖励
  const bonusConfig: BonusConfig<UniformityInput> = {
    perfect: { ...input, score: config.bonus.perfect?.score ?? 0 },
    excellent: { ...input, score: config.bonus.excellent?.score ?? 0 },
    good: { ...input, score: config.bonus.good?.score ?? 0 },
  };
  scores.bonus = calculateBonus(input, bonusConfig);

  // 惩罚计算配置
  const penaltyConfig: PenaltyCalcConfig = {
    smoothFactor: 0.8, // 平滑因子（适中平滑度）
    scaleFactor: 0.8, // 缩放因子（适中惩罚强度）
    useSquareRoot: true, // 使用平方根
  };

  // 计算组合惩罚
  const penaltyBadConfig: Record<
    keyof UniformityInput,
    { threshold: number; score: number }
  > = {
    [UniformityMetric.GridVariance]: {
      threshold:
        config.penalty.bad[UniformityMetric.GridVariance]?.threshold ?? 0,
      score: config.penalty.bad[UniformityMetric.GridVariance]?.score ?? 0,
    },
    [UniformityMetric.DensityChange]: {
      threshold:
        config.penalty.bad[UniformityMetric.DensityChange]?.threshold ?? 0,
      score: config.penalty.bad[UniformityMetric.DensityChange]?.score ?? 0,
    },
    [UniformityMetric.ClusterIndex]: {
      threshold:
        config.penalty.bad[UniformityMetric.ClusterIndex]?.threshold ?? 0,
      score: config.penalty.bad[UniformityMetric.ClusterIndex]?.score ?? 0,
    },
  };

  scores.penalty = calculatePenalty(
    input,
    {
      bad: penaltyBadConfig,
      combined: config.penalty.combined,
    },
    penaltyConfig,
  );

  // 计算加权总分
  const baseScore = calculateWeightedScore(
    {
      [UniformityMetric.GridVariance]: scores[UniformityMetric.GridVariance],
      [UniformityMetric.DensityChange]: scores[UniformityMetric.DensityChange],
      [UniformityMetric.ClusterIndex]: scores[UniformityMetric.ClusterIndex],
    },
    config.weights,
  );

  // 计算最终得分（不再额外规范化）
  scores.total = baseScore + scores.bonus - scores.penalty;

  return scores;
}
