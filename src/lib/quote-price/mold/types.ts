import type { MoldMaterial } from "../materials/types";

/**
 * 模具配置
 */
export interface MoldConfig {
  // 供应商运维费配置
  maintenanceFee: {
    threshold: number; // 材料成本阈值
    lowerRate: number; // 低于阈值的费率
    higherRate: number; // 高于阈值的费率
  };

  // 毛利配置（和模具重量正相关的不连续递增函数）
  grossProfit: {
    weightThresholds: number[]; // 重量阈值数组
    rates: number[]; // 对应的费率数组
  };

  // 额外加工费配置
  processingFees: Record<string, number>; // 不同模具材料对应的加工费用
}

/**
 * 模具尺寸
 */
export interface MoldDimensions {
  width: number; // 宽度 (mm)
  height: number; // 高度 (mm)
  depth: number; // 深度 (mm)
}

/**
 * 模具信息
 */
export interface Mold {
  material: MoldMaterial;
  dimensions: MoldDimensions;
  weight: number; // 重量 (kg)
  cavityCount: number; // 型腔数量
  scores: Record<string, number>; // 分数
  weightedAverage: number; // 加权平均分
}
