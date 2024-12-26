/**
 * 形状相似性评分系统
 *
 * 评分维度：
 * 1. 维度差异（DimensionDiff）
 *    - 计算各方向维度差异
 *    - 越小越好
 *
 * 2. 极端指数（ExtremeIndex）
 *    - 识别显著的形状差异
 *    - 越小越好
 *
 * 3. 交换比率（SwapRatio）
 *    - 评估维度交换的影响
 *    - 越小越好
 */

import {
  createNormalizer,
  getTopAlignedCuboidsLayout,
  PARAM_PREFIX,
  type BaseCuboid,
} from "../shared";
import {
  getShapeSimilarityScore,
  SHAPE_SIMILARITY_BEST_PARAMS,
} from "../../optimizer/shape-similarity";

/**
 * 维度差异
 *
 * @param cuboids - 一组立方体
 * @returns {number} 维度差异
 */
function getDimensionDiff(cuboids: BaseCuboid[]): number {
  const layout = getTopAlignedCuboidsLayout(cuboids);

  // 1. 计算每个立方体的维度比例
  const dimensionRatios = layout.map((cuboid) => {
    const { width, height, depth } = cuboid.dimensions;
    const maxDim = Math.max(width, height, depth);
    const minDim = Math.min(width, height, depth);
    return maxDim / minDim;
  });

  // 2. 计算维度比例的变异系数
  const mean =
    dimensionRatios.reduce((sum, ratio) => sum + ratio, 0) /
    dimensionRatios.length;
  const variance =
    dimensionRatios.reduce((sum, ratio) => sum + Math.pow(ratio - mean, 2), 0) /
    dimensionRatios.length;

  return Math.sqrt(variance) / mean; // 返回相对标准差
}

/**
 * 极端指数
 *
 * @param cuboids - 一组立方体
 * @returns {number} 极端指数
 */
function getExtremeIndex(cuboids: BaseCuboid[]): number {
  const layout = getTopAlignedCuboidsLayout(cuboids);

  // 1. 计算每个立方体的极端程度
  const extremeScores = layout.map((cuboid) => {
    const { width, height, depth } = cuboid.dimensions;
    const dims = [width, height, depth];
    const maxDim = Math.max(...dims);
    const minDim = Math.min(...dims);
    const medianDim = dims.sort((a, b) => a - b)[1];

    if (!medianDim) {
      return 0;
    }

    // 计算最大与中值的比例，以及中值与最小的比例
    const upperRatio = maxDim / medianDim;
    const lowerRatio = medianDim / minDim;

    return Math.max(upperRatio, lowerRatio);
  });

  // 2. 返回极端比例的平均值
  return (
    extremeScores.reduce((sum, score) => sum + score, 0) /
      extremeScores.length -
    1
  );
}

/**
 * 交换比率
 *
 * @param cuboids - 一组立方体
 * @returns {number} 交换比率
 */
function getSwapRatio(cuboids: BaseCuboid[]): number {
  const layout = getTopAlignedCuboidsLayout(cuboids);

  // 1. 计算主导方向
  const getDominantAxis = (dimensions: {
    width: number;
    height: number;
    depth: number;
  }) => {
    const { width, height, depth } = dimensions;
    if (width >= height && width >= depth) return "width";
    if (height >= width && height >= depth) return "height";
    return "depth";
  };

  // 2. 计算方向变化的次数
  let directionChanges = 0;
  let totalComparisons = 0;

  for (let i = 0; i < layout.length; i++) {
    for (let j = i + 1; j < layout.length; j++) {
      const cuboid1 = layout[i];
      const cuboid2 = layout[j];
      if (!cuboid1 || !cuboid2) {
        continue;
      }
      const axis1 = getDominantAxis(cuboid1.dimensions);
      const axis2 = getDominantAxis(cuboid2.dimensions);

      if (axis1 !== axis2) {
        directionChanges++;
      }
      totalComparisons++;
    }
  }

  // 3. 返回方向变化的比率
  return totalComparisons === 0 ? 0 : directionChanges / totalComparisons;
}

/**
 * 归一化形状相似度
 */
const shapeSimilarityNormalizer = {
  dimensionDiff: createNormalizer({
    prefix: PARAM_PREFIX.DIMENSION_DIFF,
    inverse: true, // 越小越好
  }),
  extremeIndex: createNormalizer({
    prefix: PARAM_PREFIX.EXTREME_INDEX,
    inverse: true, // 越小越好
  }),
  swapRatio: createNormalizer({
    prefix: PARAM_PREFIX.SWAP_RATIO,
    inverse: true, // 越小越好
  }),
};

/**
 * 计算形状相似度得分
 *
 * @param cuboids - 一组立方体
 * @param bestParams - 最佳参数
 * @returns {number} 形状相似度得分
 */
function scorer(
  cuboids: BaseCuboid[],
  bestParams = SHAPE_SIMILARITY_BEST_PARAMS,
): number {
  const dimensionDiff = getDimensionDiff(cuboids);
  const extremeIndex = getExtremeIndex(cuboids);
  const swapRatio = getSwapRatio(cuboids);
  const normalizedMetrics = {
    dimensionDiff: shapeSimilarityNormalizer.dimensionDiff(
      dimensionDiff,
      bestParams,
    ),
    extremeIndex: shapeSimilarityNormalizer.extremeIndex(
      extremeIndex,
      bestParams,
    ),
    swapRatio: shapeSimilarityNormalizer.swapRatio(swapRatio, bestParams),
  };
  return getShapeSimilarityScore(normalizedMetrics, bestParams);
}

export { scorer as shapeSimilarityScorer };
