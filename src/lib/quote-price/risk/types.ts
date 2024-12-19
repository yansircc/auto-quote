/**
 * 风险等级
 */
export enum RiskLevel {
  LOW = "low", // 低风险 (0-30分)
  MEDIUM = "medium", // 中等风险 (31-60分)
  HIGH = "high", // 高风险 (61-80分)
  EXTREME = "extreme", // 极高风险 (>80分)
}

/**
 * 风险评估配置
 */
export interface RiskConfig {
  // 风险权重
  weights: {
    materialDifference: number; // 材料差异风险权重
    colorTransition: number; // 颜色转换风险权重
    quantityRatio: number; // 数量比例风险权重
    structure: number; // 结构风险权重
  };
  // 风险等级阈值
  thresholds: {
    low: number; // 低风险阈值 (0-30)
    medium: number; // 中等风险阈值 (31-60)
    high: number; // 高风险阈值 (61-80)
    extreme: number; // 极高风险阈值 (>80)
  };
}

/**
 * 风险评估结果
 */
export interface RiskAssessment {
  score: number; // 风险评分 (0-100)
  level: RiskLevel; // 风险等级
}
