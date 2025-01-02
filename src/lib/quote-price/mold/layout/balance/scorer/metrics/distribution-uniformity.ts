/**
 * 分布均匀度评分系统
 *
 * 评分维度：
 * 1. 网格方差（Grid Variance）
 *    - 计算每个网格单元的覆盖率
 *    - 衡量各网格单元覆盖率的方差
 *    - 越小越均匀
 *
 * 2. 密度变化（Density Change）
 *    - 计算相邻网格单元覆盖率的差异
 *    - 衡量覆盖率变化的均匀程度
 *    - 越小越均匀
 */

import { createNormalizer } from "../shared";
import type { CuboidLayout } from "../../../types";
import {
  getDistributionUniformityScore,
  DISTRIBUTION_UNIFORMITY_BEST_PARAMS,
} from "../../optimizer/distribution-uniformity";
import { PARAM_PREFIX } from "../../optimizer";

/**
 * 计算某立方体在 gridX, gridY 网格（共 gridSize×gridSize）中的覆盖率 [0, 1]
 * @param {CuboidLayout} cuboid - 立方体
 * @param {number} gridX - 网格 x 坐标
 * @param {number} gridY - 网格 y 坐标
 * @param {number} cellSize - 网格单元尺寸
 * @returns {number} 覆盖率 [0, 1]
 */
function calculateCoverage(
  cuboid: CuboidLayout,
  gridX: number,
  gridY: number,
  cellSize: number,
): number {
  // 计算网格单元的边界
  const cellLeft = gridX * cellSize;
  const cellRight = (gridX + 1) * cellSize;
  const cellBottom = gridY * cellSize;
  const cellTop = (gridY + 1) * cellSize;

  // 计算立方体的边界
  const cuboidLeft = cuboid.position.x;
  const cuboidRight = cuboid.position.x + cuboid.dimensions.width;
  const cuboidBottom = cuboid.position.y;
  const cuboidTop = cuboid.position.y + cuboid.dimensions.depth;

  // 计算重叠区域
  const overlapX = Math.max(
    0,
    Math.min(cellRight, cuboidRight) - Math.max(cellLeft, cuboidLeft),
  );
  const overlapY = Math.max(
    0,
    Math.min(cellTop, cuboidTop) - Math.max(cellBottom, cuboidBottom),
  );

  // 返回重叠面积占网格单元面积的比例
  return (overlapX * overlapY) / (cellSize * cellSize);
}

/**
 * 计算网格方差（此处返回"标准差"或"方差"都可以）
 * - 网格划分为 10×10
 * - 统计每个网格单元的叠加覆盖率
 * - 计算各网格单元覆盖率的方差
 * - 最终返回"标准差"以表征分布离散程度：越小越均匀
 *
 * @param {CuboidLayout[]} layout - 立方体布局
 * @returns {number} 标准差
 */
function calculateGridVariance(layout: CuboidLayout[]): number {
  const gridSize = 10;
  const grid: number[][] = Array(gridSize)
    .fill(0)
    .map(() => Array(gridSize).fill(0) as number[]);

  // 计算每个网格单元的覆盖率
  layout.forEach((cuboid) => {
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        const coverage = calculateCoverage(cuboid, x, y, gridSize);
        if (coverage > 0) {
          const current = grid[y]?.[x];
          if (!current) continue;
          // 允许累加，但最大不超过 1
          grid[y]![x] = Math.min(1, current + coverage);
        }
      }
    }
  });

  // 计算覆盖率的方差
  const values = grid.flat();
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  const variance =
    values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;

  const stdDev = Math.sqrt(variance);

  // 如果想返回"真正的方差"，换成 `return variance;`
  return stdDev; // 标准差
}

/**
 * 计算密度变化 (densityChange)
 * - 依旧划分 10×10 网格
 * - 每格累加覆盖率
 * - 衡量相邻格之间的覆盖差异均值，越小表示越平滑、越均匀
 *
 * @param {CuboidLayout[]} layout - 立方体布局
 * @returns {number} 密度变化
 */
function calculateDensityChange(layout: CuboidLayout[]): number {
  const gridSize = 10;
  const totalSize = 300;
  const cellSize = totalSize / gridSize;
  const densityChanges: number[] = [];

  // 计算各格的累加覆盖率
  const gridDensities: number[][] = Array(gridSize)
    .fill(0)
    .map(() => Array(gridSize).fill(0) as number[]);

  layout.forEach((cuboid) => {
    // 计算立方体在网格中的范围
    const leftX = Math.max(0, Math.floor(cuboid.position.x / cellSize));
    const rightX = Math.min(
      gridSize - 1,
      Math.ceil((cuboid.position.x + cuboid.dimensions.width) / cellSize),
    );
    const bottomY = Math.max(0, Math.floor(cuboid.position.y / cellSize));
    const topY = Math.min(
      gridSize - 1,
      Math.ceil((cuboid.position.y + cuboid.dimensions.depth) / cellSize),
    );

    // 遍历覆盖的网格
    for (let y = bottomY; y <= topY; y++) {
      for (let x = leftX; x <= rightX; x++) {
        const coverage = calculateCoverage(cuboid, x, y, cellSize);
        if (coverage > 0) {
          const current = gridDensities[y]?.[x];
          if (current === undefined) continue;
          gridDensities[y]![x] = Math.min(1, current + coverage);
        }
      }
    }
  });

  // 计算相邻格之间的差值
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      // 水平相邻
      if (x < gridSize - 1) {
        const current = gridDensities[y]?.[x];
        const next = gridDensities[y]?.[x + 1];
        if (!current || !next) continue;
        const diff = Math.abs(current - next);
        if (current > 0 || next > 0) {
          densityChanges.push(diff);
        }
      }
      // 垂直相邻
      if (y < gridSize - 1) {
        const current = gridDensities[y]?.[x];
        const next = gridDensities[y + 1]?.[x];
        if (!current || !next) continue;
        const diff = Math.abs(current - next);
        if (current > 0 || next > 0) {
          densityChanges.push(diff);
        }
      }
    }
  }

  // 取这些差异的平均值作为"密度变化"
  return densityChanges.length > 0
    ? densityChanges.reduce((sum, diff) => sum + diff, 0) /
        densityChanges.length
    : 0;
}

