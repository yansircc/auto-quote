import { DEFAULT_CONFIG } from "./constants";
import type { GeometricConfig } from "./types";
import type { BaseCuboid as Cuboid } from "../types";
import { SHAPE_SIMILARITY, ASPECT_RATIO } from "./constants";
import { sigmoid, cvScore } from "./score-functions";

/**
 * 几何平衡评分系统
 *
 * 评分维度：
 * 1. 体积平衡性 (35%)
 *    - 计算所有长方体的体积
 *    - 评估最大体积和最小体积的比值
 *    - 体积比 > 0.8 得高分（85-100分）
 *    - 体积比 0.4-0.8 得中分（50-85分）
 *    - 体积比 0.1-0.4 得低分（0-50分）
 *    - 体积比 < 0.1 得0分
 *
 * 2. 长宽比评分 (35%)
 *    - 计算每个长方体的最长边与最短边的比值
 *    - 评估形状的规则程度
 *    - 比值越接近1越好（接近立方体）
 *    - 比值超过2时认为过于细长
 *
 * 3. 形状相似度 (15%)
 *    - 标准化每个长方体的三个维度
 *    - 比较长方体之间的形状差异
 *    - 评估整体的形状一致性
 *    - 考虑维度比例的相似程度
 *
 * 4. 维度一致性 (15%)
 *    - 分别评估宽、高、深三个维度
 *    - 计算每个维度的变异系数
 *    - 评估维度尺寸的统一性
 *    - 关注极端值的影响
 *
 * 注意事项：
 * 1. 不考虑长方体的位置信息（由流动平衡负责）
 * 2. 不考虑空间分布情况（由空间分布平衡负责）
 * 3. 主要关注单个长方体的形状特征
 * 4. 注重长方体之间的形状和体积一致性
 */

/**
 * 计算三维比例
 * 考虑所有边的比例关系，而不仅仅是最长边和最短边
 */
function calculate3DRatio(cuboid: Cuboid): {
  longestToShortest: number;
  middleToShortest: number;
  longestToMiddle: number;
} {
  // 确保所有维度至少为0.0001，避免除以0
  const dims = [
    Math.max(0.0001, cuboid.width),
    Math.max(0.0001, cuboid.height),
    Math.max(0.0001, cuboid.depth),
  ].sort((a, b) => a - b);

  // 由于dims是固定长度为3的数组，且每个元素都已确保是数字，所以这里的解构是安全的
  const shortest = dims[0] ?? 0.0001;
  const middle = dims[1] ?? 0.0001;
  const longest = dims[2] ?? 0.0001;

  return {
    longestToShortest: longest / shortest,
    middleToShortest: middle / shortest,
    longestToMiddle: longest / middle,
  };
}

/**
 * 计算形状相似度
 * 使用改进的算法，考虑离群点影响
 */
function calculateShapeSimilarity(
  c1: Cuboid,
  c2: Cuboid,
  config: GeometricConfig,
): number {
  // 将三个维度标准化
  const dims1 = [c1.width, c1.height, c1.depth].map((d) => Math.max(0.0001, d));
  const dims2 = [c2.width, c2.height, c2.depth].map((d) => Math.max(0.0001, d));
  const max1 = Math.max(...dims1);
  const max2 = Math.max(...dims2);

  // 计算标准化后的维度
  const normalized1 = dims1.map((d) => d / max1).sort();
  const normalized2 = dims2.map((d) => d / max2).sort();

  // 计算每个维度的差异，使用配置的指数
  const diffs = normalized1.map((d, i) =>
    Math.pow(
      Math.abs(d - normalized2[i]!),
      SHAPE_SIMILARITY.DIMENSION_DIFF_EXPONENT,
    ),
  );

  // 计算总体差异，使用加权平均
  const avgDiff = Math.sqrt(
    diffs.reduce((a, b, i) => {
      const weight =
        i === 0
          ? SHAPE_SIMILARITY.DIMENSION_WEIGHTS.SMALL
          : i === 1
            ? SHAPE_SIMILARITY.DIMENSION_WEIGHTS.MEDIUM
            : SHAPE_SIMILARITY.DIMENSION_WEIGHTS.LARGE;
      return a + b * weight;
    }, 0),
  );

  // 使用更宽容的相似度计算
  const similarity = Math.max(
    0,
    1 - avgDiff * config.shapeSimilarity.diffMultiplier,
  );

  // 只有当差异非常大时才应用离群点惩罚
  const maxDiff = Math.max(...diffs);
  if (maxDiff > SHAPE_SIMILARITY.OUTLIER_THRESHOLD) {
    const outlierPenalty = Math.pow(
      maxDiff,
      config.shapeSimilarity.outlierPenalty,
    );
    return (
      similarity * (1 - outlierPenalty * config.shapeSimilarity.outlierWeight)
    );
  }

  return similarity;
}

