import type { ParamMapping } from "@/lib/quote-price/mold/layout/balance/generic-optimizer";
import type { BaseMetric } from "../../shared/mapping";
import { ShapeMetric } from "../core/types";
import { PARAM_PREFIX } from "../../shared/constants";
import {
  createThresholdMappings,
  createWeightMappings,
  createScoreMappings,
  createBonusMappings,
  createPenaltyMappings,
} from "../../shared/mapping";

/**
 * Convert ShapeMetric to BaseMetric
 */
function getMetric(metric: ShapeMetric): BaseMetric {
  const metricToPrefix: Record<ShapeMetric, keyof typeof PARAM_PREFIX> = {
    [ShapeMetric.DimensionDiff]: "DIMENSION_DIFF",
    [ShapeMetric.ExtremeIndex]: "EXTREME_INDEX",
    [ShapeMetric.SwapRatio]: "SWAP_RATIO",
  } as const;

  return {
    type: metric,
    paramPrefix: PARAM_PREFIX[metricToPrefix[metric]],
  };
}

/**
 * Create threshold mappings
 */
export function createShapeThresholdMappings(
  metric: ShapeMetric,
): ParamMapping[] {
  return createThresholdMappings(getMetric(metric));
}

/**
 * Create weight mappings
 */
export function createShapeWeightMappings(): ParamMapping[] {
  const metrics = Object.values(ShapeMetric).map(getMetric);
  return createWeightMappings(metrics);
}

/**
 * Create score mappings
 */
export function createShapeScoreMappings(metric: ShapeMetric): ParamMapping[] {
  return createScoreMappings(getMetric(metric));
}

/**
 * Create bonus mappings
 */
export function createShapeBonusMappings(): ParamMapping[] {
  const metrics = Object.values(ShapeMetric).map(getMetric);
  return createBonusMappings(metrics);
}

/**
 * Create penalty mappings
 */
export function createShapePenaltyMappings(): ParamMapping[] {
  const metrics = Object.values(ShapeMetric).map(getMetric);
  return createPenaltyMappings(metrics);
}
