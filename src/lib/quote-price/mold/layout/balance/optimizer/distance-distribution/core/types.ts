import type { OptimizerConfig } from "@/lib/algorithms/optimizer";
import type {
  BaseOptimizerConfig,
  BaseTestCase,
  ThresholdConfig,
  ScoreConfigs,
} from "../../shared/types/base";
import type { FlatParams as GenericFlatParams } from "@/lib/quote-price/mold/layout/balance/generic-optimizer";

/**
 * 距离分布指标类型
 */
export enum DistributionMetric {
  CV = "cv", // 变异系数
  Range = "range", // 最大距离差异
}

/**
 * 距离分布输入类型
 */
export type DistributionInput = Record<DistributionMetric, number>;

/**
 * 距离分布优化器配置
 */
export interface DistributionConfig extends BaseOptimizerConfig {
  thresholds: {
    [DistributionMetric.CV]: ThresholdConfig; // 变异系数阈值配置
    [DistributionMetric.Range]: ThresholdConfig; // 最大距离差异阈值配置
  };
  weights: {
    [DistributionMetric.CV]: number; // 变异系数权重
    [DistributionMetric.Range]: number; // 最大距离差异权重
  };
  scores: {
    [DistributionMetric.CV]: ScoreConfigs; // 变异系数评分配置
    [DistributionMetric.Range]: ScoreConfigs; // 最大距离差异评分配置
  };
}

/**
 * 距离分布测试用例类型
 */
export interface TestCase extends BaseTestCase {
  config: OptimizerConfig<GenericFlatParams>;
}
