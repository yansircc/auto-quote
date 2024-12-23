import type { Point3D, Cuboid } from "./types";

/**
 * 流动平衡评分系统
 *
 * 评分维度：
 * 1. 重心距离分布 (50%)
 *    - 计算所有长方体的重心位置
 *    - 评估每个长方体到重心的距离
 *    - 计算距离的标准差和平均值
 *    - 标准差/平均值 < 0.25 得高分
 *    - 标准差/平均值 > 0.5 得0分
 *
 * 2. 重心位置评分 (30%)
 *    - 考虑每个长方体的权重
 *    - 评估重心位置的合理性
 *    - 重心应接近整体的几何中心
 *    - 避免重心过于偏离中心
 *
 * 3. 力矩平衡性 (20%)
 *    - 计算各个方向的力矩
 *    - 评估力矩的平衡程度
 *    - 考虑长方体的重量分布
 *    - 确保开模时的稳定性
 *
 * 注意事项：
 * 1. 不考虑长方体的形状特征（由几何平衡负责）
 * 2. 不考虑空间排列方式（由空间分布平衡负责）
 * 3. 主要关注重心位置和力的平衡
 * 4. 注重模具开合时的稳定性
 */

/**
 * 计算两点之间的距离
 */
function calculateDistance(p1: Point3D, p2: Point3D): number {
  return Math.sqrt(
    Math.pow(p2.x - p1.x, 2) +
      Math.pow(p2.y - p1.y, 2) +
      Math.pow(p2.z - p1.z, 2),
  );
}

/**
 * 计算一组立方体的重心
 */
function calculateCenterOfMass(cuboids: Cuboid[]): Point3D {
  const totalWeight = cuboids.reduce((sum, c) => sum + (c.weight ?? 1), 0);

  return {
    x:
      cuboids.reduce((sum, c) => sum + c.position.x * (c.weight ?? 1), 0) /
      totalWeight,
    y:
      cuboids.reduce((sum, c) => sum + c.position.y * (c.weight ?? 1), 0) /
      totalWeight,
    z:
      cuboids.reduce((sum, c) => sum + c.position.z * (c.weight ?? 1), 0) /
      totalWeight,
  };
}

/**
 * 计算几何中心（不考虑重量）
 */
function calculateGeometricCenter(cuboids: Cuboid[]): Point3D {
  const count = cuboids.length;
  return {
    x: cuboids.reduce((sum, c) => sum + c.position.x, 0) / count,
    y: cuboids.reduce((sum, c) => sum + c.position.y, 0) / count,
    z: cuboids.reduce((sum, c) => sum + c.position.z, 0) / count,
  };
}

/**
 * 计算重心距离分布得分
 */
function calculateDistanceDistributionScore(
  cuboids: Cuboid[],
  centerOfMass: Point3D,
): number {
  // 计算加权距离
  const weightedDistances = cuboids.map((c) => ({
    distance: calculateDistance(c.position, centerOfMass),
    weight: c.weight ?? 1,
  }));

  // 计算加权平均距离
  const totalWeight = weightedDistances.reduce((sum, d) => sum + d.weight, 0);
  const avgDistance =
    weightedDistances.reduce((sum, d) => sum + d.distance * d.weight, 0) /
    totalWeight;

  // 计算加权标准差
  const variance =
    weightedDistances.reduce(
      (sum, d) => sum + d.weight * Math.pow(d.distance - avgDistance, 2),
      0,
    ) / totalWeight;
  const standardDeviation = Math.sqrt(variance);

  // 计算变异系数（CV）
  const cv = standardDeviation / avgDistance;

  // CV < 0.25 得满分，CV > 0.5 得0分
  return Math.max(0, Math.min(100, 100 * (1 - (cv - 0.25) / 0.25)));
}

/**
 * 计算重心位置得分
 */
function calculateCenterPositionScore(
  centerOfMass: Point3D,
  geometricCenter: Point3D,
  boundingBoxSize: number,
): number {
  // 计算重心偏离几何中心的距离
  const deviation = calculateDistance(centerOfMass, geometricCenter);

  // 偏离距离不应超过包围盒尺寸的20%
  const maxAllowedDeviation = boundingBoxSize * 0.2;

  return Math.max(0, 100 * (1 - deviation / maxAllowedDeviation));
}

/**
 * 计算力矩平衡得分
 */
function calculateMomentBalance(
  cuboids: Cuboid[],
  centerOfMass: Point3D,
): number {
  // 计算各方向的力矩
  const moments = {
    x: 0,
    y: 0,
    z: 0,
  };

  cuboids.forEach((cuboid) => {
    const weight = cuboid.weight ?? 1;
    const dx = cuboid.position.x - centerOfMass.x;
    const dy = cuboid.position.y - centerOfMass.y;
    const dz = cuboid.position.z - centerOfMass.z;

    // 计算各轴的力矩（力臂 * 重量）
    moments.x += weight * Math.sqrt(dy * dy + dz * dz);
    moments.y += weight * Math.sqrt(dx * dx + dz * dz);
    moments.z += weight * Math.sqrt(dx * dx + dy * dy);
  });

  // 计算力矩的不平衡程度
  const maxMoment = Math.max(moments.x, moments.y, moments.z);
  const minMoment = Math.min(moments.x, moments.y, moments.z);

  // 如果最大力矩接近0，说明非常平衡
  if (maxMoment < 0.001) return 100;

  // 否则根据最小/最大力矩比例评分
  const momentRatio = minMoment / maxMoment;
  return Math.max(0, 100 * momentRatio);
}

/**
 * 计算包围盒的特征尺寸
 */
function calculateBoundingBoxSize(cuboids: Cuboid[]): number {
  const xs = cuboids.map((c) => c.position.x);
  const ys = cuboids.map((c) => c.position.y);
  const zs = cuboids.map((c) => c.position.z);

  const size = Math.max(
    Math.max(...xs) - Math.min(...xs),
    Math.max(...ys) - Math.min(...ys),
    Math.max(...zs) - Math.min(...zs),
  );

  return size || 1; // 避免除以0
}

/**
 * 计算流动平衡评分
 * @param cuboids 立方体列表，每个立方体必须包含位置信息
 * @returns 流动平衡评分 (0-100)
 * @throws 如果有立方体没有位置信息
 */
export function calculateFlowBalance(cuboids: Cuboid[]): number {
  // 处理边界情况
  if (cuboids.length === 0) {
    return 0;
  }

  if (cuboids.length === 1) {
    return 100;
  }

  // 确保所有立方体都有位置信息
  if (!cuboids.every((c) => c.position)) {
    throw new Error("所有立方体都必须包含位置信息");
  }

  // 1. 计算重心和几何中心
  const centerOfMass = calculateCenterOfMass(cuboids);
  const geometricCenter = calculateGeometricCenter(cuboids);
  const boundingBoxSize = calculateBoundingBoxSize(cuboids);

  // 2. 计算三个维度的得分
  const distanceScore = calculateDistanceDistributionScore(
    cuboids,
    centerOfMass,
  );
  const centerScore = calculateCenterPositionScore(
    centerOfMass,
    geometricCenter,
    boundingBoxSize,
  );
  const momentScore = calculateMomentBalance(cuboids, centerOfMass);

  // 3. 计算加权总分
  const finalScore =
    distanceScore * 0.5 + centerScore * 0.3 + momentScore * 0.2;

  // 4. 输出详细信息用于调试
  console.log("流动平衡详情:", {
    centerOfMass,
    geometricCenter,
    boundingBoxSize,
    scores: {
      distanceScore,
      centerScore,
      momentScore,
      finalScore,
    },
  });

  return finalScore;
}
