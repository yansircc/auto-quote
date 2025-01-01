/**
 * 位置分布评分系统
 *
 * 评分维度：
 * 1. 位置偏差（Deviation）
 *    - 计算长方体中心点与包围盒中心点的距离
 *    - 距离越小 => 分布越集中 => 更均匀
 *
 * 2. 重心高度（Center Height）
 *    - 计算所有立方体的体积加权重心高度
 *    - 归一化到 [0,1]
 *    - 值越小，表示整体重心更低，也可解释为“分布更均匀”
 *
 * 注：如果需要考虑“被挖去的部分”，请确保传入的 cuboids 已经是
 *     最终保留的实际体积与位置，而不是原始未挖空时的立方体。
 */

import { getBoundingBox, createNormalizer } from "../shared";
import type { CuboidLayout } from "../shared";
import {
  getPositionDistributionScore,
  POSITION_DISTRIBUTION_BEST_PARAMS,
} from "../../optimizer/position-distribution";
import { PARAM_PREFIX } from "../../optimizer";

/**
 * 计算位置偏差 (Deviation)
 * - 使用包围盒计算中心点
 * - 对每个立方体，计算其中心点
 * - 求与包围盒中心的欧几里得距离
 * - 取距离的平均值并归一化(除以半对角线)，返回 0~1 的数值
 *
 * @param {CuboidLayout[]} layout - 立方体布局
 * @returns {number} 位置偏差评分
 */
function getDeviation(layout: CuboidLayout[]): number {
  if (!layout.length) return 0;

  // 2. 计算包围盒
  const boundingBox = getBoundingBox(layout);

  // 3. 计算包围盒中心点（仅考虑 X/Y 平面）
  const centerX = boundingBox.position.x + boundingBox.dimensions.width / 2;
  const centerY = boundingBox.position.y + boundingBox.dimensions.depth / 2;

  // 4. 计算每个立方体中心与包围盒中心的距离
  const distances = layout.map((cuboid) => {
    const cuboidCenterX = cuboid.position.x + cuboid.dimensions.width / 2;
    const cuboidCenterY = cuboid.position.y + cuboid.dimensions.depth / 2;

    const dx = cuboidCenterX - centerX;
    const dy = cuboidCenterY - centerY;
    return Math.sqrt(dx * dx + dy * dy);
  });

  // 5. 距离平均值，并归一化到 [0,1]
  //    最大可能距离 = 包围盒对角线 / 2
  const maxPossibleDistance =
    Math.sqrt(
      boundingBox.dimensions.width ** 2 + boundingBox.dimensions.depth ** 2,
    ) / 2;

  const meanDistance =
    distances.reduce((sum, d) => sum + d, 0) / distances.length;

  return maxPossibleDistance > 0 ? meanDistance / maxPossibleDistance : 0;
}

/**
 * 计算重心高度 (Center Height)
 * - 每个立方体视为体积 = w × d × h
 * - 在笛卡尔坐标系中，z 轴向上为正，但立方体从 z=0 向下延伸
 * - 整体重心 = (Σ(体积 × centerZ)) / (Σ体积)
 * - 归一化到 [0,1]，0 表示重心在底部，1 表示重心在顶部
 *
 * @param {CuboidLayout[]} layout - 立方体布局
 * @returns {number} 重心高度评分
 */
function getCenterHeight(layout: CuboidLayout[]): number {
  if (!layout.length) return 0;

  const boundingBox = getBoundingBox(layout);

  // 1. 累加每个立方体的 (volume, centerZ)
  const volumesAndCenters = layout.map((cuboid) => {
    const volume =
      cuboid.dimensions.width *
      cuboid.dimensions.depth *
      cuboid.dimensions.height;
    // z 坐标是负的，中心点在 position.z + height/2
    const centerZ = cuboid.position.z + cuboid.dimensions.height / 2;
    return { volume, centerZ };
  });

  // 2. 总体积
  const totalVolume = volumesAndCenters.reduce(
    (sum, item) => sum + item.volume,
    0,
  );

  if (totalVolume === 0) return 0;

  // 3. 加权平均高度
  const weightedSum = volumesAndCenters.reduce(
    (sum, item) => sum + item.volume * item.centerZ,
    0,
  );
  const weightedCenterZ = weightedSum / totalVolume;

  // 4. 归一化到 [0,1]
  // 由于 z 是负的，需要调整计算方式
  // boundingBox.position.z 是最低点（最负的值）
  // 0 是最高点
  const totalHeight = Math.abs(boundingBox.position.z);
  if (totalHeight === 0) return 0;

  // 将负的 z 值映射到 [0,1]，其中：
  // 0（顶部）映射到 1
  // 最低点映射到 0
  return 1 - Math.abs(weightedCenterZ) / totalHeight;
}

/**
 * 归一化位置分布评分
 */
const positionDistributionNormalizer = {
  deviation: createNormalizer({
    prefix: PARAM_PREFIX.DEVIATION,
    inverse: true, // 越小越好
  }),
  height: createNormalizer({
    prefix: PARAM_PREFIX.HEIGHT,
    inverse: true, // 越小越好
  }),
};

/**
 * 获取位置分布评分
 *
 * @param {CuboidLayout[]} optimizedCuboidsLayout - 立方体布局
 * @param bestParams - 最佳参数
 * @returns {number} 评分
 */
export function scorer(
  optimizedCuboidsLayout: CuboidLayout[],
  bestParams = POSITION_DISTRIBUTION_BEST_PARAMS,
): number {
  const metrics = {
    deviation: getDeviation(optimizedCuboidsLayout),
    height: getCenterHeight(optimizedCuboidsLayout),
  };

  // 归一化
  const normalizedMetrics = {
    deviation: positionDistributionNormalizer.deviation(
      metrics.deviation,
      bestParams,
    ),
    height: positionDistributionNormalizer.height(metrics.height, bestParams),
  };

  // 假定这两个指标都是“越小越好”，则由 getPositionDistributionScore
  // 来做相应映射 => 最终得到一个综合评分(0~100 或其他范围)
  const score = getPositionDistributionScore(normalizedMetrics, bestParams);

  // 调试日志可选
  // console.log("Deviation:", deviation.toFixed(4));
  // console.log("CenterHeight:", height.toFixed(4));
  // console.log("Position Distribution Score:", score.toFixed(2));

  return score;
}

// 取一个别名以便引用
export { scorer as positionDistributionScorer };
