import type { OptimizerConfig } from "@/lib/algorithms/optimizer";
import type {
  BaseOptimizerConfig,
  BaseTestCase,
  ThresholdConfig,
  ScoreConfigs,
} from "../../shared/types/base";
import type { FlatParams as BaseFlatParams } from "@/lib/quote-price/mold/layout/balance/generic-optimizer";

/**
 * 均匀性分布指标类型
 */
export enum UniformityMetric {
  GridVariance = "gridVariance", // 网格占用率方差
  DensityChange = "densityChange", // 密度变化率
  ClusterIndex = "clusterIndex", // 聚集度指数
}

/**
 * 均匀性分布输入类型
 */
export type UniformityInput = Record<UniformityMetric, number>;

/**
 * 均匀性分布优化器配置
 */
export interface UniformityConfig extends BaseOptimizerConfig {
  thresholds: {
    [UniformityMetric.GridVariance]: ThresholdConfig; // 网格占用率方差阈值配置
    [UniformityMetric.DensityChange]: ThresholdConfig; // 密度变化率阈值配置
    [UniformityMetric.ClusterIndex]: ThresholdConfig; // 聚集度指数阈值配置
  };
  weights: {
    [UniformityMetric.GridVariance]: number; // 网格占用率方差权重
    [UniformityMetric.DensityChange]: number; // 密度变化率权重
    [UniformityMetric.ClusterIndex]: number; // 聚集度指数权重
  };
  scores: {
    [UniformityMetric.GridVariance]: ScoreConfigs; // 网格占用率方差评分配置
    [UniformityMetric.DensityChange]: ScoreConfigs; // 密度变化率评分配置
    [UniformityMetric.ClusterIndex]: ScoreConfigs; // 聚集度指数评分配置
  };
}

/**
 * 均匀性分布测试用例类型
 */
export interface TestCase extends BaseTestCase {
  config: OptimizerConfig<BaseFlatParams>;
}
