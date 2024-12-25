import type { Cuboid, PhysicalProperties, Point3D } from "./types";
import { calculateMean } from "./statistics";

/**
 * 计算两点之间的距离
 */
function calculateDistance(p1: Point3D, p2: Point3D): number {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  const dz = p1.z - p2.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * 计算力矩
 */
function calculateMoment(
  point: Point3D,
  center: Point3D,
  weight: number,
): {
  x: number;
  y: number;
  z: number;
} {
  const dx = point.x - center.x;
  const dy = point.y - center.y;
  const dz = point.z - center.z;

  return {
    x: weight * Math.sqrt(dy * dy + dz * dz),
    y: weight * Math.sqrt(dx * dx + dz * dz),
    z: weight * Math.sqrt(dx * dx + dy * dy),
  };
}

/**
 * 计算加权中心
 */
function calculateWeightedCenter(cuboids: Cuboid[]): {
  center: Point3D;
  totalWeight: number;
} {
  const totalWeight = cuboids.reduce((sum, c) => sum + c.weight, 0);

  const center = {
    x:
      cuboids.reduce((sum, c) => sum + c.position.x * c.weight, 0) /
      totalWeight,
    y:
      cuboids.reduce((sum, c) => sum + c.position.y * c.weight, 0) /
      totalWeight,
    z:
      cuboids.reduce((sum, c) => sum + c.position.z * c.weight, 0) /
      totalWeight,
  };

  return { center, totalWeight };
}

/**
 * 计算几何中心
 */
function calculateGeometricCenter(cuboids: Cuboid[]): Point3D {
  return {
    x: calculateMean(cuboids.map((c) => c.position.x)),
    y: calculateMean(cuboids.map((c) => c.position.y)),
    z: calculateMean(cuboids.map((c) => c.position.z)),
  };
}

/**
 * 计算长方体的物理属性
 */
export function calculatePhysicalProperties(
  cuboids: Cuboid[],
): PhysicalProperties {
  // 处理空数组的情况
  if (!cuboids.length) {
    return {
      centerOfGravity: { x: 0, y: 0, z: 0 },
      geometricCenter: { x: 0, y: 0, z: 0 },
      distances: [],
      deviation: 0,
      relativeHeight: 0,
      momentX: 0,
      momentY: 0,
      momentZ: 0,
      moments: [],
      width: 0,
      height: 0,
      maxHeight: 0,
      heightRatio: 0,
      details: {
        totalWeight: 0,
        weightedCenter: { x: 0, y: 0, z: 0 },
      },
    };
  }

  // 计算加权中心和总重量
  const { center: weightedCenter, totalWeight } =
    calculateWeightedCenter(cuboids);

  // 计算几何中心
  const geometricCenter = calculateGeometricCenter(cuboids);

  // 计算到重心的距离
  const distances = cuboids.map((c) =>
    calculateDistance(c.position, weightedCenter),
  );

  // 计算重心偏离程度
  const deviation = calculateDistance(weightedCenter, geometricCenter);

  // 计算相对高度
  const maxZ = Math.max(...cuboids.map((c) => c.position.z));
  const relativeHeight = maxZ > 0 ? weightedCenter.z / maxZ : 1;

  // 计算各个方向的力矩
  const moments = cuboids.map((c) =>
    calculateMoment(c.position, weightedCenter, c.weight),
  );

  // 计算各个轴向的合力矩
  const momentX = moments.reduce((sum, m) => sum + m.x, 0);
  const momentY = moments.reduce((sum, m) => sum + m.y, 0);
  const momentZ = moments.reduce((sum, m) => sum + m.z, 0);

  // 计算尺寸
  const xs = cuboids.map((c) => c.position.x);
  const ys = cuboids.map((c) => c.position.y);
  const zs = cuboids.map((c) => c.position.z);

  const width = Math.max(...xs) - Math.min(...xs);
  const height = Math.max(...ys) - Math.min(...ys);
  const maxHeight = Math.max(...zs) - Math.min(...zs);
  const heightRatio = height > 0 ? maxHeight / height : 1;

  return {
    centerOfGravity: weightedCenter,
    geometricCenter,
    distances,
    deviation,
    relativeHeight,
    momentX,
    momentY,
    momentZ,
    moments: [Math.abs(momentX), Math.abs(momentY), Math.abs(momentZ)],
    width,
    height,
    maxHeight,
    heightRatio,
    details: {
      totalWeight,
      weightedCenter,
    },
  };
}

/**
 * 创建一个长方体对象
 */
export function createCuboid(
  x: number,
  y: number,
  z: number,
  weight: number,
): Cuboid {
  return {
    position: { x, y, z },
    weight,
  };
}
