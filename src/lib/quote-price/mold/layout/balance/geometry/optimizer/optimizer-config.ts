import type { OptimizerConfigRange } from "../types";
import type { UnifiedParamRanges } from "./param-ranges";

/**
 * 优化器配置文件
 * 包含暴力搜索和遗传算法的相关配置
 */

/**
 * 遗传算法参数配置
 */
export const GA_CONFIG = {
  mutationRate: 0.2, // 增加变异率，提高探索能力
  crossoverRate: 0.9, // 增加交叉率，加强基因交换
  elitismCount: 5, // 增加精英数量，保留更多优秀个体
  tournamentSize: 7, // 增加锦标赛规模，提高选择压力
} as const;

/**
 * 暴力搜索的参数范围和步长
 */
export const CONFIG_RANGES: OptimizerConfigRange = {
  weights: {
    volume: { min: 0.1, max: 0.4, step: 0.05 }, // 减小步长
    aspectRatio: { min: 0.1, max: 0.4, step: 0.05 }, // 减小步长
    shapeSimilarity: { min: 0.1, max: 0.4, step: 0.05 }, // 减小步长
    dimensionalConsistency: { min: 0.1, max: 0.4, step: 0.05 }, // 减小步长
  },
  volume: {
    highScoreThreshold: { min: 0.8, max: 0.95, step: 0.025 }, // 扩大范围，减小步长
    midScoreThreshold: { min: 0.4, max: 0.6, step: 0.05 }, // 减小步长
    lowScoreThreshold: { min: 0.05, max: 0.2, step: 0.025 }, // 扩大范围，减小步长
    highScoreBase: { min: 90, max: 98, step: 2 }, // 扩大范围，减小步长
    midScoreBase: { min: 65, max: 85, step: 2 }, // 扩大范围，减小步长
    scoringFunction: "sigmoid",
    sigmoidSteepness: { min: 6, max: 14, step: 1 }, // 扩大范围，减小步长
  },
  aspectRatio: {
    optimalRatio: { min: 1.2, max: 2.2, step: 0.2 }, // 扩大范围，减小步长
    maxRatio: { min: 2.5, max: 4.5, step: 0.25 }, // 扩大范围，减小步长
    scoreMultiplier: { min: 0.6, max: 0.95, step: 0.05 }, // 扩大范围，减小步长
    middleRatioWeight: { min: 0.15, max: 0.45, step: 0.05 }, // 扩大范围，减小步长
    shortRatioWeight: { min: 0.15, max: 0.45, step: 0.05 }, // 扩大范围，减小步长
  },
  shapeSimilarity: {
    diffMultiplier: { min: 0.15, max: 0.35, step: 0.05 }, // 扩大范围，减小步长
    outlierPenalty: { min: 1.1, max: 2.0, step: 0.1 }, // 扩大范围，减小步长
    maxComparisons: { min: 50, max: 200, step: 25 }, // 扩大范围，减小步长
    outlierWeight: { min: 0.15, max: 0.45, step: 0.05 }, // 扩大范围，减小步长
  },
  dimensionalConsistency: {
    maxCV: { min: 0.15, max: 0.35, step: 0.05 }, // 扩大范围，减小步长
    cvMultiplier: { min: 0.6, max: 0.95, step: 0.05 }, // 扩大范围，减小步长
    minResidualScore: { min: 2, max: 15, step: 1 }, // 扩大范围，减小步长
    smoothingFactor: { min: 0.05, max: 0.25, step: 0.05 }, // 扩大范围，减小步长
  },
} as const;

/**
 * 遗传算法的参数范围（与暴力搜索相同，但不需要步长）
 */
export const PARAM_RANGES: UnifiedParamRanges = {
  baseWeights: {
    volume: { min: 0.1, max: 0.4, step: 0.1 },
    aspectRatio: { min: 0.1, max: 0.4, step: 0.1 },
    shapeSimilarity: { min: 0.1, max: 0.4, step: 0.1 },
    dimensionalConsistency: { min: 0.1, max: 0.4, step: 0.1 },
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
  dimensionalConsistency: {
    maxCV: { min: 0.2, max: 0.3, step: 0.1 },
    cvMultiplier: { min: 1.0, max: 2.0, step: 0.5 },
    minResidualScore: { min: 10, max: 20, step: 5 },
    smoothingFactor: { min: 0.1, max: 0.2, step: 0.1 },
  },
} as const;
