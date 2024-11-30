import type { Point2D } from './geometry';

/**
 * 平衡分析总分
 */
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
 * 详细的几何平衡分数，用于可视化展示
 */
export interface DetailedGeometryScore {
  radialBalance: number;     // 径向平衡分数 (0-100)
  quadrantBalance: number;   // 象限平衡分数 (0-100)
  centerOffset: number;      // 中心偏移分数 (0-100)
  overall: number;          // 总体几何分数 (0-100)
}

/**
 * 详细的流动平衡分数，用于可视化展示
 */
export interface DetailedFlowScore {
  flowPathBalance: number;    // 流动路径平衡分数 (0-100)
  surfaceAreaBalance: number; // 表面积平衡分数 (0-100)
  volumeBalance: number;      // 体积平衡分数 (0-100)
  overall: number;           // 总体流动分数 (0-100)
}

/**
 * 流动路径信息
 */
export interface FlowPath {
  distance: number;      // 流动距离
  resistance: number;    // 流动阻力
  center: Point2D;       // 中心点
  normalized: number;    // 归一化值
}

/**
 * 带权重的数值
 */
export interface WeightedValue {
  value: number;   // 数值
  weight: number;  // 权重
}