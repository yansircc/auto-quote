import type { RiskLevel } from "../risk/types";

/**
 * 产品尺寸
 */
export interface ProductDimensions {
  width: number; // 宽度 (mm)
  depth: number; // 深度 (mm)
  height: number; // 高度 (mm)
}

/**
 * 产品
 */
export interface Product {
  id: string;
  name: string;
  material: {
    name: string; // 材料名称
    density: number; // 密度 (g/cm³)
    price: number; // 单价 (元/kg)
    shrinkageRate: number; // 收缩率 (%)
    processingTemp: number; // 加工温度 (℃)
  };
  color: string; // 颜色
  dimensions: ProductDimensions;
  quantity: number; // 需求数量
  netVolume: number; // 净体积 (cm³)
  envelopeVolume: number; // 包络体积 (cm³)
}

/**
 * 产品分组
 */
export interface ProductGroup {
  products: Product[];
  cavities: number[]; // 每个产品对应的穴数
  totalShots: number; // 总模次
  riskScore: number; // 风险评分 (0-100)
  riskLevel: RiskLevel; // 风险等级
}

// 生产策略类型
export enum ProductionStrategy {
  SIMULTANEOUS = "simultaneous", // 同时生产
  SEQUENTIAL = "sequential", // 顺序生产
  HYBRID = "hybrid", // 混合策略
}

// 生产批次
export interface ProductionBatch {
  products: Product[];
  cavities: number[];
  strategy: ProductionStrategy; // 生产策略
  shots: number; // 模次
}

// 加工费用配置
export interface ProcessingFeeConfig {
  baseRate: number; // 基础加工费率
  minBatchThreshold: number; // 小批量阈值
  minBatchFee: number; // 基础小批量费用
  tonnageCoefficient: number; // 机器吨位系数
}

/**
 * 布局评分
 */
export interface LayoutScore {
  geometricBalance: number; // 几何平衡评分
  distributionBalance: number; // 分布平衡评分
  flowBalance: number; // 流动平衡评分
  totalScore: number; // 综合评分
}
