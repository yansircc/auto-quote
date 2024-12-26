/**
 * 间距均匀性评分系统
 *
 * 评分维度：
 * 1. 相邻距离分析
 *    - 计算相邻长方体之间的距离
 *    - 评估间距的标准差
 *    - 确保组件之间的一致间隙
 *
 * 2. 方向一致性
 *    - 分析X、Y、Z方向的间距
 *    - 保持不同轴向上的均匀间隙
 *    - 考虑操作和散热空间要求
 */

import {
  createNormalizer,
  getTopAlignedCuboidsLayout,
  PARAM_PREFIX,
  type BaseCuboid,
} from "../shared";
import {
  getSpacingUniformityScore,
  SPACING_UNIFORMITY_BEST_PARAMS,
} from "../../optimizer/spacing-uniformity";

/**
 * 获取间距均匀性指标
 *
 * @param cuboids - 一组立方体
 * @returns {number, number} 相邻距离，方向一致性
 */
function getSpacingUniformityMetrics(cuboids: BaseCuboid[]): {
  distance: number;
  directional: number;
} {
  const layout = getTopAlignedCuboidsLayout(cuboids);

  if (layout.length < 2) {
    return {
      distance: 0,
      directional: 0,
    };
  }

  // 1. 计算相邻距离的均匀性
  function calculateDistanceUniformity(): number {
    const distances: number[] = [];

    for (let i = 0; i < layout.length; i++) {
      for (let j = i + 1; j < layout.length; j++) {
        const cube1 = layout[i];
        const cube2 = layout[j];

        if (!cube1 || !cube2) continue;

        // 计算中心点距离
        const dx =
          cube1.position.x +
          cube1.dimensions.width / 2 -
          (cube2.position.x + cube2.dimensions.width / 2);
        const dy =
          cube1.position.y +
          cube1.dimensions.depth / 2 -
          (cube2.position.y + cube2.dimensions.depth / 2);
        const dz =
          cube1.position.z +
          cube1.dimensions.height / 2 -
          (cube2.position.z + cube2.dimensions.height / 2);

        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
        distances.push(distance);
      }
    }

    // 计算距离的变异系数
    const mean = distances.reduce((sum, d) => sum + d, 0) / distances.length;
    const variance =
      distances.reduce((sum, d) => sum + Math.pow(d - mean, 2), 0) /
      distances.length;

    return Math.sqrt(variance) / mean; // 返回相对标准差
  }

  // 2. 计算方向一致性
  function calculateDirectionalUniformity(): number {
    const axisGaps = {
      x: [] as number[],
      y: [] as number[],
      z: [] as number[],
    };

    // 收集每个轴向上的间隙
    for (let i = 0; i < layout.length; i++) {
      for (let j = i + 1; j < layout.length; j++) {
        const cube1 = layout[i];
        const cube2 = layout[j];

        if (!cube1 || !cube2) continue;

        // X轴间隙
        const xGap = Math.abs(
          cube2.position.x +
            cube2.dimensions.width / 2 -
            (cube1.position.x + cube1.dimensions.width / 2),
        );

        // Y轴间隙
        const yGap = Math.abs(
          cube2.position.y +
            cube2.dimensions.depth / 2 -
            (cube1.position.y + cube1.dimensions.depth / 2),
        );

        // Z轴间隙
        const zGap = Math.abs(
          cube2.position.z +
            cube2.dimensions.height / 2 -
            (cube1.position.z + cube1.dimensions.height / 2),
        );

        if (xGap > 0) axisGaps.x.push(xGap);
        if (yGap > 0) axisGaps.y.push(yGap);
        if (zGap > 0) axisGaps.z.push(zGap);
      }
    }

    // 计算每个轴向的平均间隙
    const axisMeans = {
      x: axisGaps.x.length
        ? axisGaps.x.reduce((sum, g) => sum + g, 0) / axisGaps.x.length
        : 0,
      y: axisGaps.y.length
        ? axisGaps.y.reduce((sum, g) => sum + g, 0) / axisGaps.y.length
        : 0,
      z: axisGaps.z.length
        ? axisGaps.z.reduce((sum, g) => sum + g, 0) / axisGaps.z.length
        : 0,
    };

    // 计算轴向间隙的变异系数
    const means = Object.values(axisMeans).filter((m) => m > 0);
    if (means.length < 2) return 0;

    const meanOfMeans = means.reduce((sum, m) => sum + m, 0) / means.length;
    const variance =
      means.reduce((sum, m) => sum + Math.pow(m - meanOfMeans, 2), 0) /
      means.length;

    return Math.sqrt(variance) / meanOfMeans; // 返回相对标准差
  }

  return {
    distance: calculateDistanceUniformity(),
    directional: calculateDirectionalUniformity(),
  };
}

/**
 * 归一化形状相似度
 */
const spacingUniformityNormalizer = {
  distance: createNormalizer({
    prefix: PARAM_PREFIX.DISTANCE,
    inverse: true, // 越小越好
  }),
  directional: createNormalizer({
    prefix: PARAM_PREFIX.DIRECTIONAL,
    inverse: true, // 越小越好
  }),
};

/**
 * 计算间距均匀性得分
 *
 * @param cuboids - 一组立方体
 * @param bestParams - 最佳参数
 * @returns {number} 间距均匀性得分
 */
function scorer(
  cuboids: BaseCuboid[],
  bestParams = SPACING_UNIFORMITY_BEST_PARAMS,
): number {
  const metrics = getSpacingUniformityMetrics(cuboids);
  const normalizedMetrics = {
    distance: spacingUniformityNormalizer.distance(
      metrics.distance,
      bestParams,
    ),
    directional: spacingUniformityNormalizer.directional(
      metrics.directional,
      bestParams,
    ),
  };
  return getSpacingUniformityScore(normalizedMetrics, bestParams);
}

export { scorer as spacingUniformityScorer };
