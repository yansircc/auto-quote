import type { GeometricConfig } from "../types";
import type { Range, ConfigRange } from "../types";
import { runBalanceTests } from "../__tests__/test-runner";
import { DEFAULT_CONFIG } from "../constants";
import { CONFIG_RANGES } from "./optimizer-config";

function isRange(value: unknown): value is Range {
  return (
    typeof value === "object" &&
    value !== null &&
    "min" in value &&
    "max" in value &&
    "step" in value
  );
}

function isConfigRange(value: unknown): value is ConfigRange {
  return typeof value === "object" && value !== null && !isRange(value);
}

/**
 * 生成随机配置
 */
function generateRandomConfig(): GeometricConfig {
  const config = structuredClone(DEFAULT_CONFIG);

  function randomizeObject(
    obj: Record<string, unknown>,
    ranges: ConfigRange,
  ): void {
    for (const [key, range] of Object.entries(ranges)) {
      if (isRange(range)) {
        // 如果是数值范围
        const min = range.min;
        const max = range.max;
        const step = range.step;
        obj[key] =
          Math.round((min + Math.random() * (max - min)) / step) * step;
      } else if (isConfigRange(range)) {
        // 如果是嵌套对象
        if (typeof obj[key] !== "object") {
          obj[key] = {};
        }
        const target = obj[key];
        if (typeof target === "object" && target !== null) {
          randomizeObject(target as Record<string, unknown>, range);
        }
      }
    }
  }

  randomizeObject(config, CONFIG_RANGES);
  return config;
}

/**
 * 评估配置的适应度
 */
function evaluateConfig(config: GeometricConfig): number {
  const results = runBalanceTests(config);
  let totalScore = 0;
  let minScore = Infinity;
  let maxScore = -Infinity;

  for (const result of results) {
    const score = result.success
      ? 100
      : result.deviation
        ? 50 - result.deviation
        : 0;

    totalScore += score;
    minScore = Math.min(minScore, score);
    maxScore = Math.max(maxScore, score);
  }

  // 平均分
  const avgScore = totalScore / results.length;

  // 稳定性惩罚（分数波动大的配置得分会降低）
  const stabilityPenalty = (maxScore - minScore) * 0.1;

  // 最终得分 = 平均分 - 稳定性惩罚
  return Math.max(0, avgScore - stabilityPenalty);
}

/**
 * 锦标赛选择
 */
function tournamentSelection(
  population: GeometricConfig[],
  scores: number[],
): GeometricConfig {
  const tournamentSize = Math.min(5, population.length);
  const indices = Array.from({ length: tournamentSize }, () =>
    Math.floor(Math.random() * population.length),
  );

  const winner = indices.reduce((best, current) => {
    if (!scores[current] || !scores[best]) {
      throw new Error("Invalid tournament selection: score not found");
    }
    return scores[current] > scores[best] ? current : best;
  });

  const selectedConfig = population[winner];
  if (!selectedConfig) {
    throw new Error("Invalid tournament selection: config not found");
  }

  return structuredClone(selectedConfig);
}

/**
 * 交叉操作
 */
function crossover(
  parent1: GeometricConfig,
  parent2: GeometricConfig,
): GeometricConfig[] {
  const child1 = structuredClone(parent1);
  const child2 = structuredClone(parent2);

  function crossoverObjects(
    obj1: Record<string, unknown>,
    obj2: Record<string, unknown>,
  ): void {
    for (const key of Object.keys(obj1)) {
      if (typeof obj1[key] === "object" && typeof obj2[key] === "object") {
        crossoverObjects(
          obj1[key] as Record<string, unknown>,
          obj2[key] as Record<string, unknown>,
        );
      } else if (
        typeof obj1[key] === "number" &&
        typeof obj2[key] === "number"
      ) {
        // 对数值进行交叉
        if (Math.random() < 0.5) {
          const temp = obj1[key];
          obj1[key] = obj2[key];
          obj2[key] = temp;
        }
      }
    }
  }

  crossoverObjects(child1, child2);
  return [child1, child2];
}

/**
 * 变异操作
 */
function mutate(config: GeometricConfig): void {
  function mutateObject(
    obj: Record<string, unknown>,
    ranges: ConfigRange,
  ): void {
    for (const [key, range] of Object.entries(ranges)) {
      if (isRange(range)) {
        // 如果是数值范围，有一定概率进行变异
        if (Math.random() < 0.1) {
          const min = range.min;
          const max = range.max;
          const step = range.step;
          const current = obj[key] as number;
          const mutation = (Math.random() - 0.5) * (max - min) * 0.1;
          let newValue = current + mutation;
          newValue = Math.max(min, Math.min(max, newValue));
          newValue = Math.round(newValue / step) * step;
          obj[key] = newValue;
        }
      } else if (isConfigRange(range)) {
        // 如果是嵌套对象，递归处理
        const target = obj[key];
        if (typeof target === "object" && target !== null) {
          mutateObject(target as Record<string, unknown>, range);
        }
      }
    }
  }

  mutateObject(config, CONFIG_RANGES);
}

/**
 * 使用遗传算法寻找最佳配置
 */
export async function findBestConfigGenetic(
  populationSize: number,
  generations: number,
  onProgress?: (generation: number, bestScore: number) => void,
): Promise<GeometricConfig> {
  try {
    // 初始化种群
    const population = Array.from(
      { length: populationSize },
      generateRandomConfig,
    );
    let bestConfig = population[0] ?? generateRandomConfig();
    let bestScore = -Infinity;

    // 进化过程
    for (let gen = 0; gen < generations; gen++) {
      // 评估当前种群
      const scores: number[] = [];
      for (const config of population) {
        try {
          const score = evaluateConfig(config);
          scores.push(score);

          // 更新最佳配置
          if (score > bestScore) {
            bestScore = score;
            bestConfig = { ...config };
          }
        } catch (error) {
          console.error("配置评估失败:", error);
          scores.push(0);
        }
      }

      // 报告进度
      onProgress?.(gen, bestScore);

      // 生成下一代
      const newPopulation: GeometricConfig[] = [];
      // 保留精英
      const eliteCount = Math.max(1, Math.floor(populationSize * 0.1));
      const elites = population
        .map((config, index) => {
          const score = scores[index];
          if (score === undefined) {
            throw new Error("Invalid score index");
          }
          return { config, score };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, eliteCount)
        .map((e) => structuredClone(e.config));

      newPopulation.push(...elites);

      // 生成新个体
      while (newPopulation.length < populationSize) {
        const parent1 = tournamentSelection(population, scores);
        const parent2 = tournamentSelection(population, scores);
        const children = crossover(parent1, parent2);

        // 变异
        children.forEach((child) => {
          if (Math.random() < 0.1) {
            mutate(child);
          }
        });

        newPopulation.push(...children);
      }

      // 如果生成的个体过多，随机移除一些（保护精英）
      while (newPopulation.length > populationSize) {
        const removeIndex =
          Math.floor(Math.random() * (newPopulation.length - eliteCount)) +
          eliteCount;
        newPopulation.splice(removeIndex, 1);
      }

      // 更新种群
      population.splice(0, population.length, ...newPopulation);
    }

    return bestConfig;
  } catch (error) {
    console.error("遗传算法优化失败:", error);
    throw error;
  }
}
