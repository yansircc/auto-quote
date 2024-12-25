/**
 * 基础范围类型定义
 */

/**
 * 相对范围配置
 * 用于定义一个参数相对于基准值的变化范围
 */
export interface RelativeRange {
  /** 基准值 */
  base: number;
  /** 变化范围 */
  variation: number;
}

/**
 * 参数范围配置
 * 用于定义一个参数的最小值和最大值
 */
export interface ParamRange {
  /** 最小值 */
  min: number;
  /** 最大值 */
  max: number;
  /** 步长（可选） */
  step?: number;
}

/**
 * 有序参数组配置
 * 用于定义一组需要保持顺序关系的参数
 */
export interface OrderedParamGroup {
  /** 组名 */
  name: string;
  /** 参数列表，按照从小到大的顺序排列 */
  params: string[];
}

/**
 * 和约束组配置
 * 用于定义一组参数的和需要等于特定值的约束
 */
export interface SumConstrainedGroup {
  /** 目标和值 */
  targetSum: number;
  /** 参数列表 */
  params: string[];
  /** 允许的误差范围 */
  tolerance: number;
}

/**
 * 优化器配置接口
 */
export interface OptimizerConfig<T extends Record<string, number>> {
  /** 参数范围配置 */
  ranges: Record<keyof T, ParamRange>;
  /** 有序参数组配置 */
  orderedGroups?: OrderedParamGroup[];
  /** 和约束组配置 */
  sumConstraints?: SumConstrainedGroup[];
}
