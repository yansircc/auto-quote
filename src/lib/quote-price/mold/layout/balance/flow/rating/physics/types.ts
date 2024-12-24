/**
 * 三维坐标点
 */
export interface Point3D {
  x: number;
  y: number;
  z: number;
}

/**
 * 长方体对象
 */
export interface Cuboid {
  position: Point3D;
  weight: number;
}

/**
 * 物理属性
 */
export interface PhysicalProperties {
  // 重心
  centerOfGravity: Point3D;
  // 几何中心
  geometricCenter: Point3D;
  // 到重心的距离数组
  distances: number[];
  // 重心偏离度
  deviation: number;
  // 相对高度
  relativeHeight: number;
  // X轴力矩
  momentX: number;
  // Y轴力矩
  momentY: number;
  // Z轴力矩
  momentZ: number;
  // 各轴向力矩绝对值数组
  moments: number[];
  // 宽度
  width: number;
  // 高度
  height: number;
  // 最大高度
  maxHeight: number;
  // 高度比
  heightRatio: number;
  // 详细信息
  details: {
    totalWeight: number;
    weightedCenter: Point3D;
  };
}
