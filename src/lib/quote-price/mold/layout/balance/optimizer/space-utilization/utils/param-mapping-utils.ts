import type { ParamMapping } from "@/lib/quote-price/mold/layout/balance/generic-optimizer";
import type { BaseMetric } from "../../shared/mapping";
import { SpaceMetric } from "../core/types";
import { PARAM_PREFIX } from "../../shared/constants";
import {
  createThresholdMappings,
  createWeightMappings,
  createScoreMappings,
  createBonusMappings,
  createPenaltyMappings,
} from "../../shared/mapping";

/**
 * Convert SpaceMetric to BaseMetric
 */
function getMetric(metric: SpaceMetric): BaseMetric {
  const metricToPrefix: Record<SpaceMetric, keyof typeof PARAM_PREFIX> = {
    [SpaceMetric.VolumeRatio]: "VOLUME_RATIO",
    [SpaceMetric.AspectRatio]: "ASPECT_RATIO",
  } as const;

  return {
    type: metric,
    paramPrefix: PARAM_PREFIX[metricToPrefix[metric]],
  };
}

/**
 * Create threshold mappings
 */
export function createSpaceThresholdMappings(
  metric: SpaceMetric,
): ParamMapping[] {
  return createThresholdMappings(getMetric(metric));
}

/**
 * Create weight mappings
 */
export function createSpaceWeightMappings(): ParamMapping[] {
  const metrics = Object.values(SpaceMetric).map(getMetric);
  return createWeightMappings(metrics);
}

/**
 * Create score mappings
 */
export function createSpaceScoreMappings(metric: SpaceMetric): ParamMapping[] {
  return createScoreMappings(getMetric(metric));
}

/**
 * Create bonus mappings
 */
export function createSpaceBonusMappings(): ParamMapping[] {
  const metrics = Object.values(SpaceMetric).map(getMetric);
  return createBonusMappings(metrics);
}

/**
 * Create penalty mappings
 */
export function createSpacePenaltyMappings(): ParamMapping[] {
  const metrics = Object.values(SpaceMetric).map(getMetric);
  return createPenaltyMappings(metrics);
}
