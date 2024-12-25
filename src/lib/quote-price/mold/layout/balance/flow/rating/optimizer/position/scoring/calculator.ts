import type { PositionInput, PositionConfig } from "../core/types";
import type { ScoreResult } from "@/lib/quote-price/mold/layout/balance/generic-optimizer";
import {
  calculateMetricScore,
  calculateBonus,
  calculatePenalty,
  calculateWeightedScore,
  normalizeScore,
} from "@/lib/quote-price/mold/layout/balance/generic-optimizer";

/**
 * 计算总分
 */
export function calculateScore(
  input: PositionInput,
  config: PositionConfig,
): ScoreResult {
  // 计算相对偏离度
  const relativeDeviation =
    input.layoutSize === 0 ? 0 : input.deviation / input.layoutSize;

  // 计算各指标得分
  const deviationScore = calculateMetricScore(
    relativeDeviation,
    config.thresholds.deviation,
    config.scores.deviation,
  );

  const heightScore = calculateMetricScore(
    input.height,
    config.thresholds.height,
    config.scores.height,
  );

  // 计算基础总分
  const baseTotal = calculateWeightedScore(
    { deviation: deviationScore, height: heightScore },
    config.weights,
  );

  // 计算奖励分数
  const bonus = calculateBonus(
    { deviation: relativeDeviation, height: input.height },
    config.bonus,
  );

  // 计算惩罚分数
  const penalty = calculatePenalty(
    { deviation: relativeDeviation, height: input.height },
    config.penalty,
  );

  // 计算最终得分
  const total = normalizeScore(baseTotal + bonus - penalty);

  // 返回分数明细
  return {
    total,
    deviationScore,
    heightScore,
    relativeDeviation,
    bonusScore: bonus,
    penaltyScore: penalty,
  };
}
