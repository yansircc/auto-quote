/**
 * 基础范围定义
 */
export interface BaseRange {
  min: number;
  max: number;
}

/**
 * 带步长的范围定义（用于暴力搜索和遗传算法）
 */
export interface Range extends BaseRange {
  step: number;
}

/**
 * 配置范围定义（用于暴力搜索）
 */
export type ConfigRange = {
  [key: string]: Range | ConfigRange;
};

/**
 * 参数范围定义（用于遗传算法）
 * 允许任意嵌套的对象，每个叶子节点都是 Range 类型
 */
export type ParamRange = {
  [key: string]: Range | ParamRange;
};

/**
 * 对象记录类型
 */
export type ObjectRecord = Record<string, unknown>;

/**
 * 部分配置类型
 */
export type PartialConfig = Partial<
  Record<string, number | Record<string, unknown>>
>;

/**
 * Worker 结果类型
 */
export interface WorkerResult<T = unknown> {
  success: boolean;
  result?: {
    config: T;
    score: number;
  };
  error?: string;
}

/**
 * 优化器进度信息
 */
export interface OptimizerProgress {
  phase: "genetic" | "bruteforce";
  currentStep: number;
  totalSteps: number;
  bestScore?: number;
  message: string;
}
