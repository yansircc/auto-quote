import type { OptimizerConfig } from "@/lib/algorithms/optimizer";
import type {
  BaseOptimizerConfig,
  BaseTestCase,
  ThresholdConfig,
  ScoreConfigs,
} from "../../shared/types/base";
import type { FlatParams as GenericFlatParams } from "@/lib/quote-price/mold/layout/balance/generic-optimizer";

/**
 * 对称性指标类型
 */
export enum SymmetryMetric {
  Axial = "axial", // 轴向对称性
  Mass = "mass", // 重心对称性
}

/**
 * 对称性输入类型
 */
export type SymmetryInput = Record<SymmetryMetric, number>;

/**
 * 对称性优化器配置
 */
export interface SymmetryConfig extends BaseOptimizerConfig {
  thresholds: {
    [SymmetryMetric.Axial]: ThresholdConfig; // 轴向对称性阈值配置
    [SymmetryMetric.Mass]: ThresholdConfig; // 重心对称性阈值配置
  };
  weights: {
    [SymmetryMetric.Axial]: number; // 轴向对称性权重
    [SymmetryMetric.Mass]: number; // 重心对称性权重
  };
  scores: {
    [SymmetryMetric.Axial]: ScoreConfigs; // 轴向对称性评分配置
    [SymmetryMetric.Mass]: ScoreConfigs; // 重心对称性评分配置
  };
}

/**
 * 对称性测试用例类型
 */
export interface TestCase extends BaseTestCase {
  config: OptimizerConfig<GenericFlatParams>;
}
