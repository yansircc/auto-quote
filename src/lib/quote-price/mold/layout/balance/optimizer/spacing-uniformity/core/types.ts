import type { OptimizerConfig } from "@/lib/algorithms/optimizer";
import type {
  BaseOptimizerConfig,
  BaseTestCase,
  ThresholdConfig,
  ScoreConfigs,
} from "../../shared/types/base";
import type { FlatParams as GenericFlatParams } from "@/lib/quote-price/mold/layout/balance/generic-optimizer";

/**
 * 间距均匀性指标类型
 */
export enum SpacingMetric {
  Distance = "distance", // 总体间距标准差
  Directional = "directional", // 方向一致性
}

/**
 * 间距均匀性输入类型
 */
export type SpacingInput = Record<SpacingMetric, number>;

/**
 * 间距均匀性优化器配置
 */
export interface SpacingConfig extends BaseOptimizerConfig {
  thresholds: {
    [SpacingMetric.Distance]: ThresholdConfig; // 总体间距阈值配置
    [SpacingMetric.Directional]: ThresholdConfig; // 方向一致性阈值配置
  };
  weights: {
    [SpacingMetric.Distance]: number; // 总体间距权重
    [SpacingMetric.Directional]: number; // 方向一致性权重
  };
  scores: {
    [SpacingMetric.Distance]: ScoreConfigs; // 总体间距评分配置
    [SpacingMetric.Directional]: ScoreConfigs; // 方向一致性评分配置
  };
}

/**
 * 间距均匀性测试用例类型
 */
export interface TestCase extends BaseTestCase {
  config: OptimizerConfig<GenericFlatParams>;
}
