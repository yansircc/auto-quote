import type { ShapeInput, ShapeConfig } from "../core/types";
import { ShapeMetric } from "../core/types";
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
 * 计算形状相似度评分
 */
export function calculateScore(input: ShapeInput, config: ShapeConfig) {
  const {
    [ShapeMetric.DimensionDiff]: dimensionDiff,
    [ShapeMetric.ExtremeIndex]: extremeIndex,
    [ShapeMetric.SwapRatio]: swapRatio,
  } = input;

  const scores: Record<ShapeMetric | "bonus" | "penalty" | "total", number> = {
    [ShapeMetric.DimensionDiff]: 0,
    [ShapeMetric.ExtremeIndex]: 0,
    [ShapeMetric.SwapRatio]: 0,
    bonus: 0,
    penalty: 0,
    total: 0,
  };

  // 处理特殊情况
  if (
    !Number.isFinite(dimensionDiff) ||
    !Number.isFinite(extremeIndex) ||
    !Number.isFinite(swapRatio)
  ) {
    return scores;
  }

  // 分段幂次配置
  const dimensionPowers: PowerConfig = {
    perfect: 2.5, // 2.5次幂，对维度差异更敏感
    good: 2.2, // 2.2次幂
    medium: 1.8, // 1.8次幂
    bad: 1.5, // 1.5次幂
  };

  const extremePowers: PowerConfig = {
    perfect: 2.2, // 2.2次幂，中等敏感度
    good: 2.0, // 平方函数
    medium: 1.6, // 1.6次幂
    bad: 1.4, // 1.4次幂
  };

  const swapPowers: PowerConfig = {
    perfect: 2.0, // 平方函数，较低敏感度
    good: 1.8, // 1.8次幂
    medium: 1.5, // 1.5次幂
    bad: 1.3, // 1.3次幂
  };

  // 计算各维度得分
  scores[ShapeMetric.DimensionDiff] = calculateMetricScore(
    dimensionDiff,
    config.thresholds[ShapeMetric.DimensionDiff],
    config.scores[ShapeMetric.DimensionDiff],
    dimensionPowers,
    true, // 使用平滑衰减
  );

  scores[ShapeMetric.ExtremeIndex] = calculateMetricScore(
    extremeIndex,
    config.thresholds[ShapeMetric.ExtremeIndex],
    config.scores[ShapeMetric.ExtremeIndex],
    extremePowers,
    true, // 使用平滑衰减
  );

  scores[ShapeMetric.SwapRatio] = calculateMetricScore(
    swapRatio,
    config.thresholds[ShapeMetric.SwapRatio],
    config.scores[ShapeMetric.SwapRatio],
    swapPowers,
    true, // 使用平滑衰减
  );

  // 规范化得分
  scores[ShapeMetric.DimensionDiff] = normalizeScore(
    scores[ShapeMetric.DimensionDiff],
  );
  scores[ShapeMetric.ExtremeIndex] = normalizeScore(
    scores[ShapeMetric.ExtremeIndex],
  );
  scores[ShapeMetric.SwapRatio] = normalizeScore(scores[ShapeMetric.SwapRatio]);

  // 计算组合奖励
  const bonusConfig: BonusConfig<ShapeInput> = {
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
    keyof ShapeInput,
    { threshold: number; score: number }
  > = {
    [ShapeMetric.DimensionDiff]: {
      threshold: config.penalty.bad[ShapeMetric.DimensionDiff]?.threshold ?? 0,
      score: config.penalty.bad[ShapeMetric.DimensionDiff]?.score ?? 0,
    },
    [ShapeMetric.ExtremeIndex]: {
      threshold: config.penalty.bad[ShapeMetric.ExtremeIndex]?.threshold ?? 0,
      score: config.penalty.bad[ShapeMetric.ExtremeIndex]?.score ?? 0,
    },
    [ShapeMetric.SwapRatio]: {
      threshold: config.penalty.bad[ShapeMetric.SwapRatio]?.threshold ?? 0,
      score: config.penalty.bad[ShapeMetric.SwapRatio]?.score ?? 0,
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
      [ShapeMetric.DimensionDiff]: scores[ShapeMetric.DimensionDiff],
      [ShapeMetric.ExtremeIndex]: scores[ShapeMetric.ExtremeIndex],
      [ShapeMetric.SwapRatio]: scores[ShapeMetric.SwapRatio],
    },
    config.weights,
  );

  // 计算最终得分
  scores.total = baseScore + scores.bonus - scores.penalty;

  return scores;
}
