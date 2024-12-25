import type {
  FlatParams as BaseFlatParams,
  TestCase as BaseTestCase,
} from "@/lib/quote-price/mold/layout/balance/generic-optimizer";

/**
 * 动量评分输入类型
 */
export interface MomentumInput {
  /** 比率 */
  ratio: number;
  /** RSD */
  rsd: number;
}

/**
 * 动量评分配置类型
 */
export interface MomentumConfig {
  // 阈值配置
  thresholds: {
    ratio: {
      perfect: number;
      good: number;
      medium: number;
      bad: number;
    };
    rsd: {
      perfect: number;
      good: number;
      medium: number;
      bad: number;
    };
  };

  // 权重配置
  weights: {
    ratio: number;
    rsd: number;
  };

  // 分数区间配置
  scores: {
    ratio: {
      perfect: { base: number; factor: number };
      good: { base: number; factor: number };
      medium: { base: number; factor: number };
      bad: { base: number; factor: number };
    };
    rsd: {
      perfect: { base: number; factor: number };
      good: { base: number; factor: number };
      medium: { base: number; factor: number };
      bad: { base: number; factor: number };
    };
  };

  // 组合奖励配置
  bonus: {
    perfect: {
      ratio: number;
      rsd: number;
      score: number;
    };
    excellent: {
      ratio: number;
      rsd: number;
      score: number;
    };
    good: {
      ratio: number;
      rsd: number;
      score: number;
    };
  };

  // 惩罚配置
  penalty: {
    bad: {
      ratio: {
        threshold: number;
        score: number;
      };
      rsd: {
        threshold: number;
        score: number;
      };
    };
    combined: {
      score: number;
    };
  };
}

type MomentumTestCase = BaseTestCase<MomentumInput, MomentumConfig>;

/**
 * 配置评分结果
 */
export interface ConfigScores {
  /** 平均分数 */
  avgScore: number;
  /** 各测试用例的得分 */
  scores: Array<{
    /** 测试输入 */
    input: MomentumTestCase["input"];
    /** 测试用例描述 */
    description: string;
    /** 期望分数范围 */
    expect: MomentumTestCase["expect"];
    /** 实际得分 */
    actual: number;
  }>;
}

/**
 * 导出基础类型
 */
export type { BaseFlatParams as FlatParams };
