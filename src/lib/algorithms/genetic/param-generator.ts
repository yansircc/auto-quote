import type { Range, ParamConfig } from "./types";

export class ParamGenerator<T extends Record<string, number>> {
  constructor(private config: ParamConfig) {}

  generateRandom(): T {
    const params: Partial<T> = {};

    // 生成非约束参数
    for (const [key, range] of Object.entries(this.config.ranges)) {
      // 跳过受约束的参数
      if (this.isConstrainedParam(key)) continue;

      const value = this.generateRandomInRange(range);
      if (typeof value === "number") {
        params[key as keyof T] = value as T[keyof T];
      }
    }

    // 处理和为特定值的约束
    if (this.config.constraints?.sumTo) {
      for (const constraint of this.config.constraints.sumTo) {
        this.handleSumConstraint(params, constraint);
      }
    }

    return params as T;
  }

  mutate(individual: T): T {
    const mutated = { ...individual };
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
      const newValue = this.mutateValueInRange(currentValue, range);
      if (typeof newValue === "number") {
        mutated[selectedKey as keyof T] = newValue as T[keyof T];
      }

      // 处理相关约束
      if (this.config.constraints?.sumTo) {
        for (const constraint of this.config.constraints.sumTo) {
          if (constraint.params.includes(selectedKey)) {
            this.handleSumConstraint(mutated, constraint);
          }
        }
      }
    }

    return mutated;
  }

  private generateRandomInRange(range: Range): number {
    const { min, max, step } = range;
    if (typeof step === "number") {
      const steps = Math.floor((max - min) / step);
      return min + Math.floor(Math.random() * (steps + 1)) * step;
    }
    return min + Math.random() * (max - min);
  }

  private mutateValueInRange(value: number, range: Range): number {
    const { min, max, step } = range;
    const mutationRange = (max - min) * 0.1; // 10% 变异范围

    let newValue = value + (Math.random() * 2 - 1) * mutationRange;
    newValue = Math.max(min, Math.min(max, newValue));

    if (typeof step === "number") {
      newValue = Math.round(newValue / step) * step;
    }

    return newValue;
  }

  private isConstrainedParam(key: string): boolean {
    return (
      this.config.constraints?.sumTo?.some((constraint) =>
        constraint.params.includes(key),
      ) ?? false
    );
  }

  private handleSumConstraint(
    params: Partial<T>,
    constraint: { value: number; params: string[]; tolerance: number },
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
        const maxAllowed = constraint.value - minSum;

        const paramValue = this.generateRandomInRange({
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
    const targetValue = constraint.value - sum;
    const lastRange = this.config.ranges[lastParam];

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
