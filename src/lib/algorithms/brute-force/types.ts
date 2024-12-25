/**
 * 参数范围定义
 */
export interface ParameterRange {
  min: number;
  max: number;
  step: number;
}

/**
 * 参数空间定义
 * 可以是具体的范围，也可以是嵌套的对象
 */
export type ParameterSpace = {
  [key: string]: ParameterRange | ParameterSpace;
};

/**
 * 二维点参数空间定义
 */
export interface Point2DParameterSpace extends ParameterSpace {
  x: ParameterRange;
  y: ParameterRange;
}

/**
 * 暴力搜索的事件类型
 */
export interface BruteForceEvent<T> {
  currentConfig: T;
  currentScore: number;
  bestConfig: T;
  bestScore: number;
  progress: number;
  totalConfigs: number;
  currentStep: number;
}

/**
 * 进度信息
 */
export interface BruteForceProgress {
  /** 当前进度 (0-1) */
  progress: number;
  /** 当前步骤 */
  currentStep: number;
  /** 总步骤数 */
  totalSteps: number;
  /** 评估过的配置数 */
  evaluatedConfigs: number;
  /** 有效的配置数 */
  validConfigs: number;
  /** 无效的配置数 */
  invalidConfigs: number;
  /** 已用时间(ms) */
  elapsedTime: number;
  /** 预计剩余时间(ms) */
  estimatedTimeRemaining: number;
}

/**
 * 暴力搜索的回调函数
 */
export interface BruteForceCallbacks<T> {
  // 评估每个配置后的回调
  onEvaluation?: (event: BruteForceEvent<T>) => void | Promise<void>;

  // 找到新的最优解时的回调
  onNewBest?: (config: T, score: number) => void | Promise<void>;

  // 搜索完成时的回调
  onComplete?: (
    config: T,
    score: number,
    stats: SearchStats,
  ) => void | Promise<void>;

  // 发生错误时的回调
  onError?: (error: Error, config: T) => void | Promise<void>;

  // 进度回调
  onProgress?: (progress: BruteForceProgress) => void | Promise<void>;
}

/**
 * 搜索统计信息
 */
export interface SearchStats {
  totalConfigs: number;
  evaluatedConfigs: number;
  validConfigs: number;
  invalidConfigs: number;
  startTime: number;
  endTime: number;
}

/**
 * Worker 结果类型
 */
export interface WorkerResult<T> {
  success: boolean;
  result?: {
    config: T;
    score: number;
  };
  error?: string;
}

/**
 * 暴力搜索配置
 */
export interface BruteForceConfig<T> {
  // 参数空间定义
  parameterSpace: ParameterSpace;

  // 基础配置（可选）
  baseConfig?: Partial<T>;

  // 评估函数
  evaluateConfig: (config: T) => number | Promise<number>;

  // 配置验证函数（可选）
  validateConfig?: (config: T) => boolean;

  // 回调函数（可选）
  callbacks?: BruteForceCallbacks<T>;

  // 并行处理选项（可选）
  parallel?: {
    enabled: boolean;
    maxWorkers?: number;
  };

  // 提前终止条件（可选）
  terminationCondition?: {
    minScore?: number;
    maxTime?: number;
    maxEvaluations?: number;
  };
}

/**
 * 搜索结果
 */
export interface BruteForceResult<T> {
  bestConfig: T;
  bestScore: number;
  stats: SearchStats;
  searchSpace: {
    size: number;
    dimensions: number;
  };
}
