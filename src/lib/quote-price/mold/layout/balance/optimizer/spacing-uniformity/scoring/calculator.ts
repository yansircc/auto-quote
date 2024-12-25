import type { SpacingInput, SpacingConfig } from "../core/types";
import { SpacingMetric } from "../core/types";
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
 * 计算间距均匀性评分
 */
export function calculateScore(input: SpacingInput, config: SpacingConfig) {
  const {
    [SpacingMetric.Distance]: distance,
    [SpacingMetric.Directional]: directional,
  } = input;

  const scores: Record<SpacingMetric | "bonus" | "penalty" | "total", number> =
    {
      [SpacingMetric.Distance]: 0,
      [SpacingMetric.Directional]: 0,
      bonus: 0,
      penalty: 0,
      total: 0,
    };

  // 处理特殊情况
  if (!Number.isFinite(distance) || !Number.isFinite(directional)) {
    return scores;
  }

  // 分段幂次配置
  const distancePowers: PowerConfig = {
    perfect: 2.2, // 2.2次幂，对总体间距较敏感
    good: 2.0, // 平方函数
    medium: 1.5, // 1.5次幂
    bad: 1.2, // 1.2次幂
  };

  const directionalPowers: PowerConfig = {
    perfect: 2.0, // 平方函数
    good: 1.8, // 1.8次幂
    medium: 1.5, // 1.5次幂
    bad: 1.2, // 1.2次幂
  };

  // 计算总体间距得分
  scores[SpacingMetric.Distance] = calculateMetricScore(
    distance,
    config.thresholds[SpacingMetric.Distance],
    config.scores[SpacingMetric.Distance],
    distancePowers,
  );

  // 计算方向一致性得分
  scores[SpacingMetric.Directional] = calculateMetricScore(
    directional,
    config.thresholds[SpacingMetric.Directional],
    config.scores[SpacingMetric.Directional],
    directionalPowers,
  );

  // 规范化得分
  scores[SpacingMetric.Distance] = normalizeScore(
    scores[SpacingMetric.Distance],
  );
  scores[SpacingMetric.Directional] = normalizeScore(
    scores[SpacingMetric.Directional],
  );

  // 计算组合奖励
  const bonusConfig: BonusConfig<SpacingInput> = {
    perfect: { ...input, score: config.bonus.perfect?.score ?? 0 },
    excellent: { ...input, score: config.bonus.excellent?.score ?? 0 },
    good: { ...input, score: config.bonus.good?.score ?? 0 },
  };
  scores.bonus = calculateBonus(input, bonusConfig);

  // 惩罚计算配置
  const penaltyConfig: PenaltyCalcConfig = {
    smoothFactor: 0.8, // 平滑因子（较为平滑）
    scaleFactor: 0.6, // 缩放因子（适中惩罚强度）
    useSquareRoot: true, // 使用平方根
  };

  // 计算组合惩罚
  scores.penalty = calculatePenalty(
    input,
    {
      bad: {
        [SpacingMetric.Distance]: {
          threshold: config.penalty.bad[SpacingMetric.Distance]?.threshold ?? 0,
          score: config.penalty.bad[SpacingMetric.Distance]?.score ?? 0,
        },
        [SpacingMetric.Directional]: {
          threshold:
            config.penalty.bad[SpacingMetric.Directional]?.threshold ?? 0,
          score: config.penalty.bad[SpacingMetric.Directional]?.score ?? 0,
        },
      },
      combined: config.penalty.combined,
    },
    penaltyConfig,
  );

  // 计算加权总分
  const baseScore = calculateWeightedScore(
    {
      [SpacingMetric.Distance]: scores[SpacingMetric.Distance],
      [SpacingMetric.Directional]: scores[SpacingMetric.Directional],
    },
    config.weights,
  );

  // 计算最终得分
  scores.total = baseScore + scores.bonus - scores.penalty;

  return scores;
}
