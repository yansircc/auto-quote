import type { OptimizerConfig, SumConstrainedGroup } from "./types";
import {
  generateRandomInRange,
  mutateValueInRange,
} from "../utils/range-utils";

/**
 * 参数生成器类
 * 用于生成和变异满足约束的参数
 */
export class ParameterGenerator<T extends Record<string, number>> {
  constructor(private config: OptimizerConfig<T>) {}

  /**
   * 生成随机参数
   */
  generateRandom(): T {
    const params = {} as T;

    // 生成非约束参数的随机值
    for (const [key, range] of Object.entries(this.config.ranges)) {
      if (this.isConstrainedParam(key)) continue;
      const value = generateRandomInRange(range);
      if (typeof value === "number") {
        params[key as keyof T] = value as T[keyof T];
      }
    }

    // 处理和为特定值的约束
    if (this.config.sumConstraints) {
      this.config.sumConstraints.forEach((constraint) => {
        this.handleSumConstraint(params, constraint);
      });
    }

    return params;
  }

  /**
   * 变异参数
   */
  mutate(params: T): T {
    const mutated = { ...params };

    // 获取可变异的参数列表（非约束参数）
    const availableKeys = Object.keys(this.config.ranges).filter(
      (key) => !this.isConstrainedParam(key),
    );

    if (availableKeys.length === 0) return mutated;

    // 随机选择一个参数进行变异
    const randomIndex = Math.floor(Math.random() * availableKeys.length);
    const selectedKey = availableKeys[randomIndex];
    if (!selectedKey) return mutated;

    const range = this.config.ranges[selectedKey];
    const currentValue = mutated[selectedKey as keyof T];

    if (range && typeof currentValue === "number") {
      const newValue = mutateValueInRange(currentValue, range);
      if (typeof newValue === "number") {
        mutated[selectedKey as keyof T] = newValue as T[keyof T];
      }

      // 处理相关约束
      if (this.config.sumConstraints) {
        this.config.sumConstraints.forEach((constraint) => {
          if (constraint.params.includes(selectedKey)) {
            this.handleSumConstraint(mutated, constraint);
          }
        });
      }
    }

    return mutated;
  }

  /**
   * 判断参数是否受约束
   */
  private isConstrainedParam(param: string): boolean {
    return (
      this.config.sumConstraints?.some((constraint) =>
        constraint.params.includes(param),
      ) ?? false
    );
  }

  /**
   * 处理和约束
   */
  private handleSumConstraint(
    params: Partial<T>,
    constraint: SumConstrainedGroup,
  ): void {
    if (!constraint.params.length) return;

    const lastParam = constraint.params[constraint.params.length - 1];
    if (!lastParam) return;

    let sum = 0;

    // 计算已分配的值之和
    for (let i = 0; i < constraint.params.length - 1; i++) {
      const param = constraint.params[i];
      if (!param) continue;

      const paramKey = param as keyof T;
      const currentValue = params[paramKey];

      if (typeof currentValue !== "number") {
        const range = this.config.ranges[param];
        if (!range) continue;

        // 为非最后一个参数预留空间，确保最后一个参数有合理的取值范围
        const remainingParams = constraint.params.length - i - 1;
        const minSum = remainingParams * range.min;
        const maxAllowed = constraint.targetSum - minSum;

        const paramValue = generateRandomInRange({
          min: range.min,
          max: Math.min(range.max, maxAllowed),
        });

        params[paramKey] = paramValue as T[keyof T];
        sum += paramValue;
      } else {
        sum += currentValue;
      }
    }

    // 计算最后一个参数的目标值
    const lastRange = this.config.ranges[lastParam];
    const targetValue = constraint.targetSum - sum;

    if (lastRange) {
      // 检查目标值是否在允许范围内
      const minAllowed = lastRange.min - constraint.tolerance;
      const maxAllowed = lastRange.max + constraint.tolerance;

      if (targetValue < minAllowed || targetValue > maxAllowed) {
        // 如果超出范围，重新生成所有参数
        for (const key of Object.keys(params)) {
          delete params[key as keyof T];
        }
        this.handleSumConstraint(params, constraint);
        return;
      }

      // 在容忍范围内调整最后一个参数的值
      const adjustedValue = Math.max(
        lastRange.min,
        Math.min(lastRange.max, targetValue),
      );
      params[lastParam as keyof T] = adjustedValue as T[keyof T];
    }
  }
}
