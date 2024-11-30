import type { Point2D, Point3D } from '../types';

export interface BasicCADData {
  volume: number;         // 体积
  surfaceArea: number;    // 表面积
  boundingBox: {         // 包围盒
    min: Point3D;
    max: Point3D;
    dimensions: Point3D;
  };
  centerOfMass: Point3D; // 重心
}

export interface BalanceScore {
  total: number;        // 总分 0-100
  details: {
    geometry: number;   // 几何平衡
    flow: number;      // 流动平衡
    distribution: number; // 分布平衡
    volume: number;    // 体积平衡
  };
  confidence: number;  // 置信度 0-1
}

/**
 * Detailed geometry balance score interface
 * 详细的几何平衡分数接口，用于可视化展示
 */
export interface DetailedGeometryScore {
  // Radial balance score (0-100)
  // 径向平衡分数
  radialBalance: number;
  
  // Quadrant balance score (0-100)
  // 象限平衡分数
  quadrantBalance: number;
  
  // Center offset score (0-100)
  // 中心偏移分数
  centerOffset: number;
  
  // Overall geometry score (0-100)
  // 总体几何分数
  overall: number;
}

/**
 * Detailed flow balance score interface
 * 详细的流动平衡分数接口，用于可视化展示
 */
export interface DetailedFlowScore {
  // Flow path balance score (0-100)
  // 流动路径平衡分数
  flowPathBalance: number;
  
  // Surface area balance score (0-100)
  // 表面积平衡分数
  surfaceAreaBalance: number;
  
  // Volume balance score (0-100)
  // 体积平衡分数
  volumeBalance: number;
  
  // Overall flow score (0-100)
  // 总体流动分数
  overall: number;
}

export interface FlowPath {
  distance: number;
  resistance: number;
  center: Point2D;
  normalized: number;
}

export interface WeightedValue {
  value: number;
  weight: number;
}