/**
 * 计算维度一致性
 * 使用平滑的评分函数，避免硬阈值
 */
function calculateDimensionalConsistency(
  cuboids: Cuboid[],
  config: GeometricConfig,
): number {
  if (cuboids.length <= 1) return 100;

  // 计算每个维度的变异系数
  const widths = cuboids.map((c) => Math.max(0.0001, c.width));
  const heights = cuboids.map((c) => Math.max(0.0001, c.height));
  const depths = cuboids.map((c) => Math.max(0.0001, c.depth));

  function calculateVariationCoefficient(values: number[]): number {
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    if (avg <= 0) return Infinity;

    const variance =
      values.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / values.length;
    const stdDev = Math.sqrt(Math.max(0, variance));
    return stdDev / avg;
  }

  const cvWidth = calculateVariationCoefficient(widths);
  const cvHeight = calculateVariationCoefficient(heights);
  const cvDepth = calculateVariationCoefficient(depths);

  // 取最大的变异系数，使用平滑的评分函数
  const maxCV = Math.max(cvWidth, cvHeight, cvDepth);

  // 如果变异系数无效或过大，返回最低分
  if (
    !Number.isFinite(maxCV) ||
    maxCV > config.dimensionalConsistency.maxCV * 2
  ) {
    return config.dimensionalConsistency.minResidualScore;
  }

  return cvScore(
    maxCV,
    config.dimensionalConsistency.maxCV,
    config.dimensionalConsistency,
  );
}

/**
 * 计算几何平衡评分
 */
