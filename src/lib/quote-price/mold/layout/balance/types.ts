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
 * 在 3D 建模和计算机图形学中，立方体的尺寸通常遵循以下常见约定：
 * Width (宽) → X 轴
 * Depth (深) → Y 轴
 * Height (高) → Z 轴
 */
export interface BaseCuboid {
  width: number; // x 方向的长度
  depth: number; // y 方向的长度
  height: number; // z 方向的长度
}

/**
 * 完整的长方体定义（包含位置和重量）
 */
export interface Cuboid extends BaseCuboid {
  position: Point3D;
  weight?: number; // 可选的重量
}

/**
 * 3D布局结果，使用笛卡尔坐标系
 */
export interface CuboidLayout {
  dimensions: BaseCuboid;
  position: Point3D;
  index: number; // 保留原始索引
}
