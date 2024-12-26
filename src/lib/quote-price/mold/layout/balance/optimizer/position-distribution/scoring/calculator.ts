import type { PositionInput, PositionConfig } from "../core/types";
import { PositionMetric } from "../core/types";
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
 * 计算位置分布评分
 */
export function calculateScore(input: PositionInput, config: PositionConfig) {
  const {
    [PositionMetric.Deviation]: deviation,
    [PositionMetric.Height]: height,
  } = input;

  const scores: Record<PositionMetric | "bonus" | "penalty" | "total", number> =
    {
      [PositionMetric.Deviation]: 0,
      [PositionMetric.Height]: 0,
      bonus: 0,
      penalty: 0,
      total: 0,
    };

  // 处理特殊情况
  if (!Number.isFinite(deviation) || !Number.isFinite(height)) {
    return scores;
  }

  // 分段幂次配置
  const deviationPowers: PowerConfig = {
    perfect: 2.5, // 2.5次幂，对偏离度更敏感
    good: 2.0, // 平方函数
    medium: 1.5, // 1.5次幂
    bad: 1.2, // 1.2次幂
  };

  const heightPowers: PowerConfig = {
    perfect: 2.2, // 2.2次幂，对高度较敏感
    good: 1.8, // 1.8次幂
    medium: 1.5, // 1.5次幂
    bad: 1.2, // 1.2次幂
  };

  // 计算各维度得分
  scores[PositionMetric.Deviation] = calculateMetricScore(
    deviation,
    config.thresholds[PositionMetric.Deviation],
    config.scores[PositionMetric.Deviation],
    deviationPowers,
    true, // 使用平滑衰减
  );

  scores[PositionMetric.Height] = calculateMetricScore(
    height,
    config.thresholds[PositionMetric.Height],
    config.scores[PositionMetric.Height],
    heightPowers,
    true, // 使用平滑衰减
  );

  // 规范化得分
  scores[PositionMetric.Deviation] = normalizeScore(
    scores[PositionMetric.Deviation],
  );
  scores[PositionMetric.Height] = normalizeScore(scores[PositionMetric.Height]);

  // 计算组合奖励
  const bonusConfig: BonusConfig<PositionInput> = {
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
    keyof PositionInput,
    { threshold: number; score: number }
  > = {
    [PositionMetric.Deviation]: {
      threshold: config.penalty.bad[PositionMetric.Deviation]?.threshold ?? 0,
      score: config.penalty.bad[PositionMetric.Deviation]?.score ?? 0,
    },
    [PositionMetric.Height]: {
      threshold: config.penalty.bad[PositionMetric.Height]?.threshold ?? 0,
      score: config.penalty.bad[PositionMetric.Height]?.score ?? 0,
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
      [PositionMetric.Deviation]: scores[PositionMetric.Deviation],
      [PositionMetric.Height]: scores[PositionMetric.Height],
    },
    config.weights,
  );

  // 计算最终得分
  scores.total = baseScore + scores.bonus - scores.penalty;

  return scores;
}
