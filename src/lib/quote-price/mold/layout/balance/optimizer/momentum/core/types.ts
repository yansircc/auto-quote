import type { OptimizerConfig } from "@/lib/algorithms/optimizer";
import type {
  BaseOptimizerConfig,
  BaseTestCase,
  ThresholdConfig,
  ScoreConfigs,
} from "../../shared/types/base";
import type { FlatParams as GenericFlatParams } from "@/lib/quote-price/mold/layout/balance/generic-optimizer";

/**
 * Momentum metric types
 */
export enum MomentumMetric {
  Ratio = "ratio", // Ratio metric
  RSD = "rsd", // RSD metric
}

/**
 * Momentum input type
 */
export type MomentumInput = Record<MomentumMetric, number>;

/**
 * Momentum optimizer configuration
 */
export interface MomentumConfig extends BaseOptimizerConfig {
  thresholds: {
    [MomentumMetric.Ratio]: ThresholdConfig; // Ratio threshold config
    [MomentumMetric.RSD]: ThresholdConfig; // RSD threshold config
  };
  weights: {
    [MomentumMetric.Ratio]: number; // Ratio weight
    [MomentumMetric.RSD]: number; // RSD weight
  };
  scores: {
    [MomentumMetric.Ratio]: ScoreConfigs; // Ratio score config
    [MomentumMetric.RSD]: ScoreConfigs; // RSD score config
  };
}

/**
 * Momentum test case type
 */
export interface TestCase extends BaseTestCase {
  config: OptimizerConfig<GenericFlatParams>;
}
