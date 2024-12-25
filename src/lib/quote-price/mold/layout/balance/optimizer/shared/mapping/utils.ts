import type { ParamMapping } from "@/lib/quote-price/mold/layout/balance/generic-optimizer";
import type { BaseMetric } from "./types";
import type { ScoreLevel, BonusLevel } from "../constants";
import {
  createBaseScoreMappings,
  createBaseThresholdMappings,
  createBaseWeightMapping,
  createBaseBonusMapping,
  createBasePenaltyMappings,
} from "./types";

/**
 * Create threshold mappings for all score levels
 */
export function createThresholdMappings(metric: BaseMetric): ParamMapping[] {
  const levels: ScoreLevel[] = ["perfect", "good", "medium", "bad"];
  return levels.map((level) => createBaseThresholdMappings(metric, level));
}

/**
 * Create weight mappings for metrics
 */
export function createWeightMappings(metrics: BaseMetric[]): ParamMapping[] {
  return metrics.map((metric) => createBaseWeightMapping(metric));
}

/**
 * Create score mappings for all levels
 */
export function createScoreMappings(metric: BaseMetric): ParamMapping[] {
  const levels: ScoreLevel[] = ["perfect", "good", "medium", "bad"];
  return levels.flatMap((level) => createBaseScoreMappings(metric, level));
}

/**
 * Create bonus mappings for all levels
 */
export function createBonusMappings(metrics: BaseMetric[]): ParamMapping[] {
  const levels: BonusLevel[] = ["perfect", "excellent", "good"];

  const bonusMappings = levels.flatMap((level) => [
    ...metrics.map((metric) => createBaseBonusMapping(metric, level)),
    {
      path: ["bonus", level, "score"],
      paramName: `BONUS_${level.toUpperCase()}_SCORE`,
    },
  ]);

  return bonusMappings;
}

/**
 * Create penalty mappings
 */
export function createPenaltyMappings(metrics: BaseMetric[]): ParamMapping[] {
  const penaltyMappings = [
    ...metrics.flatMap((metric) => createBasePenaltyMappings(metric)),
    {
      path: ["penalty", "combined", "score"],
      paramName: "PENALTY_COMBINED_SCORE",
    },
  ];

  return penaltyMappings;
}
