import type { Range } from "./types";

export interface DiversityConfig {
  ranges: Record<string, Range>;
  excludeParams?: string[];
  getNormalizedDistance?: (
    value1: number,
    value2: number,
    range: Range,
  ) => number;
}

export function calculatePopulationDiversity<T extends Record<string, number>>(
  population: T[],
  config: DiversityConfig,
): number {
  let totalDistance = 0;
  let count = 0;

  // 默认的归一化距离计算
  const defaultNormalizedDistance = (
    value1: number,
    value2: number,
    range: Range,
  ) => {
    return Math.abs(value1 - value2) / (range.max - range.min);
  };

  const getNormalizedDistance =
    config.getNormalizedDistance ?? defaultNormalizedDistance;

  for (let i = 0; i < population.length; i++) {
    for (let j = i + 1; j < population.length; j++) {
      let distance = 0;

      // 计算每个参数的归一化差异
      for (const key of Object.keys(config.ranges)) {
        if (config.excludeParams?.includes(key)) continue;

        const range = config.ranges[key];
        const value1 = population[i]![key];
        const value2 = population[j]![key];

        if (value1 !== undefined && value2 !== undefined && range) {
          const diff = getNormalizedDistance(value1, value2, range);
          distance += diff * diff;
        }
      }

      totalDistance += Math.sqrt(distance);
      count++;
    }
  }

  return count > 0 ? totalDistance / count : 0;
}
