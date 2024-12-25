/**
 * Range type for parameter configuration
 */
export interface Range {
  min: number;
  max: number;
}

/**
 * Score level literals
 */
export type ScoreLevels = "PERFECT" | "GOOD" | "MEDIUM" | "BAD";

/**
 * Bonus level literals
 */
export type BonusLevels = "PERFECT" | "EXCELLENT" | "GOOD";

/**
 * Parameter group type
 */
export interface ParamGroup {
  name: string;
  params: string[];
}
