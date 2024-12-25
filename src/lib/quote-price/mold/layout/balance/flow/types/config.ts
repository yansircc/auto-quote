import type { Weights } from "./scores";

/**
 * 流动平衡配置
 *
 * 评分维度：
 * 1. 重心距离分布 (50%)
 * 2. 重心位置评分 (30%)
 * 3. 力矩平衡性 (20%)
 */
export interface FlowConfig {
  // 基础权重配置（总和必须为1）
  weights: Weights;

  // 重心距离分布配置（权重50%）
  centerDistribution: {
    standardDeviationThreshold: number; // 标准差阈值，用于评估分布的集中度
    meanThreshold: number; // 平均值阈值，用于评估分布的整体水平
    highScoreThreshold: number; // 标准差/平均值 < 此值得高分（默认0.25）
    lowScoreThreshold: number; // 标准差/平均值 > 此值得0分（默认0.5）
    sigmoidSteepness: number; // sigmoid 函数的陡峭度，控制分数变化的平滑程度
  };

  // 重心位置配置（权重30%）
  centerPosition: {
    maxDeviation: number; // 最大允许偏离距离，超过此值将受到惩罚
    deviationPenalty: number; // 偏离惩罚系数，控制惩罚的严重程度
    weightFactor: number; // 权重因子，用于调整不同位置的重要性
    scoreMultiplier: number; // 分数调节因子，用于平衡不同情况的得分
  };

  // 力矩平衡配置（权重20%）
  momentumBalance: {
    maxImbalance: number; // 最大允许不平衡度，超过此值将受到惩罚
    balancePenalty: number; // 不平衡惩罚系数，控制惩罚的严重程度
    stabilityFactor: number; // 稳定性因子，用于评估开模时的稳定性
    weight: number; // 力矩权重，用于评估力矩的影响程度
  };
}
