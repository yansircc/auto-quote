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

// 轴向对称性阈值范围
const axialRanges = createThresholdRanges(
  { min: 0.0, max: 0.05 }, // 完美：极小偏差
  { min: 0.05, max: 0.1 }, // 良好：小幅偏差
  { min: 0.1, max: 0.2 }, // 中等：中等偏差
  { min: 0.2, max: 0.4 }, // 较差：大幅偏差
);

// 重心对称性阈值范围
const massRanges = createThresholdRanges(
  { min: 0.0, max: 0.03 }, // 完美：极小偏移
  { min: 0.03, max: 0.08 }, // 良好：小幅偏移
  { min: 0.08, max: 0.15 }, // 中等：中等偏移
  { min: 0.15, max: 0.3 }, // 较差：大幅偏移
);

// 奖励范围
const bonusScoreRanges = createBonusRanges(
  { min: 2.0, max: 4.0 }, // 完美奖励
  { min: 1.5, max: 3.0 }, // 优秀奖励
  { min: 1.0, max: 2.0 }, // 良好奖励
);

/**
 * 参数优化范围配置
 */
export const PARAM_RANGES: Record<keyof GenericFlatParams, Range> = {
  // 轴向对称性阈值
  AXIAL_PERFECT: axialRanges.PERFECT,
  AXIAL_GOOD: axialRanges.GOOD,
  AXIAL_MEDIUM: axialRanges.MEDIUM,
  AXIAL_BAD: axialRanges.BAD,

  // 重心对称性阈值
  MASS_PERFECT: massRanges.PERFECT,
  MASS_GOOD: massRanges.GOOD,
  MASS_MEDIUM: massRanges.MEDIUM,
  MASS_BAD: massRanges.BAD,

  // 权重范围
  WEIGHT_AXIAL: { min: 0.6, max: 0.6 }, // 轴向对称性权重：60%
  WEIGHT_MASS: { min: 0.4, max: 0.4 }, // 重心对称性权重：40%

  // 分数区间配置
  ...createScoreRanges("AXIAL"),
  ...createScoreRanges("MASS"),

  // 组合奖励配置
  ...bonusScoreRanges,

  // 惩罚参数配置
  PENALTY_BAD_AXIAL_THRESHOLD: { min: 0.25, max: 0.4 },
  PENALTY_BAD_AXIAL_SCORE: { min: 10, max: 25 },
  PENALTY_BAD_MASS_THRESHOLD: { min: 0.2, max: 0.3 },
  PENALTY_BAD_MASS_SCORE: { min: 10, max: 25 },
  PENALTY_COMBINED_SCORE: { min: 5, max: 15 },
};

/**
 * 参数分组配置
 */
export const PARAM_GROUPS = [
  // 阈值组
  createOrderedThresholdGroup("轴向对称性阈值", "AXIAL"),
  createOrderedThresholdGroup("重心对称性阈值", "MASS"),

  // 分数区间组
  createScoreGroup("分数区间 - 轴向对称性", "AXIAL"),
  createScoreGroup("分数区间 - 重心对称性", "MASS"),

  // 奖励分数组
  createBonusScoreGroup(),

  // 奖励阈值组
  createBonusGroup([
    "BONUS_PERFECT_AXIAL",
    "BONUS_EXCELLENT_AXIAL",
    "BONUS_GOOD_AXIAL",
  ]),
  createBonusGroup([
    "BONUS_PERFECT_MASS",
    "BONUS_EXCELLENT_MASS",
    "BONUS_GOOD_MASS",
  ]),
];

/**
 * 和约束组配置
 */
export const SUM_CONSTRAINED_GROUPS = [
  {
    targetSum: 1.0,
    params: ["WEIGHT_AXIAL", "WEIGHT_MASS"],
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
