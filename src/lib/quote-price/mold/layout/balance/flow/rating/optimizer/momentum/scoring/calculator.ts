// here
import type { MomentumInput, MomentumConfig } from "../core/types";
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
 * 计算动量评分
 */
export function calculateScore(input: MomentumInput, config: MomentumConfig) {
  const { ratio, rsd } = input;
  const scores = {
    ratio: 0,
    rsd: 0,
    bonus: 0,
    penalty: 0,
    total: 0,
  };

  // 处理特殊情况
  if (!Number.isFinite(ratio) || !Number.isFinite(rsd)) {
    return scores;
  }

  // 分段幂次配置
  const ratioPowers: PowerConfig = {
    perfect: 2.5, // 2.5次幂，对比率更敏感
    good: 2.0, // 平方函数
    medium: 1.5, // 1.5次幂
    bad: 1.2, // 1.2次幂
  };

  const rsdPowers: PowerConfig = {
    perfect: 2.0, // 平方函数
    good: 1.8, // 1.8次幂
    medium: 1.5, // 1.5次幂
    bad: 1.2, // 1.2次幂
  };

  // 计算各指标得分
  scores.ratio = calculateMetricScore(
    ratio,
    config.thresholds.ratio,
    config.scores.ratio,
    ratioPowers,
    true, // 使用平滑衰减
  );

  scores.rsd = calculateMetricScore(
    rsd,
    config.thresholds.rsd,
    config.scores.rsd,
    rsdPowers,
    true, // 使用平滑衰减
  );

  // 规范化得分
  scores.ratio = normalizeScore(scores.ratio);
  scores.rsd = normalizeScore(scores.rsd);

  // 计算组合奖励
  scores.bonus = calculateBonus({ ratio, rsd }, config.bonus);

  // 惩罚计算配置
  const penaltyConfig: PenaltyCalcConfig = {
    smoothFactor: 0.7, // 平滑因子（比距离优化器更平滑）
    scaleFactor: 0.7, // 缩放因子（减轻惩罚强度）
    useSquareRoot: true, // 使用平方根
  };

  // 计算组合惩罚
  scores.penalty = calculatePenalty(
    { ratio, rsd },
    {
      bad: {
        ratio: config.penalty.bad.ratio,
        rsd: config.penalty.bad.rsd,
      },
      combined: config.penalty.combined,
    },
    penaltyConfig,
  );

  // 计算加权总分
  const baseScore = calculateWeightedScore(
    { ratio: scores.ratio, rsd: scores.rsd },
    config.weights,
  );

  // 计算最终得分（不再额外规范化）
  scores.total = baseScore + scores.bonus - scores.penalty;

  return scores;
}
