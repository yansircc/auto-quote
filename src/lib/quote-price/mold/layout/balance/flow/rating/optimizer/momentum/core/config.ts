import type { OptimizerConfig } from "@/lib/algorithms/optimizer";
import type { FlatParams } from "./types";

/**
 * 参数优化范围配置
 */
export const PARAM_RANGES: Record<
  keyof FlatParams,
  { min: number; max: number }
> = {
  // 比率阈值范围 - 极度宽松
  RATIO_PERFECT: { min: 1.0, max: 1.1 },
  RATIO_GOOD: { min: 1.1, max: 1.2 },
  RATIO_MEDIUM: { min: 1.2, max: 1.4 },
  RATIO_BAD: { min: 1.4, max: 2.0 },

  // RSD阈值范围 - 极度宽松
  RSD_PERFECT: { min: 0.0, max: 0.1 },
  RSD_GOOD: { min: 0.1, max: 0.2 },
  RSD_MEDIUM: { min: 0.2, max: 0.4 },
  RSD_BAD: { min: 0.4, max: 1.0 },

  // 权重范围 - 固定权重
  WEIGHT_RATIO: { min: 0.6, max: 0.6 }, // 比率权重：60%
  WEIGHT_RSD: { min: 0.4, max: 0.4 }, // 标准差权重：40%

  // 分数区间 - 比率 (宽松化)
  SCORE_RATIO_PERFECT_BASE: { min: 80, max: 100 },
  SCORE_RATIO_PERFECT_FACTOR: { min: 1, max: 10 },
  SCORE_RATIO_GOOD_BASE: { min: 60, max: 90 },
  SCORE_RATIO_GOOD_FACTOR: { min: 1, max: 20 },
  SCORE_RATIO_MEDIUM_BASE: { min: 40, max: 70 },
  SCORE_RATIO_MEDIUM_FACTOR: { min: 1, max: 20 },
  SCORE_RATIO_BAD_BASE: { min: 20, max: 50 },
  SCORE_RATIO_BAD_FACTOR: { min: 1, max: 20 },

  // 分数区间 - RSD (宽松化)
  SCORE_RSD_PERFECT_BASE: { min: 80, max: 100 },
  SCORE_RSD_PERFECT_FACTOR: { min: 1, max: 10 },
  SCORE_RSD_GOOD_BASE: { min: 60, max: 90 },
  SCORE_RSD_GOOD_FACTOR: { min: 1, max: 20 },
  SCORE_RSD_MEDIUM_BASE: { min: 40, max: 70 },
  SCORE_RSD_MEDIUM_FACTOR: { min: 1, max: 20 },
  SCORE_RSD_BAD_BASE: { min: 20, max: 50 },
  SCORE_RSD_BAD_FACTOR: { min: 1, max: 20 },

  // 组合奖励 (宽松化)
  BONUS_PERFECT_RATIO: { min: 1.0, max: 1.2 },
  BONUS_PERFECT_RSD: { min: 0.0, max: 0.2 },
  BONUS_PERFECT_SCORE: { min: 1.0, max: 3.0 },
  BONUS_EXCELLENT_RATIO: { min: 1.1, max: 1.3 },
  BONUS_EXCELLENT_RSD: { min: 0.1, max: 0.3 },
  BONUS_EXCELLENT_SCORE: { min: 1.0, max: 2.5 },
  BONUS_GOOD_RATIO: { min: 1.2, max: 1.4 },
  BONUS_GOOD_RSD: { min: 0.2, max: 0.4 },
  BONUS_GOOD_SCORE: { min: 0.5, max: 2.0 },

  // 惩罚参数 (降低惩罚强度)
  PENALTY_BAD_RATIO_THRESHOLD: { min: 1.5, max: 2.0 },
  PENALTY_BAD_RATIO_SCORE: { min: 5, max: 20 },
  PENALTY_BAD_RSD_THRESHOLD: { min: 0.5, max: 1.0 },
  PENALTY_BAD_RSD_SCORE: { min: 5, max: 20 },
  PENALTY_COMBINED_SCORE: { min: 2, max: 10 },
};

/**
 * 有序参数组配置
 */
export const PARAM_GROUPS = [
  {
    name: "比率阈值",
    params: [
      "RATIO_PERFECT",
      "RATIO_GOOD",
      "RATIO_MEDIUM",
      "RATIO_BAD",
    ] as Array<keyof FlatParams>,
  },
  {
    name: "RSD阈值",
    params: ["RSD_PERFECT", "RSD_GOOD", "RSD_MEDIUM", "RSD_BAD"] as Array<
      keyof FlatParams
    >,
  },
  {
    name: "分数区间 - 比率",
    params: [
      "SCORE_RATIO_BAD_BASE",
      "SCORE_RATIO_MEDIUM_BASE",
      "SCORE_RATIO_GOOD_BASE",
      "SCORE_RATIO_PERFECT_BASE",
    ] as Array<keyof FlatParams>,
  },
  {
    name: "分数区间 - RSD",
    params: [
      "SCORE_RSD_BAD_BASE",
      "SCORE_RSD_MEDIUM_BASE",
      "SCORE_RSD_GOOD_BASE",
      "SCORE_RSD_PERFECT_BASE",
    ] as Array<keyof FlatParams>,
  },
  {
    name: "组合奖励 - 比率",
    params: [
      "BONUS_PERFECT_RATIO",
      "BONUS_EXCELLENT_RATIO",
      "BONUS_GOOD_RATIO",
    ] as Array<keyof FlatParams>,
  },
  {
    name: "组合奖励 - RSD",
    params: [
      "BONUS_PERFECT_RSD",
      "BONUS_EXCELLENT_RSD",
      "BONUS_GOOD_RSD",
    ] as Array<keyof FlatParams>,
  },
  {
    name: "组合奖励 - 分数",
    params: [
      "BONUS_GOOD_SCORE",
      "BONUS_EXCELLENT_SCORE",
      "BONUS_PERFECT_SCORE",
    ] as Array<keyof FlatParams>,
  },
];

/**
 * 和约束组配置
 */
export const SUM_CONSTRAINED_GROUPS = [
  {
    targetSum: 1,
    params: ["WEIGHT_RATIO", "WEIGHT_RSD"] as Array<keyof FlatParams>,
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
export const OPTIMIZER_CONFIG: OptimizerConfig<FlatParams> = {
  ranges: PARAM_RANGES,
  orderedGroups: PARAM_GROUPS,
  sumConstraints: SUM_CONSTRAINED_GROUPS,
};
