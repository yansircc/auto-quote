import type { ParamRange } from "@/lib/algorithms/optimizer";
import type { FlatParams } from "@/lib/quote-price/mold/layout/balance/generic-optimizer";

/**
 * 参数优化范围配置
 */
export const PARAM_RANGES: Record<keyof FlatParams, ParamRange> = {
  // 偏离阈值范围（相对值） - 极度宽松
  DEVIATION_PERFECT: { min: 0.0, max: 0.08 }, // 完美：0-8%
  DEVIATION_GOOD: { min: 0.05, max: 0.2 }, // 良好：5-20%
  DEVIATION_MEDIUM: { min: 0.15, max: 0.35 }, // 中等：15-35%
  DEVIATION_BAD: { min: 0.25, max: 0.45 }, // 较差：25-45%

  // 高度阈值范围（归一化值） - 极度宽松
  HEIGHT_PERFECT: { min: 0.0, max: 0.15 }, // 完美：0-15%
  HEIGHT_GOOD: { min: 0.1, max: 0.3 }, // 良好：10-30%
  HEIGHT_MEDIUM: { min: 0.25, max: 0.5 }, // 中等：25-50%
  HEIGHT_BAD: { min: 0.4, max: 0.7 }, // 较差：40-70%

  // 权重范围（和为1） - 固定权重
  WEIGHT_DEVIATION: { min: 0.6, max: 0.6 }, // 偏离权重：60%
  WEIGHT_HEIGHT: { min: 0.4, max: 0.4 }, // 高度权重：40%

  // 偏离度评分参数 - 宽松化
  SCORE_DEVIATION_PERFECT_BASE: { min: 90, max: 100 }, // 基础分：90-100
  SCORE_DEVIATION_PERFECT_FACTOR: { min: 2, max: 8 }, // 惩罚因子
  SCORE_DEVIATION_GOOD_BASE: { min: 75, max: 95 }, // 基础分：75-95
  SCORE_DEVIATION_GOOD_FACTOR: { min: 10, max: 30 }, // 惩罚因子
  SCORE_DEVIATION_MEDIUM_BASE: { min: 55, max: 85 }, // 基础分：55-85
  SCORE_DEVIATION_MEDIUM_FACTOR: { min: 15, max: 35 }, // 惩罚因子
  SCORE_DEVIATION_BAD_BASE: { min: 40, max: 65 }, // 基础分：40-65
  SCORE_DEVIATION_BAD_FACTOR: { min: 0.5, max: 1.5 }, // 惩罚因子

  // 高度评分参数 - 宽松化
  SCORE_HEIGHT_PERFECT_BASE: { min: 90, max: 100 }, // 基础分：90-100
  SCORE_HEIGHT_PERFECT_FACTOR: { min: 2, max: 8 }, // 惩罚因子
  SCORE_HEIGHT_GOOD_BASE: { min: 75, max: 95 }, // 基础分：75-95
  SCORE_HEIGHT_GOOD_FACTOR: { min: 10, max: 30 }, // 惩罚因子
  SCORE_HEIGHT_MEDIUM_BASE: { min: 55, max: 85 }, // 基础分：55-85
  SCORE_HEIGHT_MEDIUM_FACTOR: { min: 15, max: 35 }, // 惩罚因子
  SCORE_HEIGHT_BAD_BASE: { min: 40, max: 65 }, // 基础分：40-65
  SCORE_HEIGHT_BAD_FACTOR: { min: 0.5, max: 1.5 }, // 惩罚因子

  // 奖励参数 - 宽松化
  BONUS_PERFECT_DEVIATION: { min: 0.0, max: 0.05 }, // 完美偏离：0-5%
  BONUS_PERFECT_HEIGHT: { min: 0.0, max: 0.08 }, // 完美高度：0-8%
  BONUS_PERFECT_SCORE: { min: 2, max: 6 }, // 完美奖励：2-6分
  BONUS_EXCELLENT_DEVIATION: { min: 0.02, max: 0.12 }, // 优秀偏离：2-12%
  BONUS_EXCELLENT_HEIGHT: { min: 0.05, max: 0.2 }, // 优秀高度：5-20%
  BONUS_EXCELLENT_SCORE: { min: 1.5, max: 4 }, // 优秀奖励：1.5-4分
  BONUS_GOOD_DEVIATION: { min: 0.05, max: 0.2 }, // 良好偏离：5-20%
  BONUS_GOOD_HEIGHT: { min: 0.1, max: 0.3 }, // 良好高度：10-30%
  BONUS_GOOD_SCORE: { min: 0.8, max: 3 }, // 良好奖励：0.8-3分

  // 惩罚参数 - 降低惩罚强度
  PENALTY_BAD_DEVIATION_THRESHOLD: { min: 0.2, max: 0.4 }, // 严重偏离阈值：20-40%
  PENALTY_BAD_DEVIATION_SCORE: { min: 5, max: 20 }, // 偏离惩罚：5-20分
  PENALTY_BAD_HEIGHT_THRESHOLD: { min: 0.35, max: 0.65 }, // 过高阈值：35-65%
  PENALTY_BAD_HEIGHT_SCORE: { min: 5, max: 20 }, // 高度惩罚：5-20分
  PENALTY_COMBINED_SCORE: { min: 3, max: 12 }, // 组合惩罚：3-12分
};

/**
 * 参数分组配置
 */
export const PARAM_GROUPS = [
  {
    name: "偏离阈值",
    params: [
      "DEVIATION_PERFECT",
      "DEVIATION_GOOD",
      "DEVIATION_MEDIUM",
      "DEVIATION_BAD",
    ] as Array<keyof FlatParams>,
  },
  {
    name: "高度阈值",
    params: [
      "HEIGHT_PERFECT",
      "HEIGHT_GOOD",
      "HEIGHT_MEDIUM",
      "HEIGHT_BAD",
    ] as Array<keyof FlatParams>,
  },
  {
    name: "权重配置",
    params: ["WEIGHT_DEVIATION", "WEIGHT_HEIGHT"] as Array<keyof FlatParams>,
  },
  {
    name: "偏离度评分",
    params: [
      "SCORE_DEVIATION_PERFECT_BASE",
      "SCORE_DEVIATION_GOOD_BASE",
      "SCORE_DEVIATION_MEDIUM_BASE",
      "SCORE_DEVIATION_BAD_BASE",
    ] as Array<keyof FlatParams>,
  },
  {
    name: "高度评分",
    params: [
      "SCORE_HEIGHT_PERFECT_BASE",
      "SCORE_HEIGHT_GOOD_BASE",
      "SCORE_HEIGHT_MEDIUM_BASE",
      "SCORE_HEIGHT_BAD_BASE",
    ] as Array<keyof FlatParams>,
  },
];

/**
 * 和约束组配置
 */
export const SUM_CONSTRAINED_GROUPS = [
  {
    targetSum: 1,
    params: ["WEIGHT_DEVIATION", "WEIGHT_HEIGHT"] as Array<keyof FlatParams>,
    tolerance: 0.001,
  },
];
