import type { ParamMapping } from "@/lib/quote-price/mold/layout/balance/generic-optimizer";
import type { BaseMetric } from "../../shared/mapping";
import { MomentumMetric } from "../core/types";
import {
  createThresholdMappings,
  createWeightMappings,
  createScoreMappings,
  createBonusMappings,
  createPenaltyMappings,
} from "../../shared/mapping";

/**
 * Convert MomentumMetric to BaseMetric
 */
function getMetric(metric: MomentumMetric): BaseMetric {
  const paramPrefix = metric === MomentumMetric.Ratio ? "RATIO" : "RSD";

  return {
    type: metric,
    paramPrefix,
  };
}

/**
 * Create threshold mappings
 */
export function createMomentumThresholdMappings(
  metric: MomentumMetric,
): ParamMapping[] {
  return createThresholdMappings(getMetric(metric));
}

/**
 * Create weight mappings
 */
export function createMomentumWeightMappings(): ParamMapping[] {
  const metrics = Object.values(MomentumMetric).map(getMetric);
  return createWeightMappings(metrics);
}

/**
 * Create score mappings
 */
export function createMomentumScoreMappings(
  metric: MomentumMetric,
): ParamMapping[] {
  return createScoreMappings(getMetric(metric));
}

/**
 * Create bonus mappings
 */
export function createMomentumBonusMappings(): ParamMapping[] {
  const metrics = Object.values(MomentumMetric).map(getMetric);
  return createBonusMappings(metrics);
}

/**
 * Create penalty mappings
 */
export function createMomentumPenaltyMappings(): ParamMapping[] {
  const metrics = Object.values(MomentumMetric).map(getMetric);
  return createPenaltyMappings(metrics);
}
