import type { ParamMapping } from "@/lib/quote-price/mold/layout/balance/generic-optimizer";
import type { BaseMetric } from "../../shared/mapping";
import { RatioType } from "../core/types";
import { PARAM_PREFIX } from "../../shared/constants";
import {
  createThresholdMappings,
  createWeightMappings,
  createScoreMappings,
  createBonusMappings,
  createPenaltyMappings,
} from "../../shared/mapping";

/**
 * Convert RatioType to BaseMetric
 */
function getMetric(metric: RatioType): BaseMetric {
  const paramPrefix =
    metric === RatioType.LongestToShortest
      ? PARAM_PREFIX.LONGEST_TO_SHORTEST
      : metric === RatioType.MiddleToShortest
        ? PARAM_PREFIX.MIDDLE_TO_SHORTEST
        : PARAM_PREFIX.LONGEST_TO_MIDDLE;

  return {
    type: metric,
    paramPrefix,
  };
}

/**
 * Create threshold mappings
 */
export function createRatioThresholdMappings(
  ratioType: RatioType,
): ParamMapping[] {
  return createThresholdMappings(getMetric(ratioType));
}

/**
 * Create weight mappings
 */
export function createRatioWeightMappings(): ParamMapping[] {
  const metrics = Object.values(RatioType).map(getMetric);
  return createWeightMappings(metrics);
}

/**
 * Create score mappings
 */
export function createRatioScoreMappings(ratioType: RatioType): ParamMapping[] {
  return createScoreMappings(getMetric(ratioType));
}

/**
 * Create bonus mappings
 */
export function createRatioBonusMappings(): ParamMapping[] {
  const metrics = Object.values(RatioType).map(getMetric);
  return createBonusMappings(metrics);
}

/**
 * Create penalty mappings
 */
export function createRatioPenaltyMappings(): ParamMapping[] {
  const metrics = Object.values(RatioType).map(getMetric);
  return createPenaltyMappings(metrics);
}
