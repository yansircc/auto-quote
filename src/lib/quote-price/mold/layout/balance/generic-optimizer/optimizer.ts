import { GeneticOptimizer } from "@/lib/algorithms/optimizer";
import type { FlatParams, ConfigScores, ScoreDetails } from "./types/core";
import type { OptimizerConfig } from "./types";
import {
  DEFAULT_OPTIMIZER_CONFIG,
  ScoreEvaluation,
  createScoringConfig,
} from "./core";
import { ScoreReporter } from "./utils";
import { getDefaultParams } from "./utils/param-converter";

/**
 * 创建通用优化器
 * @param optimizer 优化器配置和实现
 * @returns 优化后的配置
 */
export function createOptimizer<TInput, TConfig>(
  optimizer: OptimizerConfig<TInput, TConfig, FlatParams>,
): {
  evaluateTestScore: (params: FlatParams, verbose?: boolean) => number;
  findBestConfig: (iterations?: number) => Promise<{
    params: FlatParams;
    config: TConfig;
    scores: ConfigScores<TInput>;
    previousScores: ConfigScores<TInput>;
  }>;
  params: FlatParams;
  config: TConfig;
  scores: ConfigScores<TInput>;
  previousScores: ConfigScores<TInput>;
} {
  const {
    flatParamsToConfig,
    calculateScore,
    geneticConfig,
    optimizerConfig = createScoringConfig(),
    testCases,
  } = optimizer;

  // 合并默认配置和用户配置
  const scoringConfig = {
    ...DEFAULT_OPTIMIZER_CONFIG,
    ...optimizerConfig,
  };

  // 评分报告生成器
  const reporter = new ScoreReporter();

  /**
   * 计算测试用例得分
   * @param params 参数配置
   * @param config 评分配置
   * @returns 得分详情
   */
  function calculateTestScores(
    params: FlatParams,
    config: typeof DEFAULT_OPTIMIZER_CONFIG,
  ): ConfigScores<TInput> {
    const userConfig = flatParamsToConfig(params);
    const scores: ScoreDetails<TInput>[] = [];

    // 遍历测试用例数组
    for (const testCase of testCases.cases) {
      // 计算得分
      const result = calculateScore(testCase.input, userConfig);
      const actual = result.total;

      // 计算适应度得分
      const fitness = ScoreEvaluation.calculateFitnessScore(
        actual,
        testCase.expect,
        config,
      );

      // 记录得分详情
      scores.push({
        input: testCase.input,
        description: testCase.description,
        expect: testCase.expect,
        actual,
        fitness,
      });
    }

    // 计算平均分
    const avgScore =
      scores.reduce((sum, s) => sum + s.fitness, 0) / scores.length;

    return {
      avgScore,
      scores,
    };
  }

  /**
   * 通用测试用例评分函数
   * @param params 参数配置
   * @param verbose 是否输出详细信息
   * @returns 平均得分
   */
  function evaluateTestScore(params: FlatParams, verbose = false): number {
    // 确保有测试用例
    if (!testCases.cases || testCases.cases.length === 0) {
      console.warn("No test cases found for optimization");
      return -Infinity;
    }

    // 计算当前得分
    const currentScores = calculateTestScores(params, scoringConfig);

    // 如果需要详细信息，输出报告
    if (verbose) {
      // 获取默认参数的得分作为对比
      const defaultParams = getDefaultParams(
        geneticConfig.parameterConfig.ranges,
      );
      const previousScores = calculateTestScores(defaultParams, scoringConfig);

      // 异步生成报告，但不等待
      reporter.generateReport({
        previousScores,
        bestScores: currentScores,
        bestParams: params,
      });
    }

    return currentScores.avgScore;
  }

  /**
   * 寻找最优配置
   * @param iterations 迭代次数，可选
   * @returns 最优配置和得分
   */
  async function findBestConfig(iterations?: number): Promise<{
    params: FlatParams;
    config: TConfig;
    scores: ConfigScores<TInput>;
    previousScores: ConfigScores<TInput>;
  }> {
    if (!geneticConfig) {
      throw new Error("遗传算法配置未提供");
    }

    // 创建遗传算法优化器
    const genetic = new GeneticOptimizer<FlatParams>({
      populationSize: geneticConfig.populationSize,
      maxGenerations: iterations ?? geneticConfig.maxGenerations,
      mutationRate: geneticConfig.mutationRate,
      eliteRatio: geneticConfig.eliteRatio,
      convergenceThreshold: geneticConfig.convergenceThreshold,
      parameterConfig: {
        ranges: geneticConfig.parameterConfig.ranges,
      },
      fitnessFunction: evaluateTestScore,
    });

    // 运行优化
    const result = genetic.optimize();
    const bestParams = result.bestParams;
    const bestConfig = flatParamsToConfig(bestParams);
    const scores = calculateTestScores(bestParams, scoringConfig);

    // 获取默认参数的得分作为对比
    const defaultParams = getDefaultParams(
      geneticConfig.parameterConfig.ranges,
    );
    const previousScores = calculateTestScores(defaultParams, scoringConfig);

    return {
      params: bestParams,
      config: bestConfig,
      scores,
      previousScores,
    };
  }

  // 创建初始参数和配置
  const defaultParams = getDefaultParams(geneticConfig.parameterConfig.ranges);
  const defaultConfig = flatParamsToConfig(defaultParams);
  const defaultScores = calculateTestScores(defaultParams, scoringConfig);

  return {
    evaluateTestScore,
    findBestConfig,
    params: defaultParams,
    config: defaultConfig,
    scores: defaultScores,
    previousScores: defaultScores,
  };
}
