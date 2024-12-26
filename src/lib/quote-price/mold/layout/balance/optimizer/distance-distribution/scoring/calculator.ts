import type { DistributionConfig, DistributionInput } from "../core/types";
import { DistributionMetric } from "../core/types";
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
 * 计算距离分布评分
 */
export function calculateScore(
  input: DistributionInput,
  config: DistributionConfig,
) {
  const { [DistributionMetric.CV]: cv, [DistributionMetric.Range]: range } =
    input;

  const scores: Record<
    DistributionMetric | "bonus" | "penalty" | "total",
    number
  > = {
    [DistributionMetric.CV]: 0,
    [DistributionMetric.Range]: 0,
    bonus: 0,
    penalty: 0,
    total: 0,
  };

  // 处理特殊情况
  if (!Number.isFinite(cv) || !Number.isFinite(range)) {
    return scores;
  }

  // 分段幂次配置
  const cvPowers: PowerConfig = {
    perfect: 2.5, // 2.5次幂，对变异系数更敏感
    good: 2.0, // 平方函数
    medium: 1.5, // 1.5次幂
    bad: 1.2, // 1.2次幂
  };

  const rangePowers: PowerConfig = {
    perfect: 2.2, // 2.2次幂，对极差较敏感
    good: 1.8, // 1.8次幂
    medium: 1.5, // 1.5次幂
    bad: 1.2, // 1.2次幂
  };

  // 计算各维度得分
  scores[DistributionMetric.CV] = calculateMetricScore(
    cv,
    config.thresholds[DistributionMetric.CV],
    config.scores[DistributionMetric.CV],
    cvPowers,
    true, // 使用平滑衰减
  );

  scores[DistributionMetric.Range] = calculateMetricScore(
    range,
    config.thresholds[DistributionMetric.Range],
    config.scores[DistributionMetric.Range],
    rangePowers,
    true, // 使用平滑衰减
  );

  // 规范化得分
  scores[DistributionMetric.CV] = normalizeScore(scores[DistributionMetric.CV]);
  scores[DistributionMetric.Range] = normalizeScore(
    scores[DistributionMetric.Range],
  );

  // 计算组合奖励
  const bonusConfig: BonusConfig<DistributionInput> = {
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
    keyof DistributionInput,
    { threshold: number; score: number }
  > = {
    [DistributionMetric.CV]: {
      threshold: config.penalty.bad[DistributionMetric.CV]?.threshold ?? 0,
      score: config.penalty.bad[DistributionMetric.CV]?.score ?? 0,
    },
    [DistributionMetric.Range]: {
      threshold: config.penalty.bad[DistributionMetric.Range]?.threshold ?? 0,
      score: config.penalty.bad[DistributionMetric.Range]?.score ?? 0,
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
      [DistributionMetric.CV]: scores[DistributionMetric.CV],
      [DistributionMetric.Range]: scores[DistributionMetric.Range],
    },
    config.weights,
  );

  // 计算最终得分（不再额外规范化）
  scores.total = baseScore + scores.bonus - scores.penalty;

  return scores;
}
