import type {
  Range,
  TestCases,
  ScoreResult,
  OptimizerScoringConfig,
  ConfigScores,
} from "./core";
import type { GeneticConfig as AlgorithmGeneticConfig } from "@/lib/algorithms/optimizer";

/**
 * 遗传算法配置
 */
export interface GeneticConfig<T extends Record<string, number>>
  extends Omit<AlgorithmGeneticConfig<T>, "parameterConfig"> {
  /** 参数配置 */
  parameterConfig: {
    ranges: Record<keyof T, Range>;
  };
}

/**
 * 优化器配置
 */
export interface OptimizerConfig<
  TInput,
  TConfig,
  TParams extends Record<string, number>,
> {
  /** 计算分数的函数 */
  calculateScore: (input: TInput, config: TConfig) => ScoreResult;

  /** 将扁平参数转换为配置的函数 */
  flatParamsToConfig: (params: TParams) => TConfig;

  /** 遗传算法配置 */
  geneticConfig: GeneticConfig<TParams>;

  /** 评分配置 */
  optimizerConfig?: OptimizerScoringConfig;

  /** 测试用例 */
  testCases: TestCases<TInput>;
}

/**
 * 优化器实例
 */
export interface OptimizerInstance<
  TInput,
  TConfig,
  TParams extends Record<string, number>,
> {
  /** 评估测试分数 */
  evaluateTestScore: (params: TParams, verbose?: boolean) => number;
  /** 查找最佳配置 */
  findBestConfig: (iterations?: number) => Promise<{
    params: TParams;
    config: TConfig;
    scores: ConfigScores<TInput>;
    previousScores: ConfigScores<TInput>;
  }>;
  /** 获取单个测试用例的得分 */
  getScore: (input: TInput, params: TParams) => number;
  /** 当前参数 */
  params: TParams;
  /** 当前配置 */
  config: TConfig;
  /** 当前分数 */
  scores: ConfigScores<TInput>;
  /** 上一次分数 */
  previousScores: ConfigScores<TInput>;
}
