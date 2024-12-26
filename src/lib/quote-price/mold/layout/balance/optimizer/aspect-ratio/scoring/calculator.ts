import type { AspectRatioConfig, RatioInput } from "../core/types";
import { RatioType } from "../core/types";
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
 * 计算长宽比评分
 */
export function calculateScore(input: RatioInput, config: AspectRatioConfig) {
  const {
    [RatioType.LongestToShortest]: longestToShortest,
    [RatioType.MiddleToShortest]: middleToShortest,
    [RatioType.LongestToMiddle]: longestToMiddle,
  } = input;

  const scores: Record<RatioType | "bonus" | "penalty" | "total", number> = {
    [RatioType.LongestToShortest]: 0,
    [RatioType.MiddleToShortest]: 0,
    [RatioType.LongestToMiddle]: 0,
    bonus: 0,
    penalty: 0,
    total: 0,
  };

  // 处理特殊情况
  if (
    !Number.isFinite(longestToShortest) ||
    !Number.isFinite(middleToShortest) ||
    !Number.isFinite(longestToMiddle)
  ) {
    return scores;
  }

  // 分段幂次配置
  const longestToShortestPowers: PowerConfig = {
    perfect: 2.5, // 2.5次幂，对最大比例更敏感
    good: 2.0, // 平方函数
    medium: 1.5, // 1.5次幂
    bad: 1.2, // 1.2次幂
  };

  const middleToShortestPowers: PowerConfig = {
    perfect: 2.2, // 2.2次幂，中等敏感度
    good: 1.8, // 1.8次幂
    medium: 1.5, // 1.5次幂
    bad: 1.2, // 1.2次幂
  };

  const longestToMiddlePowers: PowerConfig = {
    perfect: 2.0, // 平方函数，较低敏感度
    good: 1.8, // 1.8次幂
    medium: 1.5, // 1.5次幂
    bad: 1.2, // 1.2次幂
  };

  // 计算各维度比例得分
  scores[RatioType.LongestToShortest] = calculateMetricScore(
    longestToShortest,
    config.thresholds[RatioType.LongestToShortest],
    config.scores[RatioType.LongestToShortest],
    longestToShortestPowers,
    true, // 使用平滑衰减
  );

  scores[RatioType.MiddleToShortest] = calculateMetricScore(
    middleToShortest,
    config.thresholds[RatioType.MiddleToShortest],
    config.scores[RatioType.MiddleToShortest],
    middleToShortestPowers,
    true, // 使用平滑衰减
  );

  scores[RatioType.LongestToMiddle] = calculateMetricScore(
    longestToMiddle,
    config.thresholds[RatioType.LongestToMiddle],
    config.scores[RatioType.LongestToMiddle],
    longestToMiddlePowers,
    true, // 使用平滑衰减
  );

  // 规范化得分
  scores[RatioType.LongestToShortest] = normalizeScore(
    scores[RatioType.LongestToShortest],
  );
  scores[RatioType.MiddleToShortest] = normalizeScore(
    scores[RatioType.MiddleToShortest],
  );
  scores[RatioType.LongestToMiddle] = normalizeScore(
    scores[RatioType.LongestToMiddle],
  );

  // 计算组合奖励
  const bonusConfig: BonusConfig<RatioInput> = {
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
    keyof RatioInput,
    { threshold: number; score: number }
  > = {
    [RatioType.LongestToShortest]: {
      threshold:
        config.penalty.bad[RatioType.LongestToShortest]?.threshold ?? 0,
      score: config.penalty.bad[RatioType.LongestToShortest]?.score ?? 0,
    },
    [RatioType.MiddleToShortest]: {
      threshold: config.penalty.bad[RatioType.MiddleToShortest]?.threshold ?? 0,
      score: config.penalty.bad[RatioType.MiddleToShortest]?.score ?? 0,
    },
    [RatioType.LongestToMiddle]: {
      threshold: config.penalty.bad[RatioType.LongestToMiddle]?.threshold ?? 0,
      score: config.penalty.bad[RatioType.LongestToMiddle]?.score ?? 0,
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
      [RatioType.LongestToShortest]: scores[RatioType.LongestToShortest],
      [RatioType.MiddleToShortest]: scores[RatioType.MiddleToShortest],
      [RatioType.LongestToMiddle]: scores[RatioType.LongestToMiddle],
    },
    config.weights,
  );

  // 计算最终得分（不再额外规范化）
  scores.total = baseScore + scores.bonus - scores.penalty;

  return scores;
}
