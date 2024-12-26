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

// 比例阈值范围
const longestShortestRanges = createThresholdRanges(
  { min: 1.0, max: 1.8 },
  { min: 1.8, max: 2.2 },
  { min: 2.2, max: 2.8 },
  { min: 2.8, max: 4.0 },
);

const middleShortestRanges = createThresholdRanges(
  { min: 1.0, max: 1.5 },
  { min: 1.5, max: 1.8 },
  { min: 1.8, max: 2.2 },
  { min: 2.2, max: 3.0 },
);

const longestMiddleRanges = createThresholdRanges(
  { min: 1.0, max: 1.3 },
  { min: 1.3, max: 1.6 },
  { min: 1.6, max: 2.0 },
  { min: 2.0, max: 2.5 },
);

// 奖励范围
const bonusScoreRanges = createBonusRanges(
  { min: 0.3, max: 4.0 },
  { min: 0.3, max: 3.5 },
  { min: 0.2, max: 3.0 },
);

/**
 * 参数优化范围配置
 */
export const PARAM_RANGES: Record<keyof GenericFlatParams, Range> = {
  // 最长边与最短边比例阈值
  LONGEST_TO_SHORTEST_PERFECT: longestShortestRanges.PERFECT,
  LONGEST_TO_SHORTEST_GOOD: longestShortestRanges.GOOD,
  LONGEST_TO_SHORTEST_MEDIUM: longestShortestRanges.MEDIUM,
  LONGEST_TO_SHORTEST_BAD: longestShortestRanges.BAD,

  // 中间边与最短边比例阈值
  MIDDLE_TO_SHORTEST_PERFECT: middleShortestRanges.PERFECT,
  MIDDLE_TO_SHORTEST_GOOD: middleShortestRanges.GOOD,
  MIDDLE_TO_SHORTEST_MEDIUM: middleShortestRanges.MEDIUM,
  MIDDLE_TO_SHORTEST_BAD: middleShortestRanges.BAD,

  // 最长边与中间边比例阈值
  LONGEST_TO_MIDDLE_PERFECT: longestMiddleRanges.PERFECT,
  LONGEST_TO_MIDDLE_GOOD: longestMiddleRanges.GOOD,
  LONGEST_TO_MIDDLE_MEDIUM: longestMiddleRanges.MEDIUM,
  LONGEST_TO_MIDDLE_BAD: longestMiddleRanges.BAD,

  // 权重范围
  WEIGHT_LONGEST_TO_SHORTEST: { min: 0.4, max: 0.4 },
  WEIGHT_MIDDLE_TO_SHORTEST: { min: 0.3, max: 0.3 },
  WEIGHT_LONGEST_TO_MIDDLE: { min: 0.3, max: 0.3 },

  // 分数区间配置
  ...createScoreRanges("LONGEST_TO_SHORTEST"),
  ...createScoreRanges("MIDDLE_TO_SHORTEST"),
  ...createScoreRanges("LONGEST_TO_MIDDLE"),

  // 组合奖励配置
  ...bonusScoreRanges,

  // 惩罚参数配置
  PENALTY_BAD_LONGEST_TO_SHORTEST_THRESHOLD: { min: 2.8, max: 4.0 },
  PENALTY_BAD_LONGEST_TO_SHORTEST_SCORE: { min: 2, max: 12 },
  PENALTY_BAD_MIDDLE_TO_SHORTEST_THRESHOLD: { min: 2.2, max: 3.5 },
  PENALTY_BAD_MIDDLE_TO_SHORTEST_SCORE: { min: 2, max: 12 },
  PENALTY_BAD_LONGEST_TO_MIDDLE_THRESHOLD: { min: 2.0, max: 3.0 },
  PENALTY_BAD_LONGEST_TO_MIDDLE_SCORE: { min: 2, max: 12 },
  PENALTY_COMBINED_SCORE: { min: 3, max: 15 },
};

/**
 * 参数分组配置
 */
export const PARAM_GROUPS = [
  // 阈值组
  createOrderedThresholdGroup("最长边与最短边比例阈值", "LONGEST_TO_SHORTEST"),
  createOrderedThresholdGroup("中间边与最短边比例阈值", "MIDDLE_TO_SHORTEST"),
  createOrderedThresholdGroup("最长边与中间边比例阈值", "LONGEST_TO_MIDDLE"),

  // 分数区间组
  createScoreGroup("分数区间 - 最长边与最短边", "LONGEST_TO_SHORTEST"),
  createScoreGroup("分数区间 - 中间边与最短边", "MIDDLE_TO_SHORTEST"),
  createScoreGroup("分数区间 - 最长边与中间边", "LONGEST_TO_MIDDLE"),

  // 奖励分数组
  createBonusScoreGroup(),

  // 奖励阈值组
  createBonusGroup([
    "BONUS_PERFECT_LONGEST_TO_SHORTEST",
    "BONUS_EXCELLENT_LONGEST_TO_SHORTEST",
    "BONUS_GOOD_LONGEST_TO_SHORTEST",
  ]),
  createBonusGroup([
    "BONUS_PERFECT_MIDDLE_TO_SHORTEST",
    "BONUS_EXCELLENT_MIDDLE_TO_SHORTEST",
    "BONUS_GOOD_MIDDLE_TO_SHORTEST",
  ]),
  createBonusGroup([
    "BONUS_PERFECT_LONGEST_TO_MIDDLE",
    "BONUS_EXCELLENT_LONGEST_TO_MIDDLE",
    "BONUS_GOOD_LONGEST_TO_MIDDLE",
  ]),
];

/**
 * 和约束组配置
 */
export const SUM_CONSTRAINED_GROUPS = [
  {
    targetSum: 1.0,
    params: [
      "WEIGHT_LONGEST_TO_SHORTEST",
      "WEIGHT_MIDDLE_TO_SHORTEST",
      "WEIGHT_LONGEST_TO_MIDDLE",
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
