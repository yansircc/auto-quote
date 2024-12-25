import type { Point3D } from "./base";

/**
 * 长方体接口
 */
export interface Cuboid {
  position: Point3D;
  weight: number;
}

/**
 * 基础物理属性
 */
export interface BasePhysicalProperties {
  /** 重心位置 */
  centerOfGravity: Point3D;
  /** 几何中心 */
  geometricCenter: Point3D;
  /** 重心偏离程度（0-1） */
  deviation: number;
  /** 重心相对高度（0-1） */
  relativeHeight: number;
}

/**
 * 力矩相关属性
 */
export interface MomentumProperties {
  /** 各个方向的力矩 */
  momentX: number;
  momentY: number;
  momentZ: number;
  /** 力矩大小数组 */
  moments: number[];
}

/**
 * 几何属性
 */
export interface GeometryProperties {
  /** 宽度 */
  width: number;
  /** 高度 */
  height: number;
  /** 最大高度 */
  maxHeight: number;
  /** 高度比 */
  heightRatio: number;
}

/**
 * 完整的物理属性
 */
export interface PhysicalProperties
  extends BasePhysicalProperties,
    MomentumProperties,
    GeometryProperties {
  /** 到重心的距离数组 */
  distances: number[];
  /** 详细信息 */
  details: {
    /** 总重量 */
    totalWeight: number;
    /** 加权中心 */
    weightedCenter: Point3D;
  };
}

/**
 * 创建长方体的选项
 */
export interface CreateCuboidOptions {
  width?: number;
  height?: number;
  depth?: number;
}
