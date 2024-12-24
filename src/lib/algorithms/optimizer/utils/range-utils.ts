import type { RelativeRange, ParamRange } from "../core/types";

/**
 * 将相对范围转换为绝对范围
 */
export function relativeToAbsolute<T extends Record<string, RelativeRange>>(
  relativeRanges: T,
): Record<keyof T, ParamRange> {
  const result: Record<string, ParamRange> = {};

  for (const [key, relative] of Object.entries(relativeRanges)) {
    result[key] = {
      min: Math.max(0, relative.base - relative.variation), // 确保不会出现负数
      max: relative.base + relative.variation,
    };
  }

  return result as Record<keyof T, ParamRange>;
}

/**
 * 生成指定范围内的随机数
 */
export function generateRandomInRange(range: ParamRange): number {
  const { min, max, step } = range;
  if (typeof step === "number" && step > 0) {
    const steps = Math.floor((max - min) / step);
    return min + Math.floor(Math.random() * (steps + 1)) * step;
  }
  return min + Math.random() * (max - min);
}

/**
 * 在指定范围内变异一个值
 */
export function mutateValueInRange(
  value: number,
  range: ParamRange,
  mutationStrength = 0.1,
): number {
  const { min, max, step } = range;
  const mutationRange = (max - min) * mutationStrength;
  let newValue = value + (Math.random() * 2 - 1) * mutationRange;
  newValue = Math.max(min, Math.min(max, newValue));

  if (typeof step === "number" && step > 0) {
    newValue = Math.round(newValue / step) * step;
  }

  return newValue;
}

/**
 * 确保值在范围内
 */
export function clampToRange(value: number, range: ParamRange): number {
  return Math.max(range.min, Math.min(range.max, value));
}

/**
 * 计算两个范围的重叠部分
 */
export function calculateOverlap(
  range1: ParamRange,
  range2: ParamRange,
): ParamRange | null {
  const overlapMin = Math.max(range1.min, range2.min);
  const overlapMax = Math.min(range1.max, range2.max);

  if (overlapMin <= overlapMax) {
    return { min: overlapMin, max: overlapMax };
  }
  return null;
}
