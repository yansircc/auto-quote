import type { GeometricConfig } from "./types";

// 形状相似度计算常量
export const SHAPE_SIMILARITY = {
  // 维度差异指数 - 较小值使计算更宽容
  DIMENSION_DIFF_EXPONENT: 1.3, // 降低指数，更宽容地处理差异

  // 维度权重 - 从小到大的差异权重
  DIMENSION_WEIGHTS: {
    SMALL: 0.15, // 降低小差异权重，让维度交换更容易被发现
    MEDIUM: 0.35, // 保持中等差异权重
    LARGE: 0.55, // 恢复大差异权重，加大对深度差异的惩罚
  },

  // 离群点阈值 - 超过此值视为显著差异
  OUTLIER_THRESHOLD: 0.6, // 提高阈值，更宽容地处理差异

  // 极端情况惩罚系数
  EXTREME_PENALTY: {
    BASE: 0.8, // 基础惩罚系数
    THRESHOLD: 30, // 极端低分阈值
  },
} as const;

// 长宽比评分常量
export const ASPECT_RATIO = {
  // 长宽比评分系数
  SCORE_MULTIPLIER: 20,
  SCORE_EXPONENT: 1.5,

  // 各维度比例权重
  WEIGHTS: {
    LONGEST_TO_SHORTEST: 0.4, // 最长边与最短边比例权重
    MIDDLE_TO_SHORTEST: 0.3, // 中间边与最短边比例权重
    LONGEST_TO_MIDDLE: 0.3, // 最长边与中间边比例权重
  },

  // 极端比例惩罚
  EXTREME_PENALTY: {
    BASE: 0.5, // 基础惩罚系数
  },
} as const;

// 默认几何平衡配置
export const DEFAULT_CONFIG: GeometricConfig = {
  weights: {
    volume: 0.1,
    aspectRatio: 0.1,
    shapeSimilarity: 0.4,
    dimensionalConsistency: 0.4,
  },
  volume: {
    highScoreThreshold: 0.93,
    midScoreThreshold: 0.4,
    lowScoreThreshold: 0.2,
    highScoreBase: 92,
    midScoreBase: 80,
    scoringFunction: "sigmoid",
    sigmoidSteepness: 9,
  },
  aspectRatio: {
    optimalRatio: 1.6,
    maxRatio: 4.25,
    scoreMultiplier: 0.65,
    middleRatioWeight: 0.4,
    shortRatioWeight: 0.15,
  },
  shapeSimilarity: {
    diffMultiplier: 0.3,
    outlierPenalty: 1.9,
    outlierWeight: 0.45,
    maxComparisons: 175,
  },
  dimensionalConsistency: {
    maxCV: 0.35,
    cvMultiplier: 0.9,
    minResidualScore: 12,
    smoothingFactor: 0.2,
  },
} as const;
