import type { DistributionAnalysis } from "./analysis";
import type { BaseScore } from "./base";

/**
 * 权重配置
 */
export interface Weights {
  /** 距离权重 */
  distance: number;
  /** 位置权重 */
  position: number;
  /** 力矩权重 */
  momentum: number;
}

/**
 * 流平衡计算选项
 */
export interface FlowBalanceOptions {
  /** 自定义权重 */
  weights?: Partial<Weights>;
}

/**
 * 基础评分结果
 */
export interface BaseScoreResult {
  /** 总分 */
  total: number;
  /** 各维度得分 */
  breakdown: {
    /** 距离得分 */
    distance: number;
    /** 位置得分 */
    position: number;
    /** 力矩得分 */
    momentum: number;
  };
}

/**
 * 详细评分结果
 */
export interface DetailedScoreResult {
  /** 总分 */
  total: number;
  /** 各维度得分 */
  breakdown: {
    /** 距离得分 */
    distance: number;
    /** 位置得分 */
    position: number;
    /** 力矩得分 */
    momentum: number;
  };
  /** 权重配置 */
  weights: Weights;
  /** 分布分析结果 */
  analysis: DistributionAnalysis;
}

/**
 * 距离评分接口
 */
export interface DistanceScore extends BaseScore {
  breakdown: {
    cv: number;
    range: number;
  };
}

/**
 * 位置评分接口
 */
export interface PositionScore extends BaseScore {
  breakdown: {
    deviation: number;
    height: number;
  };
}

/**
 * 力矩评分接口
 */
export interface MomentumScore extends BaseScore {
  breakdown: {
    ratio: number;
    rsd: number;
  };
}
