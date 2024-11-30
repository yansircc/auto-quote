import type { Point3D } from '../types';

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

export interface FlowPath {
  length: number;      // 流动路径长度
  volume: number;      // 体积
  surfaceArea: number; // 表面积
}

export interface WeightedValue {
  value: number;
  weight: number;
}
