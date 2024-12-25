import type {
  ParamRange,
  OrderedParamGroup,
  SumConstrainedGroup,
} from "./types";

/**
 * 验证参数是否在指定范围内
 */
export function validateRanges<T extends Record<string, number>>(
  params: T,
  ranges: Record<keyof T, ParamRange>,
): boolean {
  return Object.entries(params).every(([key, value]) => {
    const range = ranges[key as keyof T];
    if (!range) return false;
    return (
      typeof value === "number" && value >= range.min && value <= range.max
    );
  });
}

/**
 * 验证参数是否满足顺序约束
 */
export function validateOrderedGroups<T extends Record<string, number>>(
  params: T,
  orderedGroups: OrderedParamGroup[],
): boolean {
  return orderedGroups.every((group) => {
    for (let i = 0; i < group.params.length - 1; i++) {
      const currentKey = group.params[i] as keyof T;
      const nextKey = group.params[i + 1] as keyof T;
      const currentValue = params[currentKey];
      const nextValue = params[nextKey];

      if (!currentValue || !nextValue) {
        return false;
      }

      if (
        typeof currentValue !== "number" ||
        typeof nextValue !== "number" ||
        currentValue >= nextValue
      ) {
        return false;
      }
    }
    return true;
  });
}

/**
 * 验证参数是否满足和约束
 */
export function validateSumConstraints<T extends Record<string, number>>(
  params: T,
  sumConstraints: SumConstrainedGroup[],
): boolean {
  return sumConstraints.every((group) => {
    const sum = group.params.reduce((acc, param) => {
      const value = params[param as keyof T];
      if (typeof value !== "number" || value === undefined) {
        console.warn(`Parameter ${param} is not a number. Using 0 instead.`);
        return acc;
      }
      return acc + value;
    }, 0);
    return Math.abs(sum - group.targetSum) <= group.tolerance;
  });
}

/**
 * 验证所有约束
 */
export function validateAllConstraints<T extends Record<string, number>>(
  params: T,
  ranges: Record<keyof T, ParamRange>,
  orderedGroups: OrderedParamGroup[] = [],
  sumConstraints: SumConstrainedGroup[] = [],
): boolean {
  return (
    validateRanges(params, ranges) &&
    validateOrderedGroups(params, orderedGroups) &&
    validateSumConstraints(params, sumConstraints)
  );
}
