/**
 * 计算数组的平均值
 * @param numbers 数值数组
 * @returns 平均值，如果数组为空返回0
 */
export function calculateMean(numbers: number[]): number {
  if (!numbers || numbers.length === 0) {
    return 0;
  }
  return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
}

/**
 * 计算数组的标准差
 * @param numbers 数值数组
 * @returns 标准差，如果数组为空或只有一个元素返回0
 */
export function calculateStandardDeviation(numbers: number[]): number {
  if (!numbers || numbers.length <= 1) {
    return 0;
  }

  const mean = calculateMean(numbers);
  const squaredDifferences = numbers.map((num) => Math.pow(num - mean, 2));
  const variance = calculateMean(squaredDifferences);
  return Math.sqrt(variance);
}

/**
 * 计算变异系数 (CV)
 * CV = 标准差 / 平均值
 * @param numbers 数值数组
 * @returns 变异系数，如果数组为空或平均值为0返回0
 */
export function calculateCV(numbers: number[]): number {
  if (!numbers || numbers.length === 0) {
    return 0;
  }

  const mean = calculateMean(numbers);
  if (mean === 0) {
    return 0;
  }

  return calculateStandardDeviation(numbers) / mean;
}

/**
 * 计算极差比
 * Range Ratio = (max - min) / max
 * @param numbers 数值数组
 * @returns 极差比，如果数组为空返回0
 */
export function calculateRange(numbers: number[]): number {
  if (!numbers || numbers.length === 0) {
    return 0;
  }

  const max = Math.max(...numbers);
  if (max === 0) {
    return 0;
  }

  const min = Math.min(...numbers);
  return (max - min) / max;
}

/**
 * 计算最大值与平均值的比值
 * @param values 数值数组
 * @returns 最大值与平均值的比值，如果数组为空或平均值为0，返回0
 */
export function calculateRatio(values: number[]): number {
  if (!values || values.length === 0) {
    return 0;
  }

  const mean = calculateMean(values);
  if (mean === 0) {
    return 0;
  }

  const max = Math.max(...values);
  return max / mean;
}

/**
 * 计算相对标准差 (RSD)
 * RSD = 标准差 / 平均值 * 100%
 * @param values 数值数组
 * @returns 相对标准差，如果数组为空或平均值为0，返回0
 */
export function calculateRSD(values: number[]): number {
  if (!values || values.length === 0) {
    return 0;
  }

  const mean = calculateMean(values);
  if (mean === 0) {
    return 0;
  }

  const sd = calculateStandardDeviation(values);
  return sd / mean;
}
