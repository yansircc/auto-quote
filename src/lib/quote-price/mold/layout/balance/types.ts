/**
 * 三维空间中的点
 */
export interface Point3D {
  x: number;
  y: number;
  z: number;
}

/**
 * 基础长方体属性（仅包含尺寸）
 */
export interface BaseCuboid {
  width: number; // x 方向的长度
  height: number; // y 方向的长度
  depth: number; // z 方向的长度
}

/**
 * 完整的长方体定义（包含位置和重量）
 */
export interface Cuboid extends BaseCuboid {
  position: Point3D;
  weight?: number; // 可选的重量
}
