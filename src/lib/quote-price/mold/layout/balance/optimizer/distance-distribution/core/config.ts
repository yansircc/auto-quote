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

// 变异系数阈值范围
const cvRanges = createThresholdRanges(
  { min: 0.0, max: 0.1 }, // 完美：极小偏离
  { min: 0.1, max: 0.3 }, // 良好：小幅偏离
  { min: 0.3, max: 0.5 }, // 中等：中等偏离
  { min: 0.5, max: 0.8 }, // 较差：大幅偏离
);

// 极差范围
const rangeRanges = createThresholdRanges(
  { min: 0.0, max: 0.2 }, // 完美：极小差异
  { min: 0.2, max: 0.4 }, // 良好：小幅差异
  { min: 0.4, max: 0.6 }, // 中等：中等差异
  { min: 0.6, max: 0.9 }, // 较差：大幅差异
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
  // 变异系数阈值
  CV_PERFECT: cvRanges.PERFECT,
  CV_GOOD: cvRanges.GOOD,
  CV_MEDIUM: cvRanges.MEDIUM,
  CV_BAD: cvRanges.BAD,

  // 极差阈值
  RANGE_PERFECT: rangeRanges.PERFECT,
  RANGE_GOOD: rangeRanges.GOOD,
  RANGE_MEDIUM: rangeRanges.MEDIUM,
  RANGE_BAD: rangeRanges.BAD,

  // 权重范围
  WEIGHT_CV: { min: 0.6, max: 0.6 }, // 变异系数权重更高
  WEIGHT_RANGE: { min: 0.4, max: 0.4 }, // 极差权重较低

  // 分数区间配置
  ...createScoreRanges("CV"),
  ...createScoreRanges("RANGE"),

  // 组合奖励配置
  ...bonusScoreRanges,

  // 惩罚参数配置
  PENALTY_BAD_CV_THRESHOLD: { min: 0.5, max: 0.8 }, // CV惩罚阈值
  PENALTY_BAD_CV_SCORE: { min: 5, max: 20 }, // CV惩罚分数
  PENALTY_BAD_RANGE_THRESHOLD: { min: 0.7, max: 0.9 }, // Range惩罚阈值
  PENALTY_BAD_RANGE_SCORE: { min: 5, max: 20 }, // Range惩罚分数
  PENALTY_COMBINED_SCORE: { min: 10, max: 30 }, // 组合惩罚分数
};

/**
 * 参数分组配置
 */
export const PARAM_GROUPS = [
  // 阈值组
  createOrderedThresholdGroup("变异系数阈值", "CV"),
  createOrderedThresholdGroup("极差阈值", "RANGE"),

  // 分数区间组
  createScoreGroup("分数区间 - 变异系数", "CV"),
  createScoreGroup("分数区间 - 极差", "RANGE"),

  // 奖励分数组
  createBonusScoreGroup(),

  // 奖励阈值组
  createBonusGroup(["BONUS_PERFECT_CV", "BONUS_EXCELLENT_CV", "BONUS_GOOD_CV"]),
  createBonusGroup([
    "BONUS_PERFECT_RANGE",
    "BONUS_EXCELLENT_RANGE",
    "BONUS_GOOD_RANGE",
  ]),
];

/**
 * 和约束组配置
 */
export const SUM_CONSTRAINED_GROUPS = [
  {
    targetSum: 1.0,
    params: ["WEIGHT_CV", "WEIGHT_RANGE"],
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
