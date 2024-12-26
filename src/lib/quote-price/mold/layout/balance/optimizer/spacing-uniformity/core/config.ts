import type { OptimizerConfig } from "@/lib/algorithms/optimizer";
import type { FlatParams as GenericFlatParams } from "@/lib/quote-price/mold/layout/balance/generic-optimizer";
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

// 总体间距标准差阈值范围
const distanceRanges = createThresholdRanges(
  { min: 0.0, max: 0.05 }, // 完美：极小标准差
  { min: 0.05, max: 0.1 }, // 良好：小幅波动
  { min: 0.1, max: 0.2 }, // 中等：中等波动
  { min: 0.2, max: 0.5 }, // 较差：大幅波动
);

// 方向一致性阈值范围
const directionalRanges = createThresholdRanges(
  { min: 0.0, max: 0.08 }, // 完美：方向高度一致
  { min: 0.08, max: 0.15 }, // 良好：方向基本一致
  { min: 0.15, max: 0.25 }, // 中等：方向轻微偏差
  { min: 0.25, max: 0.6 }, // 较差：方向显著偏差
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
export const PARAM_RANGES: Record<keyof GenericFlatParams, Range> = {
  // 总体间距阈值
  DISTANCE_PERFECT: distanceRanges.PERFECT,
  DISTANCE_GOOD: distanceRanges.GOOD,
  DISTANCE_MEDIUM: distanceRanges.MEDIUM,
  DISTANCE_BAD: distanceRanges.BAD,

  // 方向一致性阈值
  DIRECTIONAL_PERFECT: directionalRanges.PERFECT,
  DIRECTIONAL_GOOD: directionalRanges.GOOD,
  DIRECTIONAL_MEDIUM: directionalRanges.MEDIUM,
  DIRECTIONAL_BAD: directionalRanges.BAD,

  // 权重范围
  WEIGHT_DISTANCE: { min: 0.6, max: 0.6 }, // 总体间距权重：60%
  WEIGHT_DIRECTIONAL: { min: 0.4, max: 0.4 }, // 方向一致性权重：40%

  // 分数区间配置
  ...createScoreRanges("DISTANCE"),
  ...createScoreRanges("DIRECTIONAL"),

  // 组合奖励配置
  ...bonusScoreRanges,

  // 惩罚参数配置
  PENALTY_BAD_DISTANCE_THRESHOLD: { min: 0.3, max: 0.5 },
  PENALTY_BAD_DISTANCE_SCORE: { min: 5, max: 20 },
  PENALTY_BAD_DIRECTIONAL_THRESHOLD: { min: 0.4, max: 0.6 },
  PENALTY_BAD_DIRECTIONAL_SCORE: { min: 5, max: 20 },
  PENALTY_COMBINED_SCORE: { min: 10, max: 30 },
};

/**
 * 参数分组配置
 */
export const PARAM_GROUPS = [
  // 阈值组
  createOrderedThresholdGroup("总体间距阈值", "DISTANCE"),
  createOrderedThresholdGroup("方向一致性阈值", "DIRECTIONAL"),

  // 分数区间组
  createScoreGroup("分数区间 - 总体间距", "DISTANCE"),
  createScoreGroup("分数区间 - 方向一致性", "DIRECTIONAL"),

  // 奖励分数组
  createBonusScoreGroup(),

  // 奖励阈值组
  createBonusGroup([
    "BONUS_PERFECT_DISTANCE",
    "BONUS_EXCELLENT_DISTANCE",
    "BONUS_GOOD_DISTANCE",
  ]),
  createBonusGroup([
    "BONUS_PERFECT_DIRECTIONAL",
    "BONUS_EXCELLENT_DIRECTIONAL",
    "BONUS_GOOD_DIRECTIONAL",
  ]),
];

/**
 * 和约束组配置
 */
export const SUM_CONSTRAINED_GROUPS = [
  {
    targetSum: 1.0,
    params: ["WEIGHT_DISTANCE", "WEIGHT_DIRECTIONAL"],
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
export const OPTIMIZER_CONFIG: OptimizerConfig<GenericFlatParams> = {
  ranges: PARAM_RANGES,
  orderedGroups: PARAM_GROUPS,
  sumConstraints: SUM_CONSTRAINED_GROUPS,
};
