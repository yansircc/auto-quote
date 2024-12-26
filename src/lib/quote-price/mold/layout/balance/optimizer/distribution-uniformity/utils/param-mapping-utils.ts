import type { ParamMapping } from "@/lib/quote-price/mold/layout/balance/generic-optimizer";
import type { BaseMetric } from "../../shared/mapping";
import { UniformityMetric } from "../core/types";
import { PARAM_PREFIX } from "../../shared/constants";
import {
  createThresholdMappings,
  createWeightMappings,
  createScoreMappings,
  createBonusMappings,
  createPenaltyMappings,
} from "../../shared/mapping";

/**
 * Convert UniformityMetric to BaseMetric
 */
function getMetric(metric: UniformityMetric): BaseMetric {
  const metricToPrefix: Record<UniformityMetric, keyof typeof PARAM_PREFIX> = {
    [UniformityMetric.GridVariance]: "GRID_VARIANCE",
    [UniformityMetric.DensityChange]: "DENSITY_CHANGE",
    [UniformityMetric.ClusterIndex]: "CLUSTER_INDEX",
  } as const;

  return {
    type: metric,
    paramPrefix: PARAM_PREFIX[metricToPrefix[metric]],
  };
}

/**
 * Create threshold mappings
 */
export function createUniformityThresholdMappings(
  metric: UniformityMetric,
): ParamMapping[] {
  return createThresholdMappings(getMetric(metric));
}

/**
 * Create weight mappings
 */
export function createUniformityWeightMappings(): ParamMapping[] {
  const metrics = Object.values(UniformityMetric).map(getMetric);
  return createWeightMappings(metrics);
}

/**
 * Create score mappings
 */
export function createUniformityScoreMappings(
  metric: UniformityMetric,
): ParamMapping[] {
  return createScoreMappings(getMetric(metric));
}

/**
 * Create bonus mappings
 */
export function createUniformityBonusMappings(): ParamMapping[] {
  const metrics = Object.values(UniformityMetric).map(getMetric);
  return createBonusMappings(metrics);
}

/**
 * Create penalty mappings
 */
export function createUniformityPenaltyMappings(): ParamMapping[] {
  const metrics = Object.values(UniformityMetric).map(getMetric);
  return createPenaltyMappings(metrics);
}
