import type { ParamRange } from "@/lib/algorithms/optimizer";

/**
 * 基础范围类型
 */
export type Range = ParamRange;

/**
 * 基础分数期望类型
 */
export interface ScoreExpectation {
  min?: number;
  max?: number;
  exact?: number;
}

/**
 * 分数变化质量
 */
export type ScoreQuality = "positive" | "negative" | "neutral";

/**
 * 分数变化详情
 */
export interface ScoreChange {
  value: number;
  percent: number;
  quality: ScoreQuality;
}

/**
 * 基础测试用例类型
 */
export interface TestCase<TInput, TOutput = unknown> {
  input: TInput;
  description: string;
  expect: ScoreExpectation;
  output?: TOutput;
}

/**
 * 测试用例集合
 */
export interface TestCases<TInput, TOutput = unknown> {
  cases: Array<TestCase<TInput, TOutput>>;
}

/**
 * 评分结果
 */
export interface ScoreResult {
  total: number;
  [key: string]: number; // 允许添加其他数值指标
}

/**
 * 评分详情
 */
export interface ScoreDetails<TInput> {
  input: TInput;
  description: string;
  expect: ScoreExpectation;
  actual: number;
  fitness: number;
  oldScore?: number;
  oldFitness?: number;
  change?: ScoreChange;
}

/**
 * 配置评分结果
 */
export interface ConfigScores<TInput> {
  avgScore: number;
  oldAvgScore?: number;
  scores: Array<ScoreDetails<TInput>>;
}

/**
 * 扁平参数类型
 */
export type FlatParams = Record<string, number>;

/**
 * 优化器评分配置
 */
export interface OptimizerScoringConfig extends Record<string, unknown> {
  /** 基础适应度分数 */
  baseFitness: number;
  /** 最大奖励分数 */
  maxBonus: number;
  /** 惩罚系数 */
  penaltyFactor: number;
  /** 允许的最大误差 */
  maxAllowedDiff: number;
}

/**
 * 优化器接口
 */
export interface Optimizer<TConfig, TParams extends Record<string, number>> {
  /** 评估测试分数 */
  evaluateTestScore: (params: TParams, verbose?: boolean) => number;

  /** 查找最佳配置 */
  findBestConfig: (iterations?: number) => Promise<{
    params: TParams;
    config: TConfig;
    scores: ConfigScores<TParams>;
    previousScores: ConfigScores<TParams>;
  }>;
}
