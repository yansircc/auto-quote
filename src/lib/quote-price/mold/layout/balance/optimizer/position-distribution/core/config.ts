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

// 偏离度阈值范围
const deviationRanges = createThresholdRanges(
  { min: 0.0, max: 0.1 }, // 完美：极小偏离
  { min: 0.1, max: 0.3 }, // 良好：小幅偏离
  { min: 0.3, max: 0.5 }, // 中等：中等偏离
  { min: 0.5, max: 0.8 }, // 较差：大幅偏离
);

// 高度阈值范围
const heightRanges = createThresholdRanges(
  { min: 0.0, max: 0.2 }, // 完美：极低重心
  { min: 0.2, max: 0.4 }, // 良好：较低重心
  { min: 0.4, max: 0.6 }, // 中等：中等重心
  { min: 0.6, max: 0.9 }, // 较差：高重心
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
  // 偏离度阈值
  DEVIATION_PERFECT: deviationRanges.PERFECT,
  DEVIATION_GOOD: deviationRanges.GOOD,
  DEVIATION_MEDIUM: deviationRanges.MEDIUM,
  DEVIATION_BAD: deviationRanges.BAD,

  // 高度阈值
  HEIGHT_PERFECT: heightRanges.PERFECT,
  HEIGHT_GOOD: heightRanges.GOOD,
  HEIGHT_MEDIUM: heightRanges.MEDIUM,
  HEIGHT_BAD: heightRanges.BAD,

  // 权重范围
  WEIGHT_DEVIATION: { min: 0.6, max: 0.6 }, // 偏离度权重更高
  WEIGHT_HEIGHT: { min: 0.4, max: 0.4 }, // 高度权重较低

  // 分数区间配置
  ...createScoreRanges("DEVIATION"),
  ...createScoreRanges("HEIGHT"),

  // 组合奖励配置
  ...bonusScoreRanges,

  // 惩罚参数配置
  PENALTY_BAD_DEVIATION_THRESHOLD: { min: 0.5, max: 0.8 }, // 偏离度惩罚阈值
  PENALTY_BAD_DEVIATION_SCORE: { min: 5, max: 20 }, // 偏离度惩罚分数
  PENALTY_BAD_HEIGHT_THRESHOLD: { min: 0.7, max: 0.9 }, // 高度惩罚阈值
  PENALTY_BAD_HEIGHT_SCORE: { min: 5, max: 20 }, // 高度惩罚分数
  PENALTY_COMBINED_SCORE: { min: 10, max: 30 }, // 组合惩罚分数
};

/**
 * 参数分组配置
 */
export const PARAM_GROUPS = [
  // 阈值组
  createOrderedThresholdGroup("偏离度阈值", "DEVIATION"),
  createOrderedThresholdGroup("高度阈值", "HEIGHT"),

  // 分数区间组
  createScoreGroup("分数区间 - 偏离度", "DEVIATION"),
  createScoreGroup("分数区间 - 高度", "HEIGHT"),

  // 奖励分数组
  createBonusScoreGroup(),

  // 奖励阈值组
  createBonusGroup([
    "BONUS_PERFECT_DEVIATION",
    "BONUS_EXCELLENT_DEVIATION",
    "BONUS_GOOD_DEVIATION",
  ]),
  createBonusGroup([
    "BONUS_PERFECT_HEIGHT",
    "BONUS_EXCELLENT_HEIGHT",
    "BONUS_GOOD_HEIGHT",
  ]),
];

/**
 * 和约束组配置
 */
export const SUM_CONSTRAINED_GROUPS = [
  {
    targetSum: 1.0,
    params: ["WEIGHT_DEVIATION", "WEIGHT_HEIGHT"],
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
