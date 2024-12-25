import type { ParamMapping } from "@/lib/quote-price/mold/layout/balance/generic-optimizer";
import type { ParamPrefix, ScoreLevel, BonusLevel } from "../constants";

/**
 * Base metric type interface
 */
export interface BaseMetric {
  readonly type: string;
  readonly paramPrefix: ParamPrefix;
}

/**
 * Create path-based parameter mapping
 */
export function createPathMapping(
  path: string[],
  paramName: string,
): ParamMapping {
  return { path, paramName };
}

/**
 * Create base score mappings
 */
export function createBaseScoreMappings(
  metric: BaseMetric,
  level: ScoreLevel,
): ParamMapping[] {
  return [
    {
      path: ["scores", metric.type, level, "base"],
      paramName: `SCORE_${metric.paramPrefix}_${level.toUpperCase()}_BASE`,
    },
    {
      path: ["scores", metric.type, level, "factor"],
      paramName: `SCORE_${metric.paramPrefix}_${level.toUpperCase()}_FACTOR`,
    },
  ];
}

/**
 * Create base threshold mappings
 */
export function createBaseThresholdMappings(
  metric: BaseMetric,
  level: ScoreLevel,
): ParamMapping {
  return {
    path: ["thresholds", metric.type, level],
    paramName: `${metric.paramPrefix}_${level.toUpperCase()}`,
  };
}

/**
 * Create base weight mapping
 */
export function createBaseWeightMapping(metric: BaseMetric): ParamMapping {
  return {
    path: ["weights", metric.type],
    paramName: `WEIGHT_${metric.paramPrefix}`,
  };
}

/**
 * Create base bonus mapping
 */
export function createBaseBonusMapping(
  metric: BaseMetric,
  level: BonusLevel,
): ParamMapping {
  return {
    path: ["bonus", level, metric.type],
    paramName: `BONUS_${level.toUpperCase()}_${metric.paramPrefix}`,
  };
}

/**
 * Create base penalty mappings
 */
export function createBasePenaltyMappings(metric: BaseMetric): ParamMapping[] {
  return [
    {
      path: ["penalty", "bad", metric.type, "threshold"],
      paramName: `PENALTY_BAD_${metric.paramPrefix}_THRESHOLD`,
    },
    {
      path: ["penalty", "bad", metric.type, "score"],
      paramName: `PENALTY_BAD_${metric.paramPrefix}_SCORE`,
    },
  ];
}
