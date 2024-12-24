import type {
  FlatParams as BaseFlatParams,
  TestCase as BaseTestCase,
} from "@/lib/quote-price/mold/layout/balance/generic-optimizer";

/**
 * 距离评分输入类型
 */
export interface DistanceInput {
  /** 偏离程度 */
  cv: number;
  /** 极差比 */
  range: number;
}

/**
 * 距离评分配置类型
 */
export interface DistanceConfig {
  // 偏离阈值
  thresholds: {
    cv: {
      perfect: number;
      good: number;
      medium: number;
      bad: number;
    };
    range: {
      perfect: number;
      good: number;
      medium: number;
      bad: number;
    };
  };

  // 权重
  weights: {
    cv: number;
    range: number;
  };

  // 分数区间
  scores: {
    cv: {
      perfect: { base: number; factor: number };
      good: { base: number; factor: number };
      medium: { base: number; factor: number };
      bad: { base: number; factor: number };
    };
    range: {
      perfect: { base: number; factor: number };
      good: { base: number; factor: number };
      medium: { base: number; factor: number };
      bad: { base: number; factor: number };
    };
  };

  // 组合奖励
  bonus: {
    perfect: {
      cv: number;
      range: number;
      score: number;
    };
    excellent: {
      cv: number;
      range: number;
      score: number;
    };
    good: {
      cv: number;
      range: number;
      score: number;
    };
  };

  // 惩罚参数
  penalty: {
    bad: {
      cv: {
        threshold: number;
        score: number;
      };
      range: {
        threshold: number;
        score: number;
      };
    };
    combined: {
      score: number;
    };
  };
}

type DistanceTestCase = BaseTestCase<DistanceInput, DistanceConfig>;

/**
 * 配置评分结果
 */
export interface ConfigScores {
  /** 平均分数 */
  avgScore: number;
  /** 各测试用例的得分 */
  scores: Array<{
    /** 测试输入 */
    input: DistanceTestCase["input"];
    /** 测试用例描述 */
    description: string;
    /** 期望分数范围 */
    expect: DistanceTestCase["expect"];
    /** 实际得分 */
    actual: number;
  }>;
}

/**
 * 导出基础类型
 */
export type { BaseFlatParams as FlatParams };
