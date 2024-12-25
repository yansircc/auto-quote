import type { OptimizerConfig } from "@/lib/algorithms/optimizer";
import type { FlatParams as BaseFlatParams } from "@/lib/quote-price/mold/layout/balance/generic-optimizer";
import type { Range } from "../../shared/config";
import {
  createThresholdRanges,
  createScoreRanges,
  createBonusRanges,
  createOrderedThresholdGroup,
  createScoreGroup,
  createBonusGroup,
  createBonusScoreGroup,
} from "../../shared/config";

// 网格占用率方差阈值范围
const gridVarianceRanges = createThresholdRanges(
  { min: 0.0, max: 0.1 }, // 完美：极小偏离
  { min: 0.1, max: 0.3 }, // 良好：小幅偏离
  { min: 0.3, max: 0.5 }, // 中等：中等偏离
  { min: 0.5, max: 0.8 }, // 较差：大幅偏离
);

// 密度变化率阈值范围
const densityChangeRanges = createThresholdRanges(
  { min: 0.0, max: 0.2 }, // 完美：极小变化
  { min: 0.2, max: 0.4 }, // 良好：小幅变化
  { min: 0.4, max: 0.6 }, // 中等：中等变化
  { min: 0.6, max: 0.9 }, // 较差：大幅变化
);

// 聚集度指数阈值范围
const clusterIndexRanges = createThresholdRanges(
  { min: 0.0, max: 0.15 }, // 完美：极低聚集
  { min: 0.15, max: 0.35 }, // 良好：低聚集
  { min: 0.35, max: 0.55 }, // 中等：中等聚集
  { min: 0.55, max: 0.85 }, // 较差：高聚集
);

// 奖励范围
const bonusScoreRanges = createBonusRanges(
  { min: 1.0, max: 3.0 }, // 完美奖励
  { min: 1.0, max: 2.5 }, // 优秀奖励
  { min: 0.5, max: 2.0 }, // 良好奖励
);

/**
 * 参数优化范围配置
 */
export const PARAM_RANGES: Record<keyof BaseFlatParams, Range> = {
  // 网格占用率方差阈值
  GRID_VARIANCE_PERFECT: gridVarianceRanges.PERFECT,
  GRID_VARIANCE_GOOD: gridVarianceRanges.GOOD,
  GRID_VARIANCE_MEDIUM: gridVarianceRanges.MEDIUM,
  GRID_VARIANCE_BAD: gridVarianceRanges.BAD,

  // 密度变化率阈值
  DENSITY_CHANGE_PERFECT: densityChangeRanges.PERFECT,
  DENSITY_CHANGE_GOOD: densityChangeRanges.GOOD,
  DENSITY_CHANGE_MEDIUM: densityChangeRanges.MEDIUM,
  DENSITY_CHANGE_BAD: densityChangeRanges.BAD,

  // 聚集度指数阈值
  CLUSTER_INDEX_PERFECT: clusterIndexRanges.PERFECT,
  CLUSTER_INDEX_GOOD: clusterIndexRanges.GOOD,
  CLUSTER_INDEX_MEDIUM: clusterIndexRanges.MEDIUM,
  CLUSTER_INDEX_BAD: clusterIndexRanges.BAD,

  // 权重范围
  WEIGHT_GRID_VARIANCE: { min: 0.4, max: 0.4 }, // 网格方差权重：40%
  WEIGHT_DENSITY_CHANGE: { min: 0.3, max: 0.3 }, // 密度变化权重：30%
  WEIGHT_CLUSTER_INDEX: { min: 0.3, max: 0.3 }, // 聚集度权重：30%

  // 分数区间配置
  ...createScoreRanges("GRID_VARIANCE"),
  ...createScoreRanges("DENSITY_CHANGE"),
  ...createScoreRanges("CLUSTER_INDEX"),

  // 组合奖励配置
  ...bonusScoreRanges,

  // 惩罚参数配置
  PENALTY_BAD_GRID_VARIANCE_THRESHOLD: { min: 0.5, max: 0.8 }, // 网格方差惩罚阈值
  PENALTY_BAD_GRID_VARIANCE_SCORE: { min: 5, max: 20 }, // 网格方差惩罚分数
  PENALTY_BAD_DENSITY_CHANGE_THRESHOLD: { min: 0.6, max: 0.9 }, // 密度变化惩罚阈值
  PENALTY_BAD_DENSITY_CHANGE_SCORE: { min: 5, max: 20 }, // 密度变化惩罚分数
  PENALTY_BAD_CLUSTER_INDEX_THRESHOLD: { min: 0.55, max: 0.85 }, // 聚集度惩罚阈值
  PENALTY_BAD_CLUSTER_INDEX_SCORE: { min: 5, max: 20 }, // 聚集度惩罚分数
  PENALTY_COMBINED_SCORE: { min: 10, max: 30 }, // 组合惩罚分数
};

/**
 * 参数分组配置
 */
export const PARAM_GROUPS = [
  // 阈值组
  createOrderedThresholdGroup("网格占用率方差阈值", "GRID_VARIANCE"),
  createOrderedThresholdGroup("密度变化率阈值", "DENSITY_CHANGE"),
  createOrderedThresholdGroup("聚集度指数阈值", "CLUSTER_INDEX"),

  // 分数区间组
  createScoreGroup("分数区间 - 网格占用率方差", "GRID_VARIANCE"),
  createScoreGroup("分数区间 - 密度变化率", "DENSITY_CHANGE"),
  createScoreGroup("分数区间 - 聚集度指数", "CLUSTER_INDEX"),

  // 奖励分数组
  createBonusScoreGroup(),

  // 奖励阈值组
  createBonusGroup([
    "BONUS_PERFECT_GRID_VARIANCE",
    "BONUS_EXCELLENT_GRID_VARIANCE",
    "BONUS_GOOD_GRID_VARIANCE",
  ]),
  createBonusGroup([
    "BONUS_PERFECT_DENSITY_CHANGE",
    "BONUS_EXCELLENT_DENSITY_CHANGE",
    "BONUS_GOOD_DENSITY_CHANGE",
  ]),
  createBonusGroup([
    "BONUS_PERFECT_CLUSTER_INDEX",
    "BONUS_EXCELLENT_CLUSTER_INDEX",
    "BONUS_GOOD_CLUSTER_INDEX",
  ]),
];

/**
 * 和约束组配置
 */
export const SUM_CONSTRAINED_GROUPS = [
  {
    targetSum: 1.0,
    params: [
      "WEIGHT_GRID_VARIANCE",
      "WEIGHT_DENSITY_CHANGE",
      "WEIGHT_CLUSTER_INDEX",
    ],
    tolerance: 0.001,
  },
];

/**
 * 遗传算法配置
 */
export const GENETIC_CONFIG = {
  populationSize: 100,
  maxGenerations: 500,
  mutationRate: 0.1,
  eliteRatio: 0.1,
  convergenceThreshold: 1e-6,
};

/**
 * 优化器配置
 */
export const OPTIMIZER_CONFIG: OptimizerConfig<BaseFlatParams> = {
  ranges: PARAM_RANGES,
  orderedGroups: PARAM_GROUPS,
  sumConstraints: SUM_CONSTRAINED_GROUPS,
};
