/**
 * 测试工具函数
 */

/**
 * 计算两点之间的欧几里得距离
 */
export function distance(
  p1: { x: number; y: number },
  p2: { x: number; y: number },
): number {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * 检查点是否在指定范围内
 */
export function isInRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

/**
 * 计算数组的平均值
 */
export function average(arr: number[]): number {
  if (arr.length === 0) return 0;
  return arr.reduce((sum, val) => sum + val, 0) / arr.length;
}

/**
 * 计算数组的标准差
 */
export function standardDeviation(arr: number[]): number {
  if (arr.length === 0) return 0;
  const avg = average(arr);
  const squareDiffs = arr.map((value) => {
    const diff = value - avg;
    return diff * diff;
  });
  return Math.sqrt(average(squareDiffs));
}

/**
 * 生成指定范围内的随机数
 */
export function randomInRange(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

/**
 * 检查一个数组是否按升序排序
 */
export function isSorted(arr: number[]): boolean {
  for (let i = 1; i < arr.length; i++) {
    if (arr[i]! < arr[i - 1]!) return false;
  }
  return true;
}

/**
 * 计算一组数据的收敛速度
 * 返回达到目标值所需的步数，如果未收敛则返回 -1
 */
export function convergenceSpeed(
  values: number[],
  targetValue: number,
  tolerance: number,
): number {
  for (let i = 0; i < values.length; i++) {
    if (Math.abs(values[i]! - targetValue) <= tolerance) {
      return i + 1;
    }
  }
  return -1;
}
