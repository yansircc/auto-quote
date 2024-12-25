import type { OptimizerConfig } from "../core/types";

/**
 * 遗传算法配置接口
 */
export interface GeneticConfig<T extends Record<string, number>> {
  /** 种群大小 */
  populationSize: number;
  /** 最大代数 */
  maxGenerations: number;
  /** 变异率 */
  mutationRate: number;
  /** 精英保留比例 */
  eliteRatio: number;
  /** 收敛阈值 */
  convergenceThreshold: number;
  /** 参数配置 */
  parameterConfig: OptimizerConfig<T>;
  /** 适应度评估函数 */
  fitnessFunction: (params: T) => number;
}

/**
 * 遗传算法结果接口
 */
export interface GeneticResult<T extends Record<string, number>> {
  /** 最佳参数 */
  bestParams: T;
  /** 最佳适应度 */
  bestFitness: number;
  /** 收敛代数 */
  convergenceGeneration: number;
  /** 每代最佳适应度历史 */
  fitnessHistory: number[];
}
