import type { ParamMapping } from "@/lib/quote-price/mold/layout/balance/generic-optimizer";
import type { BaseMetric } from "../../shared/mapping";
import { PositionMetric } from "../core/types";
import {
  createThresholdMappings,
  createWeightMappings,
  createScoreMappings,
  createBonusMappings,
  createPenaltyMappings,
} from "../../shared/mapping";

/**
 * Convert PositionMetric to BaseMetric
 */
function getMetric(metric: PositionMetric): BaseMetric {
  const paramPrefix =
    metric === PositionMetric.Deviation ? "DEVIATION" : "HEIGHT";

  return {
    type: metric,
    paramPrefix,
  };
}

/**
 * Create threshold mappings
 */
export function createPositionThresholdMappings(
  metric: PositionMetric,
): ParamMapping[] {
  return createThresholdMappings(getMetric(metric));
}

/**
 * Create weight mappings
 */
export function createPositionWeightMappings(): ParamMapping[] {
  const metrics = Object.values(PositionMetric).map(getMetric);
  return createWeightMappings(metrics);
}

/**
 * Create score mappings
 */
export function createPositionScoreMappings(
  metric: PositionMetric,
): ParamMapping[] {
  return createScoreMappings(getMetric(metric));
}

/**
 * Create bonus mappings
 */
export function createPositionBonusMappings(): ParamMapping[] {
  const metrics = Object.values(PositionMetric).map(getMetric);
  return createBonusMappings(metrics);
}

/**
 * Create penalty mappings
 */
export function createPositionPenaltyMappings(): ParamMapping[] {
  const metrics = Object.values(PositionMetric).map(getMetric);
  return createPenaltyMappings(metrics);
}
