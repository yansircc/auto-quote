import type { PhysicalProperties } from "./physics";

/**
 * 分析选项
 */
export interface AnalyzeOptions {
  /** 是否包含详细信息 */
  debug?: boolean;
}

/**
 * 分布分析结果
 */
export type DistributionAnalysis = PhysicalProperties;
