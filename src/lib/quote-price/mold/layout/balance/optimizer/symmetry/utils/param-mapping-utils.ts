import type { ParamMapping } from "@/lib/quote-price/mold/layout/balance/generic-optimizer";
import type { BaseMetric } from "../../shared/mapping";
import { SymmetryMetric } from "../core/types";
import { PARAM_PREFIX } from "../../shared/constants";
import {
  createThresholdMappings,
  createWeightMappings,
  createScoreMappings,
  createBonusMappings,
  createPenaltyMappings,
} from "../../shared/mapping";

/**
 * Convert SymmetryMetric to BaseMetric
 */
function getMetric(metric: SymmetryMetric): BaseMetric {
  const paramPrefix =
    metric === SymmetryMetric.Axial ? PARAM_PREFIX.AXIAL : PARAM_PREFIX.MASS;

  return {
    type: metric,
    paramPrefix,
  };
}

/**
 * Create threshold mappings
 */
export function createSymmetryThresholdMappings(
  metric: SymmetryMetric,
): ParamMapping[] {
  return createThresholdMappings(getMetric(metric));
}

/**
 * Create weight mappings
 */
export function createSymmetryWeightMappings(): ParamMapping[] {
  const metrics = Object.values(SymmetryMetric).map(getMetric);
  return createWeightMappings(metrics);
}

/**
 * Create score mappings
 */
export function createSymmetryScoreMappings(
  metric: SymmetryMetric,
): ParamMapping[] {
  return createScoreMappings(getMetric(metric));
}

/**
 * Create bonus mappings
 */
export function createSymmetryBonusMappings(): ParamMapping[] {
  const metrics = Object.values(SymmetryMetric).map(getMetric);
  return createBonusMappings(metrics);
}

/**
 * Create penalty mappings
 */
export function createSymmetryPenaltyMappings(): ParamMapping[] {
  const metrics = Object.values(SymmetryMetric).map(getMetric);
  return createPenaltyMappings(metrics);
}
