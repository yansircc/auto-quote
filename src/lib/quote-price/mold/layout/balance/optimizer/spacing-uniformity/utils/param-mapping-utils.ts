import type { ParamMapping } from "@/lib/quote-price/mold/layout/balance/generic-optimizer";
import { SpacingMetric } from "../core/types";

/**
 * 创建阈值映射
 */
export function createSpacingThresholdMappings(
  metric: SpacingMetric,
): ParamMapping[] {
  const prefix = metric === SpacingMetric.Distance ? "DISTANCE" : "DIRECTIONAL";
  return [
    {
      path: ["thresholds", metric, "perfect"],
      paramName: `${prefix}_PERFECT`,
    },
    {
      path: ["thresholds", metric, "good"],
      paramName: `${prefix}_GOOD`,
    },
    {
      path: ["thresholds", metric, "medium"],
      paramName: `${prefix}_MEDIUM`,
    },
    {
      path: ["thresholds", metric, "bad"],
      paramName: `${prefix}_BAD`,
    },
  ];
}

/**
 * 创建权重映射
 */
export function createSpacingWeightMappings(): ParamMapping[] {
  return [
    {
      path: ["weights", SpacingMetric.Distance],
      paramName: "WEIGHT_DISTANCE",
    },
    {
      path: ["weights", SpacingMetric.Directional],
      paramName: "WEIGHT_DIRECTIONAL",
    },
  ];
}

/**
 * 创建分数映射
 */
export function createSpacingScoreMappings(
  metric: SpacingMetric,
): ParamMapping[] {
  const prefix = metric === SpacingMetric.Distance ? "DISTANCE" : "DIRECTIONAL";
  return [
    {
      path: ["scores", metric, "perfect", "base"],
      paramName: `SCORE_${prefix}_PERFECT_BASE`,
    },
    {
      path: ["scores", metric, "perfect", "factor"],
      paramName: `SCORE_${prefix}_PERFECT_FACTOR`,
    },
    {
      path: ["scores", metric, "good", "base"],
      paramName: `SCORE_${prefix}_GOOD_BASE`,
    },
    {
      path: ["scores", metric, "good", "factor"],
      paramName: `SCORE_${prefix}_GOOD_FACTOR`,
    },
    {
      path: ["scores", metric, "medium", "base"],
      paramName: `SCORE_${prefix}_MEDIUM_BASE`,
    },
    {
      path: ["scores", metric, "medium", "factor"],
      paramName: `SCORE_${prefix}_MEDIUM_FACTOR`,
    },
    {
      path: ["scores", metric, "bad", "base"],
      paramName: `SCORE_${prefix}_BAD_BASE`,
    },
    {
      path: ["scores", metric, "bad", "factor"],
      paramName: `SCORE_${prefix}_BAD_FACTOR`,
    },
  ];
}

/**
 * 创建奖励映射
 */
export function createSpacingBonusMappings(): ParamMapping[] {
  return [
    {
      path: ["bonus", "perfect", "score"],
      paramName: "BONUS_PERFECT_SCORE",
    },
    {
      path: ["bonus", "excellent", "score"],
      paramName: "BONUS_EXCELLENT_SCORE",
    },
    {
      path: ["bonus", "good", "score"],
      paramName: "BONUS_GOOD_SCORE",
    },
  ];
}

/**
 * 创建惩罚映射
 */
export function createSpacingPenaltyMappings(): ParamMapping[] {
  return [
    {
      path: ["penalty", "bad", SpacingMetric.Distance, "threshold"],
      paramName: "PENALTY_BAD_DISTANCE_THRESHOLD",
    },
    {
      path: ["penalty", "bad", SpacingMetric.Distance, "score"],
      paramName: "PENALTY_BAD_DISTANCE_SCORE",
    },
    {
      path: ["penalty", "bad", SpacingMetric.Directional, "threshold"],
      paramName: "PENALTY_BAD_DIRECTIONAL_THRESHOLD",
    },
    {
      path: ["penalty", "bad", SpacingMetric.Directional, "score"],
      paramName: "PENALTY_BAD_DIRECTIONAL_SCORE",
    },
    {
      path: ["penalty", "combined", "score"],
      paramName: "PENALTY_COMBINED_SCORE",
    },
  ];
}
