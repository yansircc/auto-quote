import type { Product } from "../product/types";
import type { RiskLevel, RiskConfig } from "../risk/types";

/**
 * 分组配置
 */
export interface GroupingConfig {
  // 强制组合选项
  forceGrouping: {
    allowDifferentMaterials: boolean; // 允许不同材料组合
    allowDifferentColors: boolean; // 允许不同颜色组合
  };
  // 风险评估配置
  risk: RiskConfig;
}

/**
 * 穴数优化配置
 */
export interface CavityConfig {
  // 搜索范围限制
  maxCombinations: number; // 最大组合数，超过则使用启发式搜索
  // 比例约束
  ratioConstraints: {
    min: number; // 最小比例
    max: number; // 最大比例
  };
}

/**
 * 产品分组
 */
export interface ProductGroup {
  products: Product[]; // 产品列表
  cavities: number[]; // 对应的穴数
  riskScore: number; // 风险评分
  riskLevel: RiskLevel; // 风险等级
}

/**
 * 优化方案
 */
export interface OptimizationSolution {
  groups: ProductGroup[]; // 产品分组列表
  totalCost: number; // 总成本
  feasible: boolean; // 是否可行
}
