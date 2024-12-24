import type { DistanceInput, DistanceConfig } from "../core/types";
import {
  calculateMetricScore,
  calculateBonus,
  calculatePenalty,
  calculateWeightedScore,
  normalizeScore,
  type PowerConfig,
  type PenaltyCalcConfig,
} from "@/lib/quote-price/mold/layout/balance/generic-optimizer";

/**
 * 计算总分
 */
export function calculateScore(input: DistanceInput, config: DistanceConfig) {
  const { cv, range } = input;
  const scores = {
    cv: 0,
    range: 0,
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
    perfect: 2, // 平方函数
    good: 1.5, // 1.5次幂
    medium: 1.2, // 1.2次幂
    bad: 1, // 线性函数
  };

  const rangePowers: PowerConfig = {
    perfect: 2, // 平方函数
    good: 1.8, // 1.8次幂
    medium: 1.5, // 1.5次幂
    bad: 1.2, // 1.2次幂
  };

  // 计算各指标得分
  scores.cv = calculateMetricScore(
    cv,
    config.thresholds.cv,
    config.scores.cv,
    cvPowers,
    true, // 使用平滑衰减
  );

  scores.range = calculateMetricScore(
    range,
    config.thresholds.range,
    config.scores.range,
    rangePowers,
    true, // 使用平滑衰减
  );

  // 规范化得分
  scores.cv = normalizeScore(scores.cv);
  scores.range = normalizeScore(scores.range);

  // 计算组合奖励
  scores.bonus = calculateBonus({ cv, range }, config.bonus);

  // 惩罚计算配置
  const penaltyConfig: PenaltyCalcConfig = {
    smoothFactor: 0.8, // 平滑因子
    scaleFactor: 0.8, // 缩放因子
    useSquareRoot: true, // 使用平方根
  };

  // 计算组合惩罚
  scores.penalty = calculatePenalty(
    { cv, range },
    {
      bad: {
        cv: config.penalty.bad.cv,
        range: config.penalty.bad.range,
      },
      combined: config.penalty.combined,
    },
    penaltyConfig,
  );

  // 计算加权总分
  const baseScore = calculateWeightedScore(
    { cv: scores.cv, range: scores.range },
    config.weights,
  );

  // 计算最终得分（不再额外规范化）
  scores.total = baseScore + scores.bonus - scores.penalty;

  return scores;
}
