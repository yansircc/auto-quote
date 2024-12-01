import type { Product } from '@/types/geometry';

// 基础特征
export interface DimensionFeatures {
  length: number;
  width: number;
  height: number;
  ratios: {
    lengthWidth: number;
    lengthHeight: number;
    widthHeight: number;
  };
}

export interface ShapeFeatures {
  volume: number;
  surfaceArea: number;
  aspectRatio: number;
}

// 几何评分
export interface GeometryScore {
  // 总分（0-100）
  score: number;
  
  // 子项得分（0-100）
  details: {
    shapeSimilarity: number;    // 形状相似度
    dimensionRatio: number;     // 尺寸比例
    basicEfficiency: number;    // 基础空间效率
  };
  
  // 分析数据
  analysis: {
    averageAspectRatio: number;   // 平均长宽比
    dimensionVariance: number;    // 尺寸方差
    shapeHomogeneity: number;     // 形状同质性
  };
}

// 评分配置
export interface GeometryScoreConfig {
  // 相似度评分参数
  similarity: {
    aspectRatioWeight: number;     // 长宽比权重
    shapeWeight: number;           // 形状权重
    dimensionWeight: number;       // 尺寸权重
  };
  
  // 评分曲线参数
  curves: {
    perfectScoreThreshold: number; // 完美分数阈值
    nearPerfectThreshold: number;  // 接近完美阈值
    midPointRatio: number;         // S型曲线中点
    slopeFactor: number;           // 曲线斜率因子
    basePenaltyExponent: number;   // 基础惩罚指数
  };
  
  // 容差设置
  tolerance: {
    ratio: number;    // 相对容差
    minimum: number;  // 最小容差
  };
}

// 验证结果
export interface ValidationResult {
  valid: boolean;
  reason?: string;
}

// 规范化后的产品数据
export interface NormalizedProduct {
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  volume: number;
  surfaceArea: number;
}

// 分析结果
export interface GeometryAnalysis {
  products: Product[];
  features: {
    shape: ShapeFeatures[];
    dimension: DimensionFeatures[];
  };
  normalized: NormalizedProduct[];
  score: GeometryScore;
}
