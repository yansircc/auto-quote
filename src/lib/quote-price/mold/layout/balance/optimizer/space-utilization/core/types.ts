import type { OptimizerConfig } from "@/lib/algorithms/optimizer";
import type {
  BaseOptimizerConfig,
  BaseTestCase,
  ThresholdConfig,
  ScoreConfigs,
} from "../../shared/types/base";
import type { FlatParams as GenericFlatParams } from "@/lib/quote-price/mold/layout/balance/generic-optimizer";

/**
 * 空间利用率指标类型
 */
export enum SpaceMetric {
  VolumeRatio = "volumeRatio", // 体积利用率 (总体积/包围盒体积)
  AspectRatio = "aspectRatio", // 长宽高比均衡度
}

/**
 * 空间利用率输入类型
 */
export type SpaceInput = Record<SpaceMetric, number>;

/**
 * 空间利用率优化器配置
 */
export interface SpaceConfig extends BaseOptimizerConfig {
  thresholds: {
    [SpaceMetric.VolumeRatio]: ThresholdConfig; // 体积利用率阈值配置
    [SpaceMetric.AspectRatio]: ThresholdConfig; // 长宽高比阈值配置
  };
  weights: {
    [SpaceMetric.VolumeRatio]: number; // 体积利用率权重
    [SpaceMetric.AspectRatio]: number; // 长宽高比权重
  };
  scores: {
    [SpaceMetric.VolumeRatio]: ScoreConfigs; // 体积利用率评分配置
    [SpaceMetric.AspectRatio]: ScoreConfigs; // 长宽高比评分配置
  };
}

/**
 * 空间利用率测试用例类型
 */
export interface TestCase extends BaseTestCase {
  config: OptimizerConfig<GenericFlatParams>;
}
