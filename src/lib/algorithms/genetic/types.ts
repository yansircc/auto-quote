/**
 * 遗传算法的事件类型
 */
export interface GeneticEvent<T> {
  generation: number;
  population: T[];
  bestIndividual: T;
  bestFitness: number;
  averageFitness: number;
  diversity: number;
  currentMutationRate: number;
  currentCrossoverRate: number;
}

/**
 * 遗传算法回调函数接口
 */
export interface GeneticCallbacks<T> {
  onGeneration?: (
    generation: number,
    population: T[],
    fitnesses: number[],
    bestFitness: number,
    averageFitness: number,
    diversity: number,
  ) => Promise<void> | void;

  onNewBest?: (
    individual: T,
    fitness: number,
    generation: number,
  ) => Promise<void> | void;

  onTermination?: (reason: string) => Promise<void> | void;
}

/**
 * 遗传算法结果接口
 */
export interface GeneticResult<T> {
  bestIndividual: T;
  bestFitness: number;
  generations: number;
  history: number[];
  diversityHistory: number[];
  terminationReason: string;
  finalPopulation: T[];
}

/**
 * 选择策略类型
 */
export type SelectionStrategy = "roulette" | "tournament" | "rank";

/**
 * 交叉策略类型
 */
export type CrossoverStrategy =
  | "singlePoint"
  | "twoPoint"
  | "uniform"
  | "arithmetic";

/**
 * 变异策略类型
 */
export type MutationStrategy = "gaussian" | "uniform" | "adaptive";

/**
 * 数值型基因组
 * 可以是数值数组或键值对对象
 */
export type NumericGenome = number[] | Record<string, number>;

/**
 * 遗传算法配置接口
 */
export interface GeneticConfig<T extends NumericGenome> {
  // 种群大小
  populationSize: number;

  // 最大迭代次数
  maxGenerations: number;

  // 变异率 (0-1)
  mutationRate: number;

  // 交叉率 (0-1)
  crossoverRate: number;

  // 精英保留率 (0-1)
  elitismRate: number;

  // 适应度函数
  fitnessFunction: (individual: T) => number;

  // 随机生成个体
  generateIndividual: () => T;

  // 变异函数
  mutate: (individual: T) => T;

  // 交叉函数
  crossover: (parent1: T, parent2: T) => [T, T];

  // 选择策略
  selectionStrategy?: SelectionStrategy;

  // 交叉策略
  crossoverStrategy?: CrossoverStrategy;

  // 变异策略
  mutationStrategy?: MutationStrategy;

  // 策略参数
  strategyParams?: {
    // 锦标赛大小
    tournamentSize?: number;
    // 均匀交叉的混合率
    uniformRate?: number;
    // 算术交叉的权重
    arithmeticAlpha?: number;
    // 高斯变异的标准差
    gaussianSigma?: number;
    // 变异范围
    mutationRange?: Record<string, { min: number; max: number }>;
  };

  // 计算种群多样性的函数（可选）
  calculateDiversity?: (population: T[]) => number;

  // 终止条件 (可选)
  terminationCondition?: (generation: number, bestFitness: number) => boolean;

  // 回调函数（可选）
  callbacks?: GeneticCallbacks<T>;

  // 自适应参数（可选）
  adaptiveParams?: {
    // 最小变异率
    minMutationRate?: number;
    // 最大变异率
    maxMutationRate?: number;
    // 最小交叉率
    minCrossoverRate?: number;
    // 最大交叉率
    maxCrossoverRate?: number;
    // 多样性阈值
    diversityThreshold?: number;
    // 最小变异范围
    minMutationRange?: number;
    // 最大变异范围
    maxMutationRange?: number;
  };
}

export interface Range {
  min: number;
  max: number;
  step?: number;
}

export interface ParamConfig {
  ranges: Record<string, Range>;
  constraints?: {
    sumTo?: {
      value: number;
      params: string[];
      tolerance: number;
    }[];
  };
}
