import type { OptimizerConfig } from "@/lib/algorithms/optimizer";
import type {
  BaseOptimizerConfig,
  BaseTestCase,
  ThresholdConfig,
  ScoreConfigs,
} from "../../shared/types/base";
import type { FlatParams as GenericFlatParams } from "@/lib/quote-price/mold/layout/balance/generic-optimizer";

/**
 * 形状相似度指标类型
 */
export enum ShapeMetric {
  DimensionDiff = "dimensionDiff", // 维度差异
  ExtremeIndex = "extremeIndex", // 极端形状指数
  SwapRatio = "swapRatio", // 维度交换率
}

/**
 * 形状相似度输入类型
 */
export type ShapeInput = Record<ShapeMetric, number>;

/**
 * 形状相似度优化器配置
 */
export interface ShapeConfig extends BaseOptimizerConfig {
  thresholds: {
    [ShapeMetric.DimensionDiff]: ThresholdConfig; // 维度差异阈值配置
    [ShapeMetric.ExtremeIndex]: ThresholdConfig; // 极端形状指数阈值配置
    [ShapeMetric.SwapRatio]: ThresholdConfig; // 维度交换率阈值配置
  };
  weights: {
    [ShapeMetric.DimensionDiff]: number; // 维度差异权重
    [ShapeMetric.ExtremeIndex]: number; // 极端形状指数权重
    [ShapeMetric.SwapRatio]: number; // 维度交换率权重
  };
  scores: {
    [ShapeMetric.DimensionDiff]: ScoreConfigs; // 维度差异评分配置
    [ShapeMetric.ExtremeIndex]: ScoreConfigs; // 极端形状指数评分配置
    [ShapeMetric.SwapRatio]: ScoreConfigs; // 维度交换率评分配置
  };
}

/**
 * 形状相似度测试用例类型
 */
export interface TestCase extends BaseTestCase {
  config: OptimizerConfig<GenericFlatParams>;
}
