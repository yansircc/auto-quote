import type { FlatParams } from "@/lib/quote-price/mold/layout/balance/generic-optimizer";

/**
 * 评分等级
 */
export type ScoreLevel = "perfect" | "good" | "medium" | "bad";

/**
 * 评分区间配置
 */
export interface ScoreRange {
  /** 基础分数 */
  base: number;
  /** 惩罚因子 */
  factor: number;
}

/**
 * 距离评分输入类型
 */
export interface PositionInput {
  /** 偏离程度（绝对值） */
  deviation: number;
  /** 重心高度（归一化值 0-1） */
  height: number;
  /** 布局尺寸（用于计算相对偏离度） */
  layoutSize: number;
}

/**
 * 距离评分配置类型
 */
export interface PositionConfig {
  // 偏离阈值（相对值）
  thresholds: {
    deviation: Record<ScoreLevel, number>;
    height: Record<ScoreLevel, number>;
  };

  // 评分权重（和为1）
  weights: {
    /** 偏离度权重 */
    deviation: number;
    /** 高度权重 */
    height: number;
  };

  // 分数计算参数
  scores: {
    deviation: Record<ScoreLevel, ScoreRange>;
    height: Record<ScoreLevel, ScoreRange>;
  };

  // 组合奖励
  bonus: {
    /** 完美组合：极小偏离 + 低重心 */
    perfect: {
      deviation: number;
      height: number;
      score: number;
    };
    /** 优秀组合：小偏离 + 较低重心 */
    excellent: {
      deviation: number;
      height: number;
      score: number;
    };
    /** 良好组合：中等偏离 + 较低重心 */
    good: {
      deviation: number;
      height: number;
      score: number;
    };
  };

  // 惩罚参数
  penalty: {
    /** 单项惩罚 */
    bad: {
      /** 严重偏离惩罚 */
      deviation: {
        threshold: number;
        score: number;
      };
      /** 重心过高惩罚 */
      height: {
        threshold: number;
        score: number;
      };
    };
    /** 组合惩罚：严重偏离 + 重心过高 */
    combined: {
      score: number;
    };
  };
}

/**
 * 配置评分结果
 */
export interface ConfigScores {
  avgScore: number;
  oldAvgScore?: number;
  scores: Array<{
    input: PositionInput;
    description: string;
    expect: {
      min: number;
      max: number;
    };
    actual: number;
    fitness: number;
    oldScore?: number;
    oldFitness?: number;
    change?: {
      value: number;
      percent: number;
      quality: "positive" | "negative" | "neutral";
    };
  }>;
}

// Re-export FlatParams for convenience
export { FlatParams };
