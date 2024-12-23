import type { BaseCuboid } from "../types";

/**
 * 几何平衡配置类型，用于控制各种评分参数
 */
export type Cuboid = BaseCuboid;

/**
 * 几何平衡配置类型，用于控制各种评分参数
 */
export interface Range {
  min: number;
  max: number;
  step: number;
}

export interface ConfigRange {
  [key: string]: Range | ConfigRange | string;
}

export interface WeightsConfig extends ConfigRange {
  volume: Range;
  aspectRatio: Range;
  shapeSimilarity: Range;
  dimensionalConsistency: Range;
}

export interface VolumeConfig extends ConfigRange {
  highScoreThreshold: Range;
  midScoreThreshold: Range;
  lowScoreThreshold: Range;
  highScoreBase: Range;
  midScoreBase: Range;
  scoringFunction: string;
  sigmoidSteepness: Range;
}

export interface AspectRatioConfig extends ConfigRange {
  optimalRatio: Range;
  maxRatio: Range;
  scoreMultiplier: Range;
  middleRatioWeight: Range;
  shortRatioWeight: Range;
}

export interface ShapeSimilarityConfig extends ConfigRange {
  diffMultiplier: Range;
  outlierPenalty: Range;
  maxComparisons: Range;
  outlierWeight: Range;
}

export interface DimensionalConsistencyConfig extends ConfigRange {
  maxCV: Range;
  cvMultiplier: Range;
  minResidualScore: Range;
  smoothingFactor: Range;
}

export interface OptimizerConfigRange extends ConfigRange {
  weights: WeightsConfig;
  volume: VolumeConfig;
  aspectRatio: AspectRatioConfig;
  shapeSimilarity: ShapeSimilarityConfig;
  dimensionalConsistency: DimensionalConsistencyConfig;
}

export interface GeometricConfig {
  [key: string]: number | string | Record<string, number | string> | undefined;

  weights: {
    volume: number;
    aspectRatio: number;
    shapeSimilarity: number;
    dimensionalConsistency: number;
  };
  volume: {
    highScoreThreshold: number;
    midScoreThreshold: number;
    lowScoreThreshold: number;
    highScoreBase: number;
    midScoreBase: number;
    scoringFunction: "sigmoid";
    sigmoidSteepness: number;
  };
  aspectRatio: {
    optimalRatio: number;
    maxRatio: number;
    scoreMultiplier: number;
    middleRatioWeight: number;
    shortRatioWeight: number;
  };
  shapeSimilarity: {
    diffMultiplier: number;
    outlierPenalty: number;
    maxComparisons: number;
    outlierWeight: number;
  };
  dimensionalConsistency: {
    maxCV: number;
    cvMultiplier: number;
    minResidualScore: number;
    smoothingFactor: number;
  };
}

export interface ParamRange {
  weights: {
    volume: { min: number; max: number };
    aspectRatio: { min: number; max: number };
    shapeSimilarity: { min: number; max: number };
    dimensionalConsistency: { min: number; max: number };
  };
  volume: {
    highScoreThreshold: { min: number; max: number };
    midScoreThreshold: { min: number; max: number };
    lowScoreThreshold: { min: number; max: number };
    highScoreBase: { min: number; max: number };
    midScoreBase: { min: number; max: number };
    sigmoidSteepness: { min: number; max: number };
  };
  aspectRatio: {
    optimalRatio: { min: number; max: number };
    maxRatio: { min: number; max: number };
    scoreMultiplier: { min: number; max: number };
    middleRatioWeight: { min: number; max: number };
    shortRatioWeight: { min: number; max: number };
  };
  shapeSimilarity: {
    diffMultiplier: { min: number; max: number };
    outlierPenalty: { min: number; max: number };
    maxComparisons: { min: number; max: number };
    outlierWeight: { min: number; max: number };
  };
  dimensionalConsistency: {
    maxCV: { min: number; max: number };
    cvMultiplier: { min: number; max: number };
    minResidualScore: { min: number; max: number };
    smoothingFactor: { min: number; max: number };
  };
}
