import type { OptimizerConfig } from "@/lib/algorithms/optimizer";

/**
 * Score level type
 */
export type ScoreLevel = "perfect" | "good" | "medium" | "bad";

/**
 * Bonus level type
 */
export type BonusLevel = "perfect" | "excellent" | "good";

/**
 * Score configuration type
 */
export interface ScoreConfig {
  base: number;
  factor: number;
}

/**
 * Score configurations for different levels
 */
export interface ScoreConfigs {
  perfect: ScoreConfig;
  good: ScoreConfig;
  medium: ScoreConfig;
  bad: ScoreConfig;
}

/**
 * Threshold configuration type
 */
export interface ThresholdConfig {
  perfect: number;
  good: number;
  medium: number;
  bad: number;
}

/**
 * Weight configuration type
 */
export type WeightConfig = Record<string, number>;

/**
 * Bonus configuration type
 */
export interface BonusConfig {
  perfect: Record<string, number>;
  excellent: Record<string, number>;
  good: Record<string, number>;
}

/**
 * Penalty configuration type
 */
export interface PenaltyConfig {
  bad: Record<
    string,
    {
      threshold: number;
      score: number;
    }
  >;
  combined: {
    score: number;
  };
}

/**
 * Base optimizer configuration type
 */
export interface BaseOptimizerConfig {
  thresholds: Record<string, ThresholdConfig>;
  weights: WeightConfig;
  scores: Record<string, ScoreConfigs>;
  bonus: BonusConfig;
  penalty: PenaltyConfig;
}

/**
 * Base flat parameters type
 */
export type BaseFlatParams = Record<string, number>;

/**
 * Score configuration for test cases
 */
export interface ConfigScores {
  base: number;
  factor: number;
}

/**
 * Base test case type
 */
export interface BaseTestCase {
  config: OptimizerConfig<BaseFlatParams>;
  expectedScores: ConfigScores;
}
