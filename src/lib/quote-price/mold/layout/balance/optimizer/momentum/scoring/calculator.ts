import type { MomentumConfig, MomentumInput } from "../core/types";
import { MomentumMetric } from "../core/types";
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
 * Calculate momentum score
 */
export function calculateScore(input: MomentumInput, config: MomentumConfig) {
  const { [MomentumMetric.Ratio]: ratio, [MomentumMetric.RSD]: rsd } = input;

  const scores: Record<MomentumMetric | "bonus" | "penalty" | "total", number> =
    {
      [MomentumMetric.Ratio]: 0,
      [MomentumMetric.RSD]: 0,
      bonus: 0,
      penalty: 0,
      total: 0,
    };

  // Handle special cases
  if (!Number.isFinite(ratio) || !Number.isFinite(rsd)) {
    return scores;
  }

  // Power configuration for segments
  const ratioPowers: PowerConfig = {
    perfect: 2.5, // 2.5 power, more sensitive to ratio
    good: 2.0, // Square function
    medium: 1.5, // 1.5 power
    bad: 1.2, // 1.2 power
  };

  const rsdPowers: PowerConfig = {
    perfect: 2.0, // Square function
    good: 1.8, // 1.8 power
    medium: 1.5, // 1.5 power
    bad: 1.2, // 1.2 power
  };

  // Calculate scores for each metric
  scores[MomentumMetric.Ratio] = calculateMetricScore(
    ratio,
    config.thresholds[MomentumMetric.Ratio],
    config.scores[MomentumMetric.Ratio],
    ratioPowers,
    true, // Use smooth decay
  );

  scores[MomentumMetric.RSD] = calculateMetricScore(
    rsd,
    config.thresholds[MomentumMetric.RSD],
    config.scores[MomentumMetric.RSD],
    rsdPowers,
    true, // Use smooth decay
  );

  // Normalize scores
  scores[MomentumMetric.Ratio] = normalizeScore(scores[MomentumMetric.Ratio]);
  scores[MomentumMetric.RSD] = normalizeScore(scores[MomentumMetric.RSD]);

  // Calculate combined bonus
  const bonusConfig: BonusConfig<MomentumInput> = {
    perfect: { ...input, score: config.bonus.perfect?.score ?? 0 },
    excellent: { ...input, score: config.bonus.excellent?.score ?? 0 },
    good: { ...input, score: config.bonus.good?.score ?? 0 },
  };
  scores.bonus = calculateBonus(input, bonusConfig);

  // Penalty calculation configuration
  const penaltyConfig: PenaltyCalcConfig = {
    smoothFactor: 0.7, // Smooth factor (smoother than distance optimizer)
    scaleFactor: 0.7, // Scale factor (reduced penalty intensity)
    useSquareRoot: true, // Use square root
  };

  // Calculate combined penalty
  const penaltyBadConfig: Record<
    keyof MomentumInput,
    { threshold: number; score: number }
  > = {
    [MomentumMetric.Ratio]: {
      threshold: config.penalty.bad[MomentumMetric.Ratio]?.threshold ?? 0,
      score: config.penalty.bad[MomentumMetric.Ratio]?.score ?? 0,
    },
    [MomentumMetric.RSD]: {
      threshold: config.penalty.bad[MomentumMetric.RSD]?.threshold ?? 0,
      score: config.penalty.bad[MomentumMetric.RSD]?.score ?? 0,
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

  // Calculate weighted total score
  const baseScore = calculateWeightedScore(
    {
      [MomentumMetric.Ratio]: scores[MomentumMetric.Ratio],
      [MomentumMetric.RSD]: scores[MomentumMetric.RSD],
    },
    config.weights,
  );

  // Calculate final score (no additional normalization)
  scores.total = baseScore + scores.bonus - scores.penalty;

  return scores;
}