export function calculateGeometricBalance(
  cuboids: Cuboid[],
  config: GeometricConfig = DEFAULT_CONFIG,
): number {
  // 处理边界情况
  if (cuboids.length === 0) return 0;
  if (cuboids.length === 1) return 100;

  // 1. 体积平衡性评分
  const volumes = cuboids.map((c) =>
    Math.max(0.0001, c.width * c.height * c.depth),
  );
  const maxVolume = Math.max(...volumes);
  const minVolume = Math.min(...volumes);
  const volumeRatio = maxVolume > 0 ? minVolume / maxVolume : 1;

  // 使用sigmoid函数计算体积平衡分数
  const volumeScore = Number.isFinite(volumeRatio)
    ? sigmoid(
        volumeRatio,
        config.volume.midScoreThreshold,
        config.volume.sigmoidSteepness * (1 - config.volume.lowScoreThreshold),
      )
    : 0;

  // 2. 长宽比评分（考虑三维关系）
  const ratioScores = cuboids.map((c) => {
    const { longestToShortest, middleToShortest, longestToMiddle } =
      calculate3DRatio(c);

    // 计算各维度比例得分
    const longestToShortestScore = Math.max(
      0,
      100 -
        Math.pow(
          Math.abs(longestToShortest - config.aspectRatio.optimalRatio) *
            ASPECT_RATIO.SCORE_MULTIPLIER,
          ASPECT_RATIO.SCORE_EXPONENT,
        ),
    );

    const middleToShortestScore = Math.max(
      0,
      100 -
        Math.pow(
          Math.abs(middleToShortest - config.aspectRatio.optimalRatio * 0.8) *
            ASPECT_RATIO.SCORE_MULTIPLIER,
          ASPECT_RATIO.SCORE_EXPONENT,
        ),
    );

    const longestToMiddleScore = Math.max(
      0,
      100 -
        Math.pow(
          Math.abs(longestToMiddle - config.aspectRatio.optimalRatio * 0.6) *
            ASPECT_RATIO.SCORE_MULTIPLIER,
          ASPECT_RATIO.SCORE_EXPONENT,
        ),
    );

    // 计算加权得分
    let weightedScore =
      longestToShortestScore * ASPECT_RATIO.WEIGHTS.LONGEST_TO_SHORTEST +
      middleToShortestScore * ASPECT_RATIO.WEIGHTS.MIDDLE_TO_SHORTEST +
      longestToMiddleScore * ASPECT_RATIO.WEIGHTS.LONGEST_TO_MIDDLE;

    // 对极端情况进行惩罚
    if (
      longestToShortest > config.aspectRatio.maxRatio ||
      middleToShortest > config.aspectRatio.maxRatio * 0.8 ||
      longestToMiddle > config.aspectRatio.maxRatio * 0.6
    ) {
      const maxRatio = Math.max(
        longestToShortest / config.aspectRatio.maxRatio,
        middleToShortest / (config.aspectRatio.maxRatio * 0.8),
        longestToMiddle / (config.aspectRatio.maxRatio * 0.6),
      );
      weightedScore *= Math.pow(ASPECT_RATIO.EXTREME_PENALTY.BASE, maxRatio);
    }

    return weightedScore;
  });
  const aspectRatioScore =
    ratioScores.reduce((a, b) => a + b, 0) / cuboids.length;

  // 3. 形状相似度评分
  const shapePairs: Array<{ c1: Cuboid; c2: Cuboid }> = [];
  for (let i = 0; i < cuboids.length; i++) {
    for (let j = i + 1; j < cuboids.length; j++) {
      shapePairs.push({ c1: cuboids[i]!, c2: cuboids[j]! });
      if (shapePairs.length >= config.shapeSimilarity.maxComparisons) break;
    }
    if (shapePairs.length >= config.shapeSimilarity.maxComparisons) break;
  }

  const similarities = shapePairs.map(({ c1, c2 }) =>
    calculateShapeSimilarity(c1, c2, config),
  );
  const shapeSimilarityScore =
    similarities.length > 0
      ? (similarities.reduce((a, b) => a + b, 0) / similarities.length) * 100
      : 100;

  // 4. 维度一致性评分
  const dimensionalConsistencyScore = calculateDimensionalConsistency(
    cuboids,
    config,
  );

  // 5. 计算加权总分，对极端情况进行额外惩罚
  const scores = [
    { score: volumeScore, weight: config.weights.volume },
    { score: aspectRatioScore, weight: config.weights.aspectRatio },
    { score: shapeSimilarityScore, weight: config.weights.shapeSimilarity },
    {
      score: dimensionalConsistencyScore,
      weight: config.weights.dimensionalConsistency,
    },
  ];

  // 找出极端低分项
  const extremelyLowScores = scores.filter(
    (s) => s.score < SHAPE_SIMILARITY.EXTREME_PENALTY.THRESHOLD,
  );

  // 基础加权分数
  let totalScore = scores.reduce(
    (acc, { score, weight }) => acc + score * weight,
    0,
  );

  // 如果有极端低分，进行额外惩罚
  if (extremelyLowScores.length > 0) {
    const penaltyFactor = Math.pow(
      SHAPE_SIMILARITY.EXTREME_PENALTY.BASE,
      extremelyLowScores.length,
    );
    totalScore *= penaltyFactor;
  }

  return Math.max(0, Math.min(100, totalScore));
}
