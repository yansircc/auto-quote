import type { SymmetryInput, SymmetryConfig } from "../core/types";
import { SymmetryMetric } from "../core/types";
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
 * 计算对称性评分
 */
export function calculateScore(input: SymmetryInput, config: SymmetryConfig) {
  const { [SymmetryMetric.Axial]: axial, [SymmetryMetric.Mass]: mass } = input;

  const scores: Record<SymmetryMetric | "bonus" | "penalty" | "total", number> =
    {
      [SymmetryMetric.Axial]: 0,
      [SymmetryMetric.Mass]: 0,
      bonus: 0,
      penalty: 0,
      total: 0,
    };

  // 处理特殊情况
  if (!Number.isFinite(axial) || !Number.isFinite(mass)) {
    return scores;
  }

  // 分段幂次配置
  const axialPowers: PowerConfig = {
    perfect: 2.5, // 2.5次幂，对轴向对称性更敏感
    good: 2.0, // 平方函数
    medium: 1.5, // 1.5次幂
    bad: 1.2, // 1.2次幂
  };

  const massPowers: PowerConfig = {
    perfect: 2.2, // 2.2次幂
    good: 1.8, // 1.8次幂
    medium: 1.5, // 1.5次幂
    bad: 1.2, // 1.2次幂
  };

  // 计算轴向对称性得分
  scores[SymmetryMetric.Axial] = calculateMetricScore(
    axial,
    config.thresholds[SymmetryMetric.Axial],
    config.scores[SymmetryMetric.Axial],
    axialPowers,
  );

  // 计算重心对称性得分
  scores[SymmetryMetric.Mass] = calculateMetricScore(
    mass,
    config.thresholds[SymmetryMetric.Mass],
    config.scores[SymmetryMetric.Mass],
    massPowers,
  );

  // 规范化得分
  scores[SymmetryMetric.Axial] = normalizeScore(scores[SymmetryMetric.Axial]);
  scores[SymmetryMetric.Mass] = normalizeScore(scores[SymmetryMetric.Mass]);

  // 计算组合奖励
  const bonusConfig: BonusConfig<SymmetryInput> = {
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
        [SymmetryMetric.Axial]: {
          threshold: config.penalty.bad[SymmetryMetric.Axial]?.threshold ?? 0,
          score: config.penalty.bad[SymmetryMetric.Axial]?.score ?? 0,
        },
        [SymmetryMetric.Mass]: {
          threshold: config.penalty.bad[SymmetryMetric.Mass]?.threshold ?? 0,
          score: config.penalty.bad[SymmetryMetric.Mass]?.score ?? 0,
        },
      },
      combined: config.penalty.combined,
    },
    penaltyConfig,
  );

  // 计算加权总分
  const baseScore = calculateWeightedScore(
    {
      [SymmetryMetric.Axial]: scores[SymmetryMetric.Axial],
      [SymmetryMetric.Mass]: scores[SymmetryMetric.Mass],
    },
    config.weights,
  );

  // 计算最终得分
  scores.total = baseScore + scores.bonus - scores.penalty;

  return scores;
}
