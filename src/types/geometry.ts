/**
 * 3D空间中的点
 */
export interface Point3D {
  x: number;
  y: number;
  z: number;
}

/**
 * 2D平面中的点
 */
export interface Point2D {
  x: number;
  y: number;
}

/**
 * 3D空间中的尺寸
 */
export interface Dimensions3D {
  length: number;  // X轴
  width: number;   // Z轴
  height: number;  // Y轴
}

/**
 * 2D平面中的矩形
 */
export interface Rectangle {
  x: number;
  y: number;
  width: number;   // 对应3D中的length
  height: number;  // 对应3D中的width
  rotated?: boolean;
  originalIndex?: number;
}

/**
 * 3D包围盒
 */
export interface BoundingBox3D {
  min: Point3D;
  max: Point3D;
  dimensions: Point3D;
}

/**
 * CAD数据
 */
export interface CADData {
  volume: number;         // 体积 (mm³)
  surfaceArea: number;    // 表面积 (mm²)
  boundingBox: BoundingBox3D;
  centerOfMass: Point3D;  // 重心
}

/**
 * 产品基本信息
 */
export interface Product {
  id: number;
  weight: number;        // 重量 (g)
  flowLength?: number;   // 流动长度 (mm)
  dimensions?: Dimensions3D;
  cadData?: CADData;
  originalIndex?: number;
}

/**
 * 坐标系转换工具函数
 */
export const convertTo3D = (rect: Rectangle, height: number): Point3D => ({
  x: rect.x,
  y: height,
  z: rect.y
});

export const convertTo2D = (point: Point3D): Point2D => ({
  x: point.x,
  y: point.z
});
