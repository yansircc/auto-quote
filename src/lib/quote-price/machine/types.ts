/**
 * 机器配置
 */
export interface MachineConfig {
  tonnageRange: [number, number]; // 机器吨位范围 [最小值, 最大值]
  tonnageRates: number[]; // 不同吨位对应的基础加工费率
  tonnageThresholds: number[]; // 吨位阈值数组
  smallBatchThreshold: number; // 小批量阈值（默认1000模次）
  smallBatchRates: number[]; // 小批量费率数组
  safetyFactor: number; // 注胶安全系数（默认0.8）
}

/**
 * 加工配置
 */
export interface ProcessingConfig {
  // 模具材料到加工费用的映射表
  materialToProcessingFee: Record<string, number>;
}
