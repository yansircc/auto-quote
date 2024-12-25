/**
 * Parameter prefix constants
 */
export const PARAM_PREFIX = {
  // Aspect Ratio
  LONGEST_TO_SHORTEST: "LONGEST_TO_SHORTEST",
  MIDDLE_TO_SHORTEST: "MIDDLE_TO_SHORTEST",
  LONGEST_TO_MIDDLE: "LONGEST_TO_MIDDLE",

  // Distribution
  CV: "CV",
  RANGE: "RANGE",

  // Uniformity
  GRID_VARIANCE: "GRID_VARIANCE",
  DENSITY_CHANGE: "DENSITY_CHANGE",
  CLUSTER_INDEX: "CLUSTER_INDEX",

  // Momentum
  RATIO: "RATIO",
  RSD: "RSD",

  // Position
  DEVIATION: "DEVIATION",
  HEIGHT: "HEIGHT",

  // Shape Similarity
  DIMENSION_DIFF: "DIMENSION_DIFF",
  EXTREME_INDEX: "EXTREME_INDEX",
  SWAP_RATIO: "SWAP_RATIO",

  // Space Utilization
  VOLUME_RATIO: "VOLUME_RATIO",
  ASPECT_RATIO: "ASPECT_RATIO",

  // Spacing Uniformity
  DISTANCE: "DISTANCE",
  DIRECTIONAL: "DIRECTIONAL",

  // Symmetry
  AXIAL: "AXIAL",
  MASS: "MASS",
} as const;

/**
 * Score level constants
 */
export const SCORE_LEVEL = {
  PERFECT: "perfect",
  GOOD: "good",
  MEDIUM: "medium",
  BAD: "bad",
} as const;

/**
 * Bonus level constants
 */
export const BONUS_LEVEL = {
  PERFECT: "perfect",
  EXCELLENT: "excellent",
  GOOD: "good",
} as const;

export type ParamPrefix = (typeof PARAM_PREFIX)[keyof typeof PARAM_PREFIX];
export type ScoreLevel = (typeof SCORE_LEVEL)[keyof typeof SCORE_LEVEL];
export type BonusLevel = (typeof BONUS_LEVEL)[keyof typeof BONUS_LEVEL];
