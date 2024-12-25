import type { OptimizerConfig } from "@/lib/algorithms/optimizer";
import type { FlatParams as GenericFlatParams } from "@/lib/quote-price/mold/layout/balance/generic-optimizer";
import type { Range } from "../../shared/config";
import {
  createThresholdRanges,
  createScoreRanges,
  createBonusRanges,
  createOrderedThresholdGroup,
  createScoreGroup,
  createBonusGroup,
  createBonusScoreGroup,
} from "../../shared/config";

// Ratio threshold ranges
const ratioRanges = createThresholdRanges(
  { min: 1.0, max: 1.1 }, // Perfect: minimal deviation
  { min: 1.1, max: 1.2 }, // Good: small deviation
  { min: 1.2, max: 1.4 }, // Medium: medium deviation
  { min: 1.4, max: 2.0 }, // Bad: large deviation
);

// RSD ranges
const rsdRanges = createThresholdRanges(
  { min: 0.0, max: 0.1 }, // Perfect: minimal difference
  { min: 0.1, max: 0.2 }, // Good: small difference
  { min: 0.2, max: 0.4 }, // Medium: medium difference
  { min: 0.4, max: 1.0 }, // Bad: large difference
);

// Bonus ranges
const bonusScoreRanges = createBonusRanges(
  { min: 1.0, max: 3.0 }, // Perfect bonus
  { min: 1.0, max: 2.5 }, // Excellent bonus
  { min: 0.5, max: 2.0 }, // Good bonus
);

/**
 * Parameter optimization range configuration
 */
export const PARAM_RANGES: Record<keyof GenericFlatParams, Range> = {
  // Ratio thresholds
  RATIO_PERFECT: ratioRanges.PERFECT,
  RATIO_GOOD: ratioRanges.GOOD,
  RATIO_MEDIUM: ratioRanges.MEDIUM,
  RATIO_BAD: ratioRanges.BAD,

  // RSD thresholds
  RSD_PERFECT: rsdRanges.PERFECT,
  RSD_GOOD: rsdRanges.GOOD,
  RSD_MEDIUM: rsdRanges.MEDIUM,
  RSD_BAD: rsdRanges.BAD,

  // Weight ranges
  WEIGHT_RATIO: { min: 0.6, max: 0.6 }, // Ratio weight higher
  WEIGHT_RSD: { min: 0.4, max: 0.4 }, // RSD weight lower

  // Score range configuration
  ...createScoreRanges("RATIO"),
  ...createScoreRanges("RSD"),

  // Combined bonus configuration
  ...bonusScoreRanges,

  // Penalty parameter configuration
  PENALTY_BAD_RATIO_THRESHOLD: { min: 1.5, max: 2.0 }, // Ratio penalty threshold
  PENALTY_BAD_RATIO_SCORE: { min: 5, max: 20 }, // Ratio penalty score
  PENALTY_BAD_RSD_THRESHOLD: { min: 0.5, max: 1.0 }, // RSD penalty threshold
  PENALTY_BAD_RSD_SCORE: { min: 5, max: 20 }, // RSD penalty score
  PENALTY_COMBINED_SCORE: { min: 2, max: 10 }, // Combined penalty score
};

/**
 * Parameter group configuration
 */
export const PARAM_GROUPS = [
  // Threshold groups
  createOrderedThresholdGroup("Ratio Thresholds", "RATIO"),
  createOrderedThresholdGroup("RSD Thresholds", "RSD"),

  // Score range groups
  createScoreGroup("Score Ranges - Ratio", "RATIO"),
  createScoreGroup("Score Ranges - RSD", "RSD"),

  // Bonus score groups
  createBonusScoreGroup(),

  // Bonus threshold groups
  createBonusGroup([
    "BONUS_PERFECT_RATIO",
    "BONUS_EXCELLENT_RATIO",
    "BONUS_GOOD_RATIO",
  ]),
  createBonusGroup([
    "BONUS_PERFECT_RSD",
    "BONUS_EXCELLENT_RSD",
    "BONUS_GOOD_RSD",
  ]),
];

/**
 * Sum constraint group configuration
 */
export const SUM_CONSTRAINED_GROUPS = [
  {
    targetSum: 1.0,
    params: ["WEIGHT_RATIO", "WEIGHT_RSD"],
    tolerance: 0.001,
  },
];

/**
 * Genetic algorithm configuration
 */
export const GENETIC_CONFIG = {
  populationSize: 100,
  maxGenerations: 500,
  mutationRate: 0.1,
  eliteRatio: 0.1,
  convergenceThreshold: 1e-6,
};

/**
 * Optimizer configuration
 */
export const OPTIMIZER_CONFIG: OptimizerConfig<GenericFlatParams> = {
  ranges: PARAM_RANGES,
  orderedGroups: PARAM_GROUPS,
  sumConstraints: SUM_CONSTRAINED_GROUPS,
};
