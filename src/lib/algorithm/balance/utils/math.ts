/**
 * Calculate weighted variance for a set of values and their weights
 * 计算加权方差
 */
export function calculateWeightedVariance(
  values: number[],
  weights: number[]
): number {
  if (!values.length || !weights.length) return 0;

  if (values.length !== weights.length) {
    throw new Error('Values and weights arrays must be of the same length.');
  }

  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  if (totalWeight === 0) return 0;

  const weightedMean =
    values.reduce((sum, v, i) => sum + v * weights[i]!, 0) / totalWeight;

  return (
    values.reduce(
      (sum, v, i) => sum + weights[i]! * Math.pow(v - weightedMean, 2),
      0
    ) / totalWeight
  );
}

/**
 * Normalize a score to 0-100 range
 * 将分数归一化到0-100范围
 * @param value The value to normalize
 * @param maxVariance The maximum acceptable variance (will result in score 0)
 * @returns Normalized score between 0 and 100
 */
export function normalizeScore(
  value: number,
  maxVariance = 1000
): number {
  // For variance, smaller is better
  // 对于方差来说，越小越好
  if (value >= maxVariance) return 0;
  if (value <= 0) return 100;
  
  return Math.max(0, Math.min(100, 
    100 * (1 - value / maxVariance)
  ));
}

/**
 * Calculate weighted average of scores
 * 计算加权平均分
 */
export function weightedAverage(
  scoreWeightPairs: [number, number][]
): number {
  if (!scoreWeightPairs.length) return 0;
  
  const totalWeight = scoreWeightPairs.reduce((sum, [_, w]) => sum + w, 0);
  if (totalWeight === 0) return 0;
  
  return scoreWeightPairs.reduce(
    (sum, [score, weight]) => sum + score * weight,
    0
  ) / totalWeight;
}
