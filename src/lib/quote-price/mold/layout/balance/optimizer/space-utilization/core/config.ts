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

// 体积利用率阈值范围（越大越好）
const volumeRatioRanges = createThresholdRanges(
  { min: 0.9, max: 1.0 }, // 完美：90%以上，放宽到90%
  { min: 0.75, max: 0.9 }, // 良好：75%-90%
  { min: 0.55, max: 0.75 }, // 中等：55%-75%
  { min: 0.35, max: 0.55 }, // 较差：35%-55%
);

// 长宽高比均衡度阈值范围（归一化后，越接近1越好）
const aspectRatioRanges = createThresholdRanges(
  { min: 1.0, max: 1.2 }, // 完美：偏差不超过20%
  { min: 1.2, max: 1.5 }, // 良好：偏差20%-50%
  { min: 1.5, max: 2.0 }, // 中等：偏差50%-100%
  { min: 2.0, max: 3.0 }, // 较差：偏差100%-200%
);

// 奖励范围 - 进一步增加奖励空间
const bonusScoreRanges = createBonusRanges(
  { min: 3.0, max: 8.0 }, // 完美奖励：最高可加8分
  { min: 2.0, max: 5.0 }, // 优秀奖励：最高可加5分
  { min: 1.0, max: 3.0 }, // 良好奖励：最高可加3分
);

/**
 * 参数优化范围配置
 */
export const PARAM_RANGES: Record<keyof GenericFlatParams, Range> = {
  // 体积利用率阈值
  VOLUME_RATIO_PERFECT: volumeRatioRanges.PERFECT,
  VOLUME_RATIO_GOOD: volumeRatioRanges.GOOD,
  VOLUME_RATIO_MEDIUM: volumeRatioRanges.MEDIUM,
  VOLUME_RATIO_BAD: volumeRatioRanges.BAD,

  // 长宽高比阈值
  ASPECT_RATIO_PERFECT: aspectRatioRanges.PERFECT,
  ASPECT_RATIO_GOOD: aspectRatioRanges.GOOD,
  ASPECT_RATIO_MEDIUM: aspectRatioRanges.MEDIUM,
  ASPECT_RATIO_BAD: aspectRatioRanges.BAD,

  // 权重范围
  WEIGHT_VOLUME_RATIO: { min: 0.6, max: 0.6 }, // 体积利用率权重：60%
  WEIGHT_ASPECT_RATIO: { min: 0.4, max: 0.4 }, // 长宽高比权重：40%

  // 分数区间配置
  ...createScoreRanges("VOLUME_RATIO"),
  ...createScoreRanges("ASPECT_RATIO"),

  // 组合奖励配置
  ...bonusScoreRanges,

  // 惩罚参数配置
  PENALTY_BAD_VOLUME_RATIO_THRESHOLD: { min: 0.3, max: 0.4 }, // 进一步降低阈值
  PENALTY_BAD_VOLUME_RATIO_SCORE: { min: 1, max: 5 }, // 大幅降低惩罚分值
  PENALTY_BAD_ASPECT_RATIO_THRESHOLD: { min: 2.0, max: 2.5 }, // 放宽阈值
  PENALTY_BAD_ASPECT_RATIO_SCORE: { min: 1, max: 5 }, // 大幅降低惩罚分值
  PENALTY_COMBINED_SCORE: { min: 2, max: 8 }, // 降低组合惩罚
};

/**
 * 参数分组配置
 */
export const PARAM_GROUPS = [
  // 阈值组
  createOrderedThresholdGroup("体积利用率阈值", "VOLUME_RATIO"),
  createOrderedThresholdGroup("长宽高比阈值", "ASPECT_RATIO"),

  // 分数区间组
  createScoreGroup("分数区间 - 体积利用率", "VOLUME_RATIO"),
  createScoreGroup("分数区间 - 长宽高比", "ASPECT_RATIO"),

  // 奖励分数组
  createBonusScoreGroup(),

  // 奖励阈值组
  createBonusGroup([
    "BONUS_PERFECT_VOLUME_RATIO",
    "BONUS_EXCELLENT_VOLUME_RATIO",
    "BONUS_GOOD_VOLUME_RATIO",
  ]),
  createBonusGroup([
    "BONUS_PERFECT_ASPECT_RATIO",
    "BONUS_EXCELLENT_ASPECT_RATIO",
    "BONUS_GOOD_ASPECT_RATIO",
  ]),
];

/**
 * 和约束组配置
 */
export const SUM_CONSTRAINED_GROUPS = [
  {
    targetSum: 1.0,
    params: ["WEIGHT_VOLUME_RATIO", "WEIGHT_ASPECT_RATIO"],
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
