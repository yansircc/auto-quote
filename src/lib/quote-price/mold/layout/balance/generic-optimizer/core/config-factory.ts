import type { GeneticConfig, ParamRange } from "@/lib/algorithms/optimizer";
import type { OptimizerConfig } from "@/lib/algorithms/optimizer/core/types";
import type { OptimizerScoringConfig } from "../types/core";
import { DEFAULT_GENETIC_CONFIG, DEFAULT_OPTIMIZER_CONFIG } from "./config";

/**
 * Create optimizer scoring configuration
 * @param overrides Override default scoring configuration
 * @returns Optimizer scoring configuration
 */
export function createScoringConfig(
  overrides: Partial<OptimizerScoringConfig> = {},
): Record<string, unknown> & OptimizerScoringConfig {
  return {
    ...DEFAULT_OPTIMIZER_CONFIG,
    ...overrides,
  };
}

/**
 * Create parameter configuration
 * @param ranges Parameter range configuration
 * @param orderedGroups Ordered parameter groups
 */
function createParameterConfig<T extends Record<string, number>>(
  ranges: Record<keyof T, ParamRange>,
  orderedGroups: Array<{
    name: string;
    params: Array<keyof T>;
  }> = [],
): OptimizerConfig<T> {
  return {
    ranges,
    orderedGroups: orderedGroups.map((group) => ({
      name: group.name,
      params: group.params.map(String),
    })),
  };
}

/**
 * Create genetic algorithm configuration
 * @param ranges Parameter range configuration
 * @param orderedGroups Ordered parameter groups
 * @param fitnessFunction Fitness evaluation function
 */
export function createGeneticConfig<T extends Record<string, number>>(
  ranges: Record<keyof T, ParamRange>,
  orderedGroups: Array<{
    name: string;
    params: Array<keyof T>;
  }> = [],
  fitnessFunction: (params: T) => number = () => 0,
): GeneticConfig<T> {
  return {
    ...DEFAULT_GENETIC_CONFIG,
    parameterConfig: createParameterConfig(ranges, orderedGroups),
    fitnessFunction,
  };
}

/**
 * Create optimizer configuration
 * @param ranges Parameter range configuration
 * @param orderedGroups Ordered parameter groups
 * @param fitnessFunction Fitness evaluation function
 */
export function createOptimizerConfig<T extends Record<string, number>>(
  ranges: Record<keyof T, ParamRange>,
  orderedGroups: Array<{
    name: string;
    params: Array<keyof T>;
  }> = [],
  fitnessFunction: (params: T) => number = () => 0,
): GeneticConfig<T> {
  // Create optimizer parameter configuration
  const parameterConfig: OptimizerConfig<T> = createParameterConfig(
    ranges,
    orderedGroups,
  );

  // Create genetic algorithm configuration
  return {
    ...DEFAULT_GENETIC_CONFIG,
    parameterConfig,
    fitnessFunction,
  };
}