/**
 * 计算集群指数 (clusterIndex)
 * - 越小越表示越"稀疏"（或更均匀、没抱团）
 * - 这里的思路是：立方体之间的距离越大 -> clusterIndex 越小
 *
 * @param {CuboidLayout[]} layout - 立方体布局
 * @returns {number} 集群指数
 */
function calculateClusterIndex(layout: CuboidLayout[]): number {
  if (layout.length < 2) return 0;

  const clusterMetrics: number[] = [];

  layout.forEach((c1, i) => {
    let minOverlapRatio = Infinity;
    let hasValidNeighbor = false;

    layout.forEach((c2, j) => {
      if (i !== j) {
        // 使用左下角坐标计算边界
        const c1Left = c1.position.x;
        const c1Right = c1.position.x + c1.dimensions.width;
        const c1Back = c1.position.y;
        const c1Front = c1.position.y + c1.dimensions.depth;

        const c2Left = c2.position.x;
        const c2Right = c2.position.x + c2.dimensions.width;
        const c2Back = c2.position.y;
        const c2Front = c2.position.y + c2.dimensions.depth;

        // 计算 XY 平面上的最短距离
        const xDistance = Math.max(
          0,
          Math.min(Math.abs(c1Left - c2Right), Math.abs(c1Right - c2Left)),
        );
        const yDistance = Math.max(
          0,
          Math.min(Math.abs(c1Back - c2Front), Math.abs(c1Front - c2Back)),
        );

        // 实际距离
        const distance = Math.sqrt(xDistance ** 2 + yDistance ** 2);

        // 用平均对角线长度做归一化
        const avgSize =
          (Math.sqrt(c1.dimensions.width ** 2 + c1.dimensions.depth ** 2) +
            Math.sqrt(c2.dimensions.width ** 2 + c2.dimensions.depth ** 2)) /
          2;

        // 避免除 0
        const clusterRatio =
          avgSize > 0 ? Math.max(0.001, distance) / avgSize : Infinity;

        if (Number.isFinite(clusterRatio)) {
          minOverlapRatio = Math.min(minOverlapRatio, clusterRatio);
          hasValidNeighbor = true;
        }
      }
    });

    if (hasValidNeighbor && Number.isFinite(minOverlapRatio)) {
      clusterMetrics.push(minOverlapRatio);
    }
  });

  if (clusterMetrics.length === 0) return 0;

  const avgRatio =
    clusterMetrics.reduce((sum, ratio) => sum + ratio, 0) /
    clusterMetrics.length;

  return avgRatio > 0 ? Math.min(1, 1 / avgRatio) : 0;
}

/**
 * 归一化分布均匀度
 */
const distributionUniformityNormalizer = {
  gridVariance: createNormalizer({
    prefix: PARAM_PREFIX.GRID_VARIANCE,
    inverse: true, // 越小越好
  }),
  densityChange: createNormalizer({
    prefix: PARAM_PREFIX.DENSITY_CHANGE,
    inverse: true, // 越小越好
  }),
  clusterIndex: createNormalizer({
    prefix: PARAM_PREFIX.CLUSTER_INDEX,
    inverse: false, // 越大越好
  }),
};

/**
 * 综合得分函数
 * - 计算 gridVariance, densityChange, clusterIndex
 * - 把这些指标传给 getDistributionUniformityScore
 * - 最终得到一个分布均匀度评分
 * @param {CuboidLayout[]} optimizedCuboidsLayout - 优化后的立方体布局
 * @param bestParams - 最佳参数
 * @returns 分布均匀度评分
 */
function scorer(
  optimizedCuboidsLayout: CuboidLayout[],
  bestParams = DISTRIBUTION_UNIFORMITY_BEST_PARAMS,
): number {
  const metrics = {
    // 这里改为返回"标准差"或直接返回"方差"，你可以自行调整
    gridVariance: calculateGridVariance(optimizedCuboidsLayout),

    // 保持原先逻辑
    densityChange: calculateDensityChange(optimizedCuboidsLayout),

    // 保持原先逻辑
    clusterIndex: calculateClusterIndex(optimizedCuboidsLayout),
  };

  // 做个安全兜底
  if (!Number.isFinite(metrics.clusterIndex)) {
    metrics.clusterIndex = 0;
  }

  const normalizedMetrics = {
    gridVariance: distributionUniformityNormalizer.gridVariance(
      metrics.gridVariance,
      bestParams,
    ),
    densityChange: distributionUniformityNormalizer.densityChange(
      metrics.densityChange,
      bestParams,
    ),
    clusterIndex: distributionUniformityNormalizer.clusterIndex(
      metrics.clusterIndex,
      bestParams,
    ),
  };

  // 最后交给你的打分函数
  // DISTRIBUTION_UNIFORMITY_BEST_PARAMS 通常是一组对这三个指标如何映射到 0~100 的参数
  const score = getDistributionUniformityScore(normalizedMetrics, bestParams);

  // 如果需要在此查看日志
  // console.log("Layout:", layout);
  // console.log("Metrics:", metrics);
  // console.log("Final Score:", score);

  return score;
}

export { scorer as distributionUniformityScorer };
