import type { OptimizerConfig } from "@/lib/algorithms/optimizer";
import type {
  BaseOptimizerConfig,
  BaseTestCase,
  ThresholdConfig,
  ScoreConfigs,
} from "../../shared/types/base";
import type { FlatParams as GenericFlatParams } from "@/lib/quote-price/mold/layout/balance/generic-optimizer";

/**
 * 位置分布指标类型
 */
export enum PositionMetric {
  Deviation = "deviation", // 偏离程度
  Height = "height", // 重心高度
}

/**
 * 位置分布输入类型
 */
export type PositionInput = Record<PositionMetric, number>;

/**
 * 位置分布优化器配置
 */
export interface PositionConfig extends BaseOptimizerConfig {
  thresholds: {
    [PositionMetric.Deviation]: ThresholdConfig; // 偏离程度阈值配置
    [PositionMetric.Height]: ThresholdConfig; // 重心高度阈值配置
  };
  weights: {
    [PositionMetric.Deviation]: number; // 偏离程度权重
    [PositionMetric.Height]: number; // 重心高度权重
  };
  scores: {
    [PositionMetric.Deviation]: ScoreConfigs; // 偏离程度评分配置
    [PositionMetric.Height]: ScoreConfigs; // 重心高度评分配置
  };
}

/**
 * 位置分布测试用例类型
 */
export interface TestCase extends BaseTestCase {
  config: OptimizerConfig<GenericFlatParams>;
}
