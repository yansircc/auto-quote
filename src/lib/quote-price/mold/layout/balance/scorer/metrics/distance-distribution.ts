/**
 * 距离分布评分系统
 *
 * 评分维度：
 * 1. 变异系数（CV）
 *    - 计算各方向距离的标准差与平均值的比值
 *    - 越小越均匀
 *
 * 2. 极差比（Range）
 *    - 计算各方向距离的最大值与最小值的比值
 *    - 越小越均匀
 */

import { createNormalizer } from "../shared";
import type { CuboidLayout } from "../shared";
import {
  getDistanceDistributionScore,
  DISTANCE_DISTRIBUTION_BEST_PARAMS,
} from "../../optimizer/distance-distribution";
import { PARAM_PREFIX } from "../../optimizer";

/**
 * 计算两个立方体中心点之间的欧氏距离
 *
 * @param {CuboidLayout} cuboid1 - 第一个立方体
 * @param {CuboidLayout} cuboid2 - 第二个立方体
 * @returns {number} 距离
 */
function calculate3DDistance(
  cuboid1: CuboidLayout,
  cuboid2: CuboidLayout,
): number {
  // 计算两个立方体的中心点
  const center1 = {
    x: cuboid1.position.x + cuboid1.dimensions.width / 2,
    y: cuboid1.position.y + cuboid1.dimensions.depth / 2,
    z: cuboid1.position.z + cuboid1.dimensions.height / 2,
  };

  const center2 = {
    x: cuboid2.position.x + cuboid2.dimensions.width / 2,
    y: cuboid2.position.y + cuboid2.dimensions.depth / 2,
    z: cuboid2.position.z + cuboid2.dimensions.height / 2,
  };

  // 计算欧氏距离
  return Math.sqrt(
    Math.pow(center2.x - center1.x, 2) +
      Math.pow(center2.y - center1.y, 2) +
      Math.pow(center2.z - center1.z, 2),
  );
}

/**
 * 计算布局的距离分布指标
 *
 * @param {CuboidLayout[]} layout - 3D布局
 * @returns { { cv: number, range: number } } 距离分布指标
 */
function getDistributionMetrics(layout: CuboidLayout[]): {
  cv: number;
  range: number;
} {
  // 计算所有立方体之间的距离
  const distances: number[] = [];
  for (let i = 0; i < layout.length; i++) {
    for (let j = i + 1; j < layout.length; j++) {
      const p1 = layout[i];
      const p2 = layout[j];
      if (!p1 || !p2) {
        continue;
      }
      const distance = calculate3DDistance(p1, p2);
      distances.push(distance);
    }
  }

  if (distances.length === 0) {
    return { cv: 0, range: 0 };
  }

  // 计算变异系数 (CV)
  const mean = distances.reduce((sum, d) => sum + d, 0) / distances.length;
  const variance =
    distances.reduce((sum, d) => sum + Math.pow(d - mean, 2), 0) /
    distances.length;
  const standardDeviation = Math.sqrt(variance);
  const cv = standardDeviation / mean;

  // 计算极差比
  const max = Math.max(...distances);
  const min = Math.min(...distances);
  const range = min > 0 ? (max - min) / min : 1; // 避免除以零

  return { cv, range };
}

/**
 * 归一化距离分布
 */
const distanceDistributionNormalizer = {
  cv: createNormalizer({
    prefix: PARAM_PREFIX.CV,
    inverse: true, // 越小越好
  }),
  range: createNormalizer({
    prefix: PARAM_PREFIX.RANGE,
    inverse: true, // 越小越好
  }),
};

/**
 * 计算距离分布得分
 *
 * @param {CuboidLayout[]} optimizedCuboidsLayout - 优化后的立方体布局
 * @param bestParams - 最佳参数
 * @returns {number} 距离分布得分
 */
function scorer(
  optimizedCuboidsLayout: CuboidLayout[],
  bestParams = DISTANCE_DISTRIBUTION_BEST_PARAMS,
): number {
  const metrics = getDistributionMetrics(optimizedCuboidsLayout);
  const normalizedMetrics = {
    cv: distanceDistributionNormalizer.cv(metrics.cv, bestParams),
    range: distanceDistributionNormalizer.range(metrics.range, bestParams),
  };
  return getDistanceDistributionScore(normalizedMetrics, bestParams);
}

export { scorer as distanceDistributionScorer };
