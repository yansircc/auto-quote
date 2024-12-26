import type { OptimizerConfig } from "@/lib/algorithms/optimizer";
import type {
  BaseOptimizerConfig,
  BaseTestCase,
  ThresholdConfig,
  ScoreConfigs,
} from "../../shared/types/base";
import type { FlatParams as GenericFlatParams } from "@/lib/quote-price/mold/layout/balance/generic-optimizer";

/**
 * Ratio type enum
 */
export enum RatioType {
  LongestToShortest = "longestToShortest",
  MiddleToShortest = "middleToShortest",
  LongestToMiddle = "longestToMiddle",
}

/**
 * Ratio input type
 */
export type RatioInput = Record<RatioType, number>;

/**
 * Aspect ratio optimizer configuration
 */
export interface AspectRatioConfig extends BaseOptimizerConfig {
  thresholds: {
    [RatioType.LongestToShortest]: ThresholdConfig;
    [RatioType.MiddleToShortest]: ThresholdConfig;
    [RatioType.LongestToMiddle]: ThresholdConfig;
  };
  weights: {
    [RatioType.LongestToShortest]: number;
    [RatioType.MiddleToShortest]: number;
    [RatioType.LongestToMiddle]: number;
  };
  scores: {
    [RatioType.LongestToShortest]: ScoreConfigs;
    [RatioType.MiddleToShortest]: ScoreConfigs;
    [RatioType.LongestToMiddle]: ScoreConfigs;
  };
}

/**
 * Test case type for aspect ratio
 */
export interface TestCase extends BaseTestCase {
  config: OptimizerConfig<GenericFlatParams>;
}
