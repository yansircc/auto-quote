import type { Range } from "../types";

/**
 * 统一的参数范围定义
 * 包含所有可优化参数的范围配置
 */
export interface UnifiedParamRanges {
  // 基础权重
  baseWeights: {
    volume: Range;
    aspectRatio: Range;
    shapeSimilarity: Range;
    dimensionalConsistency: Range;
  };

  // 形状相似度参数
  shapeSimilarity: {
    dimensionWeights: {
      small: Range;
      medium: Range;
      large: Range;
    };
    diffMultiplier: Range;
    outlierPenalty: Range;
    outlierWeight: Range;
    maxComparisons: Range;
  };

  // 体积评分参数
  volume: {
    highScoreThreshold: Range;
    midScoreThreshold: Range;
    lowScoreThreshold: Range;
    highScoreBase: Range;
    midScoreBase: Range;
    sigmoidSteepness: Range;
  };

  // 长宽比参数
  aspectRatio: {
    optimalRatio: Range;
    maxRatio: Range;
    scoreMultiplier: Range;
    middleRatioWeight: Range;
    shortRatioWeight: Range;
  };

  // 维度一致性参数
  dimensionalConsistency: {
    maxCV: Range;
    cvMultiplier: Range;
    minResidualScore: Range;
    smoothingFactor: Range;
  };
}

/**
 * 默认参数范围配置
 * 基于之前手动调优的经验值设定范围
 */
export const DEFAULT_PARAM_RANGES: UnifiedParamRanges = {
  baseWeights: {
    volume: { min: 0.1, max: 0.4, step: 0.1 },
    aspectRatio: { min: 0.1, max: 0.4, step: 0.1 },
    shapeSimilarity: { min: 0.1, max: 0.4, step: 0.1 },
    dimensionalConsistency: { min: 0.1, max: 0.4, step: 0.1 },
  },

  shapeSimilarity: {
    dimensionWeights: {
      small: { min: 0.1, max: 0.2, step: 0.05 },
      medium: { min: 0.3, max: 0.4, step: 0.05 },
      large: { min: 0.5, max: 0.6, step: 0.05 },
    },
    diffMultiplier: { min: 0.8, max: 1.2, step: 0.1 },
    outlierPenalty: { min: 1.5, max: 2.5, step: 0.5 },
    outlierWeight: { min: 0.2, max: 0.4, step: 0.1 },
    maxComparisons: { min: 50, max: 150, step: 50 },
  },

  volume: {
    highScoreThreshold: { min: 0.8, max: 0.9, step: 0.05 },
    midScoreThreshold: { min: 0.4, max: 0.6, step: 0.1 },
    lowScoreThreshold: { min: 0.1, max: 0.2, step: 0.05 },
    highScoreBase: { min: 90, max: 95, step: 5 },
    midScoreBase: { min: 70, max: 80, step: 5 },
    sigmoidSteepness: { min: 8, max: 12, step: 2 },
  },

  aspectRatio: {
    optimalRatio: { min: 1.5, max: 2.0, step: 0.5 },
    maxRatio: { min: 3.0, max: 4.0, step: 0.5 },
    scoreMultiplier: { min: 0.7, max: 0.9, step: 0.1 },
    middleRatioWeight: { min: 0.2, max: 0.4, step: 0.1 },
    shortRatioWeight: { min: 0.2, max: 0.4, step: 0.1 },
  },

  dimensionalConsistency: {
    maxCV: { min: 0.2, max: 0.3, step: 0.1 },
    cvMultiplier: { min: 1.0, max: 2.0, step: 0.5 },
    minResidualScore: { min: 10, max: 20, step: 5 },
    smoothingFactor: { min: 0.1, max: 0.3, step: 0.1 },
  },
};
