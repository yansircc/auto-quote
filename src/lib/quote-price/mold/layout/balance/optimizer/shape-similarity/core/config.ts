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

// 维度差异阈值范围
const dimensionDiffRanges = createThresholdRanges(
  { min: 0.0, max: 0.1 }, // 完美：极小差异
  { min: 0.1, max: 0.3 }, // 良好：小幅差异
  { min: 0.3, max: 0.5 }, // 中等：中等差异
  { min: 0.5, max: 0.8 }, // 较差：大幅差异
);

// 极端形状指数阈值范围
const extremeIndexRanges = createThresholdRanges(
  { min: 0.0, max: 0.15 }, // 完美：无极端形状
  { min: 0.15, max: 0.35 }, // 良好：轻微极端
  { min: 0.35, max: 0.55 }, // 中等：中等极端
  { min: 0.55, max: 0.85 }, // 较差：严重极端
);

// 维度交换率阈值范围
const swapRatioRanges = createThresholdRanges(
  { min: 0.0, max: 0.2 }, // 完美：极少交换
  { min: 0.2, max: 0.4 }, // 良好：较少交换
  { min: 0.4, max: 0.6 }, // 中等：频繁交换
  { min: 0.6, max: 0.9 }, // 较差：极频繁交换
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
  // 维度差异阈值
  DIMENSION_DIFF_PERFECT: dimensionDiffRanges.PERFECT,
  DIMENSION_DIFF_GOOD: dimensionDiffRanges.GOOD,
  DIMENSION_DIFF_MEDIUM: dimensionDiffRanges.MEDIUM,
  DIMENSION_DIFF_BAD: dimensionDiffRanges.BAD,

  // 极端形状指数阈值
  EXTREME_INDEX_PERFECT: extremeIndexRanges.PERFECT,
  EXTREME_INDEX_GOOD: extremeIndexRanges.GOOD,
  EXTREME_INDEX_MEDIUM: extremeIndexRanges.MEDIUM,
  EXTREME_INDEX_BAD: extremeIndexRanges.BAD,

  // 维度交换率阈值
  SWAP_RATIO_PERFECT: swapRatioRanges.PERFECT,
  SWAP_RATIO_GOOD: swapRatioRanges.GOOD,
  SWAP_RATIO_MEDIUM: swapRatioRanges.MEDIUM,
  SWAP_RATIO_BAD: swapRatioRanges.BAD,

  // 权重范围
  WEIGHT_DIMENSION_DIFF: { min: 0.4, max: 0.4 }, // 维度差异权重：40%
  WEIGHT_EXTREME_INDEX: { min: 0.35, max: 0.35 }, // 极端形状权重：35%
  WEIGHT_SWAP_RATIO: { min: 0.25, max: 0.25 }, // 交换率权重：25%

  // 分数区间配置
  ...createScoreRanges("DIMENSION_DIFF"),
  ...createScoreRanges("EXTREME_INDEX"),
  ...createScoreRanges("SWAP_RATIO"),

  // 组合奖励配置
  ...bonusScoreRanges,

  // 惩罚参数配置
  PENALTY_BAD_DIMENSION_DIFF_THRESHOLD: { min: 0.5, max: 0.8 }, // 维度差异惩罚阈值
  PENALTY_BAD_DIMENSION_DIFF_SCORE: { min: 5, max: 20 }, // 维度差异惩罚分数
  PENALTY_BAD_EXTREME_INDEX_THRESHOLD: { min: 0.55, max: 0.85 }, // 极端形状惩罚阈值
  PENALTY_BAD_EXTREME_INDEX_SCORE: { min: 5, max: 20 }, // 极端形状惩罚分数
  PENALTY_BAD_SWAP_RATIO_THRESHOLD: { min: 0.6, max: 0.9 }, // 维度交换惩罚阈值
  PENALTY_BAD_SWAP_RATIO_SCORE: { min: 5, max: 20 }, // 维度交换惩罚分数
  PENALTY_COMBINED_SCORE: { min: 10, max: 30 }, // 组合惩罚分数
};

/**
 * 参数分组配置
 */
export const PARAM_GROUPS = [
  // 阈值组
  createOrderedThresholdGroup("维度差异阈值", "DIMENSION_DIFF"),
  createOrderedThresholdGroup("极端形状指数阈值", "EXTREME_INDEX"),
  createOrderedThresholdGroup("维度交换率阈值", "SWAP_RATIO"),

  // 分数区间组
  createScoreGroup("分数区间 - 维度差异", "DIMENSION_DIFF"),
  createScoreGroup("分数区间 - 极端形状", "EXTREME_INDEX"),
  createScoreGroup("分数区间 - 维度交换", "SWAP_RATIO"),

  // 奖励分数组
  createBonusScoreGroup(),

  // 奖励阈值组
  createBonusGroup([
    "BONUS_PERFECT_DIMENSION_DIFF",
    "BONUS_EXCELLENT_DIMENSION_DIFF",
    "BONUS_GOOD_DIMENSION_DIFF",
  ]),
  createBonusGroup([
    "BONUS_PERFECT_EXTREME_INDEX",
    "BONUS_EXCELLENT_EXTREME_INDEX",
    "BONUS_GOOD_EXTREME_INDEX",
  ]),
  createBonusGroup([
    "BONUS_PERFECT_SWAP_RATIO",
    "BONUS_EXCELLENT_SWAP_RATIO",
    "BONUS_GOOD_SWAP_RATIO",
  ]),
];

/**
 * 和约束组配置
 */
export const SUM_CONSTRAINED_GROUPS = [
  {
    targetSum: 1.0,
    params: [
      "WEIGHT_DIMENSION_DIFF",
      "WEIGHT_EXTREME_INDEX",
      "WEIGHT_SWAP_RATIO",
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
export const OPTIMIZER_CONFIG: OptimizerConfig<GenericFlatParams> = {
  ranges: PARAM_RANGES,
  orderedGroups: PARAM_GROUPS,
  sumConstraints: SUM_CONSTRAINED_GROUPS,
};
