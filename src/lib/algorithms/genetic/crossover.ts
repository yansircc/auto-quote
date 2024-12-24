import type { Range, ParamConfig } from "./types";

export interface CrossoverOptions {
  method: "average" | "weighted";
  weight?: number; // 用于weighted方法，默认0.5
  excludeParams?: string[]; // 需要排除的参数
  constraints?: ParamConfig["constraints"]; // 需要维护的约束
}

/**
 * 通用的参数交叉操作
 */
export function crossoverParams<T extends Record<string, number>>(
  parent1: T,
  parent2: T,
  ranges: Record<string, Range>,
  options: CrossoverOptions = { method: "average" },
): [T, T] {
  const child1 = { ...parent1 };
  const child2 = { ...parent2 };
  const weight = options.weight ?? 0.5;

  // 对每个参数进行交叉
  for (const key of Object.keys(ranges)) {
    if (options.excludeParams?.includes(key)) continue;

    const k = key as keyof T;
    if (parent1[k] !== undefined && parent2[k] !== undefined) {
      if (options.method === "weighted") {
        child1[k] = (parent1[k] * weight +
          parent2[k] * (1 - weight)) as T[keyof T];
        child2[k] = (parent1[k] * (1 - weight) +
          parent2[k] * weight) as T[keyof T];
      } else {
        // 默认使用平均值
        const avg = (parent1[k] + parent2[k]) / 2;
        child1[k] = avg as T[keyof T];
        child2[k] = avg as T[keyof T];
      }
    }
  }

  // 处理约束
  if (options.constraints?.sumTo) {
    for (const constraint of options.constraints.sumTo) {
      const lastParam = constraint.params[constraint.params.length - 1];

      for (const child of [child1, child2]) {
        let sum = 0;
        // 计算已分配参数之和
        for (const param of constraint.params) {
          if (param !== lastParam) {
            sum += child[param as keyof T]!;
          }
        }
        // 为最后一个参数分配剩余值
        child[lastParam as keyof T] = (constraint.value - sum) as T[keyof T];
      }
    }
  }

  return [child1, child2];
}
