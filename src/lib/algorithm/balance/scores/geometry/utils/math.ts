import type { GeometryScoreConfig } from '../config';

/**
 * 计算容差值
 */
export function calculateTolerance(value: number, config: GeometryScoreConfig): number {
  return Math.max(Math.abs(value) * config.tolerance.ratio, config.tolerance.minimum);
}

/**
 * 比较两个浮点数是否相等
 */
export function areNumbersEqual(a: number, b: number, tolerance: { ratio: number; minimum: number }): boolean {
  const absoluteDiff = Math.abs(a - b);
  const relativeDiff = absoluteDiff / Math.max(Math.abs(a), Math.abs(b));
  
  return (
    absoluteDiff <= tolerance.minimum ||
    relativeDiff <= tolerance.ratio
  );
}

/**
 * 安全除法，处理除数为0的情况
 */
export function safeDivide(numerator: number, denominator: number): number {
  if (denominator === 0) {
    return numerator === 0 ? 1 : 0;
  }
  return numerator / denominator;
}

/**
 * 应用非线性映射
 * 使用S型曲线和阈值处理来优化评分分布
 */
export function applyNonlinearMapping(
  value: number, 
  exponent: number,
  config: GeometryScoreConfig
): number {
  // 确保输入值在有效范围内
  const normalizedValue = Math.max(0, Math.min(1, value));

  // 使用配置的阈值处理接近完美的情况
  const { perfectScoreThreshold } = config.curves;
  if (normalizedValue > perfectScoreThreshold) {
    // 在阈值附近使用线性插值，保持较高分数
    return perfectScoreThreshold + (normalizedValue - perfectScoreThreshold) * 2;
  }
  
  // 对于严格模式，使用指数作为惩罚因子
  if (exponent > 1) {
    // 计算惩罚系数，随着exponent增加而增加
    const penaltyFactor = Math.pow(2, exponent - 1);
    // 对非完美分数进行惩罚
    return Math.pow(normalizedValue, penaltyFactor);
  }

  // 对于标准模式，直接使用指数
  return Math.pow(normalizedValue, exponent);
}

/**
 * 计算数组平均值
 */
export function calculateAverage(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  const sum = numbers.reduce((a, b) => a + b, 0);
  return safeDivide(sum, numbers.length);
}

/**
 * 将分数规范化到0-100范围
 */
export function normalizeScore(score: number): number {
  return Math.min(100, Math.max(0, score * 100));
}

/**
 * 验证权重和是否为1
 */
export function validateWeights(weights: Record<string, number>): boolean {
  const sum = Object.values(weights).reduce((acc, val) => acc + val, 0);
  return Math.abs(sum - 1) < 0.0001; // 允许一点点浮点数误差
}
