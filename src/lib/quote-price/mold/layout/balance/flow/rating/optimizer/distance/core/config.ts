import type { ParamRange } from "@/lib/algorithms/optimizer";
import type { FlatParams } from "./types";

/**
 * 参数优化范围配置
 */
export const PARAM_RANGES: Record<keyof FlatParams, ParamRange> = {
  // 偏离阈值范围 - 极度宽松
  CV_PERFECT: { min: 0.02, max: 0.08 },
  CV_GOOD: { min: 0.15, max: 0.25 },
  CV_MEDIUM: { min: 0.35, max: 0.55 },
  CV_BAD: { min: 0.65, max: 0.85 },

  // 极差比阈值范围 - 极度宽松
  RANGE_PERFECT: { min: 0.1, max: 0.2 },
  RANGE_GOOD: { min: 0.25, max: 0.45 },
  RANGE_MEDIUM: { min: 0.5, max: 0.8 },
  RANGE_BAD: { min: 0.75, max: 0.95 },

  // 权重范围 - 固定权重
  WEIGHT_CV: { min: 0.6, max: 0.6 }, // CV权重：60%
  WEIGHT_RANGE: { min: 0.4, max: 0.4 }, // RANGE权重：40%

  // 分数区间 - 偏离 (宽松化)
  SCORE_CV_PERFECT_BASE: { min: 85, max: 100 },
  SCORE_CV_PERFECT_FACTOR: { min: 5, max: 15 },
  SCORE_CV_GOOD_BASE: { min: 75, max: 90 },
  SCORE_CV_GOOD_FACTOR: { min: 10, max: 30 },
  SCORE_CV_MEDIUM_BASE: { min: 60, max: 85 },
  SCORE_CV_MEDIUM_FACTOR: { min: 8, max: 25 },
  SCORE_CV_BAD_BASE: { min: 45, max: 70 },
  SCORE_CV_BAD_FACTOR: { min: 3, max: 20 },

  // 分数区间 - 高度 (宽松化)
  SCORE_RANGE_PERFECT_BASE: { min: 85, max: 100 },
  SCORE_RANGE_PERFECT_FACTOR: { min: 5, max: 15 },
  SCORE_RANGE_GOOD_BASE: { min: 75, max: 90 },
  SCORE_RANGE_GOOD_FACTOR: { min: 10, max: 30 },
  SCORE_RANGE_MEDIUM_BASE: { min: 60, max: 85 },
  SCORE_RANGE_MEDIUM_FACTOR: { min: 8, max: 25 },
  SCORE_RANGE_BAD_BASE: { min: 45, max: 70 },
  SCORE_RANGE_BAD_FACTOR: { min: 3, max: 20 },

  // 组合奖励 (宽松化)
  BONUS_PERFECT_CV: { min: 0.02, max: 0.08 },
  BONUS_PERFECT_RANGE: { min: 0.1, max: 0.2 },
  BONUS_PERFECT_SCORE: { min: 1.0, max: 3.0 },
  BONUS_EXCELLENT_CV: { min: 0.06, max: 0.15 },
  BONUS_EXCELLENT_RANGE: { min: 0.18, max: 0.32 },
  BONUS_EXCELLENT_SCORE: { min: 0.8, max: 2.5 },
  BONUS_GOOD_CV: { min: 0.1, max: 0.2 },
  BONUS_GOOD_RANGE: { min: 0.25, max: 0.45 },
  BONUS_GOOD_SCORE: { min: 0.5, max: 2.0 },

  // 惩罚参数 (降低惩罚强度)
  PENALTY_BAD_CV_THRESHOLD: { min: 0.6, max: 0.8 },
  PENALTY_BAD_CV_SCORE: { min: 3, max: 12 },
  PENALTY_BAD_RANGE_THRESHOLD: { min: 0.75, max: 0.95 },
  PENALTY_BAD_RANGE_SCORE: { min: 3, max: 12 },
  PENALTY_COMBINED_SCORE: { min: 2, max: 8 },
};

/**
 * 有序参数组配置
 */
export const PARAM_GROUPS = [
  {
    name: "偏离阈值",
    params: ["CV_PERFECT", "CV_GOOD", "CV_MEDIUM", "CV_BAD"] as Array<
      keyof FlatParams
    >,
  },
  {
    name: "高度阈值",
    params: [
      "RANGE_PERFECT",
      "RANGE_GOOD",
      "RANGE_MEDIUM",
      "RANGE_BAD",
    ] as Array<keyof FlatParams>,
  },
  {
    name: "分数区间 - 偏离",
    params: [
      "SCORE_CV_BAD_BASE",
      "SCORE_CV_MEDIUM_BASE",
      "SCORE_CV_GOOD_BASE",
      "SCORE_CV_PERFECT_BASE",
    ] as Array<keyof FlatParams>,
  },
  {
    name: "分数区间 - 高度",
    params: [
      "SCORE_RANGE_BAD_BASE",
      "SCORE_RANGE_MEDIUM_BASE",
      "SCORE_RANGE_GOOD_BASE",
      "SCORE_RANGE_PERFECT_BASE",
    ] as Array<keyof FlatParams>,
  },
  {
    name: "组合奖励 - 偏离",
    params: [
      "BONUS_PERFECT_CV",
      "BONUS_EXCELLENT_CV",
      "BONUS_GOOD_CV",
    ] as Array<keyof FlatParams>,
  },
  {
    name: "组合奖励 - 高度",
    params: [
      "BONUS_PERFECT_RANGE",
      "BONUS_EXCELLENT_RANGE",
      "BONUS_GOOD_RANGE",
    ] as Array<keyof FlatParams>,
  },
  {
    name: "组合奖励 - 分数",
    params: [
      "BONUS_PERFECT_SCORE",
      "BONUS_EXCELLENT_SCORE",
      "BONUS_GOOD_SCORE",
    ] as Array<keyof FlatParams>,
  },
];

/**
 * 和约束组配置
 */
export const SUM_CONSTRAINED_GROUPS = [
  {
    targetSum: 1,
    params: ["WEIGHT_CV", "WEIGHT_RANGE"] as Array<keyof FlatParams>,
    tolerance: 0.001,
  },
];
