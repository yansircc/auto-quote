import type { OptimizerScoringConfig } from "../types/core";

/**
 * Default genetic algorithm configuration
 */
export const DEFAULT_GENETIC_CONFIG = {
  populationSize: 200,
  maxGenerations: 500,
  mutationRate: 0.1,
  eliteRatio: 0.1,
  convergenceThreshold: 0.001,
} as const;

/**
 * Default optimizer scoring configuration
 */
export const DEFAULT_OPTIMIZER_CONFIG: OptimizerScoringConfig = {
  baseFitness: 100,
  maxBonus: 20,
  penaltyFactor: 2,
  maxAllowedDiff: 0.01,
};
