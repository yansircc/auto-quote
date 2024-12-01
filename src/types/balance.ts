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
 * 详细的分布平衡分数，用于可视化展示
 */
export interface DetailedDistributionScore {
  score: number;          // 总体分布分数 (0-100)
  details: {
    // 物理特性
    principalMoments: [number, number];  // 主惯性矩（特征值）
    principalAxes: [[number, number], [number, number]];  // 主轴方向（特征向量）
    gyrationRadius: number;  // 陀螺半径
    isotropy: number;       // 各向同性比
    centerDeviation: number;  // 质心偏移

    // 体积平衡
    volumeBalance: {
      densityVariance: number;     // 密度方差 - 反映平面空间利用
      heightBalance: number;       // 高度分布的平衡性
      massDistribution: number;    // 考虑体积带来的质量分布
    };
  };
}

/**
 * 几何特征评分
 */
export interface GeometryScore {
  score: number;          // 总体几何分数 (0-100)
  details: {
    // 形状评分
    shapeScore: {
      aspectRatio: number;     // 长宽比评分 (0-100)
      symmetry: number;        // 对称性评分 (0-100)
      complexity: number;      // 复杂度评分 (0-100)
      uniformity: number;      // 一致性评分 (0-100)
    };
    
    // 尺寸评分
    dimensionScore: {
      sizeVariation: number;   // 尺寸变化评分 (0-100)
      scaleRatio: number;      // 比例关系评分 (0-100)
      consistency: number;     // 一致性评分 (0-100)
    };
    
    // 产品相似度评分
    similarityScore: {
      shapeHomogeneity: number;    // 形状相似度 (0-100)
      dimensionHomogeneity: number; // 尺寸相似度 (0-100)
    };
    
    // 空间效率评分
    efficiencyScore: {
      planarDensity: number;      // 平面空间利用率 (0-100)
      volumeUtilization: number;  // 体积利用效率 (0-100)
      heightDistribution: number; // 高度分布合理性 (0-100)
    };
  };
}

/**
 * 几何特征分析
 */
export interface GeometryAnalysis {
  // 形状特征
  shape: {
    aspectRatios: number[];        // 每个产品的长宽比
    symmetryAxes: number[];        // 每个产品的对称轴数量
    complexityMetrics: number[];   // 每个产品的复杂度指标
  };
  
  // 尺寸特征
  dimensions: {
    volumes: number[];            // 体积
    surfaceAreas: number[];       // 表面积
    boundingBoxVolumes: number[]; // 包围盒体积
    wallThicknesses?: number[];   // 壁厚（如果可用）
  };
  
  // 相似度特征
  similarity: {
    shapeMatrix: number[][];     // 形状相似度矩阵
    dimensionMatrix: number[][]; // 尺寸相似度矩阵
  };
  
  // 空间效率
  efficiency: {
    totalVolume: number;         // 总体积
    boundingBoxVolume: number;   // 包围盒体积
    packingRatio: number;        // 填充率
  };
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
