import type { Range, ScoreLevels, BonusLevels } from "./types";

/**
 * Create threshold ranges for score levels
 */
export function createThresholdRanges(
  perfect: Range,
  good: Range,
  medium: Range,
  bad: Range,
): Record<ScoreLevels, Range> {
  return {
    PERFECT: perfect,
    GOOD: good,
    MEDIUM: medium,
    BAD: bad,
  };
}

/**
 * Create score ranges with base and factor for each level
 */
export function createScoreRanges(prefix: string): Record<string, Range> {
  return {
    [`SCORE_${prefix}_PERFECT_BASE`]: { min: 80, max: 100 },
    [`SCORE_${prefix}_PERFECT_FACTOR`]: { min: 1, max: 10 },
    [`SCORE_${prefix}_GOOD_BASE`]: { min: 60, max: 90 },
    [`SCORE_${prefix}_GOOD_FACTOR`]: { min: 1, max: 20 },
    [`SCORE_${prefix}_MEDIUM_BASE`]: { min: 40, max: 70 },
    [`SCORE_${prefix}_MEDIUM_FACTOR`]: { min: 1, max: 20 },
    [`SCORE_${prefix}_BAD_BASE`]: { min: 20, max: 50 },
    [`SCORE_${prefix}_BAD_FACTOR`]: { min: 1, max: 20 },
  };
}

/**
 * Create bonus score ranges for each bonus level
 */
export function createBonusRanges(
  perfect: Range,
  excellent: Range,
  good: Range,
): Record<`BONUS_${BonusLevels}_SCORE`, Range> {
  return {
    BONUS_PERFECT_SCORE: perfect,
    BONUS_EXCELLENT_SCORE: excellent,
    BONUS_GOOD_SCORE: good,
  };
}

/**
 * Create penalty ranges for combined score
 */
export function createPenaltyRanges(
  threshold: Range,
  score: Range,
): Record<"PENALTY_COMBINED_SCORE", Range> {
  return {
    PENALTY_COMBINED_SCORE: score,
  };
}
