import { calculateMinArea } from "@/lib/quote-price/mold/layout/min-area";
import {
  getDistanceDistributionScore,
  DISTANCE_DISTRIBUTION_BEST_PARAMS,
  type DistanceDistributionInput,
} from "../optimizer/distance-distribution";
import type { BaseCuboid } from "../types";

// 变异系数 (CV)
// CV = 0 表示完全均匀分布
// CV 越小越好，表示距离分布越均匀
// 测试用例中 0.01 是一个很好的值
// 极差比 (Range)
// 最大距离与最小距离的比值
// 比值越接近 1 越好

interface CuboidLayout {
  dimensions: {
    width: number; // x
    depth: number; // y
    height: number; // z
  };
  center: {
    x: number;
    y: number;
    z: number;
  };
  index: number; // 保留原始索引
}

/**
 * 获取3D布局结果
 *
 * @param cuboids - 一组立方体
 * @returns {CuboidLayout[]} 3D布局结果
 */
function getCuboidsLayout(cuboids: BaseCuboid[]): CuboidLayout[] {
  // 获取2D布局（xy平面）
  const xyLayout = calculateMinArea(
    cuboids.map((cuboid) => ({
      width: cuboid.width,
      height: cuboid.depth, // 注意这里用 depth 作为 2D 布局的 height
    })),
  ).layout;

  // 转换为3D布局
  return xyLayout.map((rect): CuboidLayout => {
    const originalCuboid = cuboids[rect.index];

    if (!originalCuboid) {
      throw new Error("Original cuboid not found");
    }

    // 处理xy平面的旋转
    const dimensions = {
      width: rect.rotated ? originalCuboid.depth : originalCuboid.width,
      depth: rect.rotated ? originalCuboid.width : originalCuboid.depth,
      height: originalCuboid.height,
    };

    return {
      dimensions,
      center: {
        x: rect.center.x,
        y: rect.center.y,
        z: dimensions.height / 2, // 默认放置在 z=0 平面上
      },
      index: rect.index,
    };
  });
}

/**
 * 计算两个立方体中心点之间的欧氏距离
 */
function calculate3DDistance(
  point1: CuboidLayout["center"],
  point2: CuboidLayout["center"],
): number {
  return Math.sqrt(
    Math.pow(point2.x - point1.x, 2) +
      Math.pow(point2.y - point1.y, 2) +
      Math.pow(point2.z - point1.z, 2),
  );
}

/**
 * 计算布局的距离分布指标
 *
 * @param layout - 3D布局
 * @returns {DistanceDistributionInput} 距离分布指标
 */
function calculateDistributionMetrics(
  layout: CuboidLayout[],
): DistanceDistributionInput {
  // 计算所有立方体之间的距离
  const distances: number[] = [];
  for (let i = 0; i < layout.length; i++) {
    for (let j = i + 1; j < layout.length; j++) {
      const p1 = layout[i];
      const p2 = layout[j];
      if (!p1 || !p2) {
        continue;
      }
      const distance = calculate3DDistance(p1.center, p2.center);
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
 * 计算距离分布得分
 *
 * @param cuboids - 一组立方体
 * @param bestParams - 最佳参数
 * @returns {number} 距离分布得分
 */
function scorer(
  cuboids: BaseCuboid[],
  bestParams = DISTANCE_DISTRIBUTION_BEST_PARAMS,
): number {
  const layout = getCuboidsLayout(cuboids);
  const metrics = calculateDistributionMetrics(layout);
  return getDistanceDistributionScore(metrics, bestParams);
}

export { scorer as distanceDistributionScorer };
