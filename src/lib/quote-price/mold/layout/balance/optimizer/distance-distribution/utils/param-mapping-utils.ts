import type { ParamMapping } from "@/lib/quote-price/mold/layout/balance/generic-optimizer";
import type { BaseMetric } from "../../shared/mapping";
import { DistributionMetric } from "../core/types";
import {
  createThresholdMappings,
  createWeightMappings,
  createScoreMappings,
  createBonusMappings,
  createPenaltyMappings,
} from "../../shared/mapping";

/**
 * Convert DistributionMetric to BaseMetric
 */
function getMetric(metric: DistributionMetric): BaseMetric {
  const paramPrefix = metric === DistributionMetric.CV ? "CV" : "RANGE";

  return {
    type: metric,
    paramPrefix,
  };
}

/**
 * Create threshold mappings
 */
export function createDistributionThresholdMappings(
  metric: DistributionMetric,
): ParamMapping[] {
  return createThresholdMappings(getMetric(metric));
}

/**
 * Create weight mappings
 */
export function createDistributionWeightMappings(): ParamMapping[] {
  const metrics = Object.values(DistributionMetric).map(getMetric);
  return createWeightMappings(metrics);
}

/**
 * Create score mappings
 */
export function createDistributionScoreMappings(
  metric: DistributionMetric,
): ParamMapping[] {
  return createScoreMappings(getMetric(metric));
}

/**
 * Create bonus mappings
 */
export function createDistributionBonusMappings(): ParamMapping[] {
  const metrics = Object.values(DistributionMetric).map(getMetric);
  return createBonusMappings(metrics);
}

/**
 * Create penalty mappings
 */
export function createDistributionPenaltyMappings(): ParamMapping[] {
  const metrics = Object.values(DistributionMetric).map(getMetric);
  return createPenaltyMappings(metrics);
}
