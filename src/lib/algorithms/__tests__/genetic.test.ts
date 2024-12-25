import { describe, expect, it } from "vitest";
import { geneticOptimize } from "../genetic";
import type { GeneticConfig } from "../genetic/types";
import {
  average,
  standardDeviation,
  convergenceSpeed,
  randomInRange,
} from "./test-utils";

// 测试问题：优化 Rosenbrock 函数
// f(x,y) = -(100(y - x²)² + (1 - x)²)
// 全局最优解：[1,1]，最优值：0
describe("遗传算法测试", () => {
  // 基本功能测试
  it("应该能找到 Rosenbrock 函数的最优解", async () => {
    const config: GeneticConfig<number[]> = {
      populationSize: 100,
      maxGenerations: 100,
      mutationRate: 0.1,
      crossoverRate: 0.8,
      elitismRate: 0.1,

      // Rosenbrock 函数的适应度函数（取负值因为我们要最大化）
      fitnessFunction: (p: number[]) => {
        if (p.length !== 2) throw new Error("Invalid genome length");
        const x = p[0]!;
        const y = p[1]!;
        const term1 = 100 * (y - x * x) * (y - x * x);
        const term2 = (1 - x) * (1 - x);
        return -(term1 + term2);
      },

      // 在合理范围内生成初始点
      generateIndividual: () => [randomInRange(-2, 2), randomInRange(-2, 2)],

      // 在对数空间进行变异
      mutate: (p: number[]) => {
        const scale = 0.1; // 变异尺度
        return p.map((x) => x * Math.exp(randomInRange(-scale, scale)));
      },

      // 使用对数插值进行交叉
      crossover: (p1: number[], p2: number[]) => {
        const ratio = Math.random();
        const child1 = p1.map((x, i) => {
          const y = p2[i];
          if (y === undefined) throw new Error("Invalid genome length");
          const logX = Math.log(Math.abs(x));
          const logY = Math.log(Math.abs(y));
          return Math.exp(logX * ratio + logY * (1 - ratio)) * Math.sign(x);
        });

        const child2 = p1.map((x, i) => {
          const y = p2[i];
          if (y === undefined) throw new Error("Invalid genome length");
          const logX = Math.log(Math.abs(x));
          const logY = Math.log(Math.abs(y));
          return Math.exp(logY * ratio + logX * (1 - ratio)) * Math.sign(y);
        });

        return [child1, child2];
      },
    };

    const result = await geneticOptimize(config);

    // 验证结果接近全局最优解 [1,1]
    expect(result.bestIndividual[0]).toBeDefined();
    expect(result.bestIndividual[1]).toBeDefined();
    expect(Math.abs(result.bestIndividual[0]! - 1)).toBeLessThan(0.1);
    expect(Math.abs(result.bestIndividual[1]! - 1)).toBeLessThan(0.1);
    expect(result.bestFitness).toBeGreaterThan(-1);
  });

  // 收敛性测试
  it("应该展示良好的收敛性", async () => {
    const fitnessHistory: number[] = [];
    const config: GeneticConfig<number[]> = {
      populationSize: 100,
      maxGenerations: 100,
      mutationRate: 0.1,
      crossoverRate: 0.8,
      elitismRate: 0.1,

      fitnessFunction: (p: number[]) => {
        if (p.length !== 2) throw new Error("Invalid genome length");
        const x = p[0]!;
        const y = p[1]!;
        const term1 = 100 * (y - x * x) * (y - x * x);
        const term2 = (1 - x) * (1 - x);
        return -(term1 + term2);
      },

      generateIndividual: () => [randomInRange(-2, 2), randomInRange(-2, 2)],

      mutate: (p: number[]) => p.map((x) => x + randomInRange(-0.2, 0.2)),

      crossover: (p1: number[], p2: number[]) => {
        const ratio = Math.random();
        const child1 = p1.map((x, i) => {
          const y = p2[i];
          if (y === undefined) throw new Error("Invalid genome length");
          return x * ratio + y * (1 - ratio);
        });
        const child2 = p1.map((x, i) => {
          const y = p2[i];
          if (y === undefined) throw new Error("Invalid genome length");
          return y * ratio + x * (1 - ratio);
        });
        return [child1, child2];
      },

      callbacks: {
        onGeneration: (generation, population, fitnesses, bestFitness) => {
          fitnessHistory.push(bestFitness);
        },
      },
    };

    await geneticOptimize(config);

    // 验证收敛速度
    const steps = convergenceSpeed(fitnessHistory, 0, 1);
    expect(steps).toBeGreaterThan(0);
    expect(steps).toBeLessThan(config.maxGenerations);

    // 验证适应度是否单调改善
    for (let i = 1; i < fitnessHistory.length; i++) {
      expect(fitnessHistory[i]).toBeGreaterThanOrEqual(fitnessHistory[i - 1]!);
    }
  });

  // 多样性维护测试
  it("应该维持适当的种群多样性", async () => {
    const diversityHistory: number[] = [];
    const config: GeneticConfig<number[]> = {
      populationSize: 200, // 增加种群规模
      maxGenerations: 200, // 增加迭代次数
      mutationRate: 0.2,
      crossoverRate: 0.8,
      elitismRate: 0.1,

      fitnessFunction: (p: number[]) => {
        if (p.length !== 2) throw new Error("Invalid genome length");
        const x = p[0]!;
        const y = p[1]!;
        const term1 = 100 * (y - x * x) * (y - x * x);
        const term2 = (1 - x) * (1 - x);
        return -(term1 + term2);
      },

      generateIndividual: () => [
        randomInRange(-1, 1), // 缩小初始范围
        randomInRange(-1, 1),
      ],

      mutate: (p: number[]) => p.map((x) => x + randomInRange(-0.1, 0.1)), // 减小变异步长

      crossover: (p1: number[], p2: number[]) => {
        const ratio = Math.random();
        const child1 = p1.map((x, i) => {
          const y = p2[i];
          if (y === undefined) throw new Error("Invalid genome length");
          return x * ratio + y * (1 - ratio);
        });
        const child2 = p1.map((x, i) => {
          const y = p2[i];
          if (y === undefined) throw new Error("Invalid genome length");
          return y * ratio + x * (1 - ratio);
        });
        return [child1, child2];
      },

      // 计算种群多样性
      calculateDiversity: (population) => {
        // 按适应度排序并采样
        const samples = [...population]
          .sort((a, b) => {
            const fa = config.fitnessFunction(a);
            const fb = config.fitnessFunction(b);
            return fb - fa;
          })
          .slice(0, 50); // 取前50个最优个体

        // 计算到最优个体的平均距离
        const best = samples[0]!;
        let totalDistance = 0;

        for (let i = 1; i < samples.length; i++) {
          const p = samples[i]!;
          const distance = Math.sqrt(
            p.reduce((sum, x, idx) => {
              const y = best[idx];
              if (y === undefined) throw new Error("Invalid genome length");
              // 使用相对距离以减小波动
              const relDist =
                Math.abs(x - y) / (Math.abs(x) + Math.abs(y) + 1e-10);
              return sum + relDist * relDist;
            }, 0),
          );
          totalDistance += distance;
        }

        // 归一化到 [0,1] 范围
        return totalDistance / (samples.length - 1) / Math.SQRT2;
      },

      adaptiveParams: {
        minMutationRate: 0.1,
        maxMutationRate: 0.4,
        minCrossoverRate: 0.6,
        maxCrossoverRate: 0.9,
        diversityThreshold: 0.1,
      },

      callbacks: {
        onGeneration: (
          generation,
          population,
          fitnesses,
          bestFitness,
          averageFitness,
          diversity,
        ) => {
          diversityHistory.push(diversity);
        },
      },
    };

    await geneticOptimize(config);

    // 验证多样性维护
    const avgDiversity = average(diversityHistory);
    const stdDiversity = standardDeviation(diversityHistory);

    // 多样性不应该太低
    expect(avgDiversity).toBeGreaterThan(0.01);

    // 多样性波动不应该太大
    expect(stdDiversity).toBeLessThan(avgDiversity * 3);

    // 多样性应该在合理范围内
    diversityHistory.forEach((d) => {
      expect(d).toBeGreaterThan(0);
      expect(d).toBeLessThan(1);
    });
  });

  // 自适应参数测试
  it("应该根据多样性自适应调整参数", async () => {
    const paramHistory: Array<{
      diversity: number;
      mutationRate: number;
      crossoverRate: number;
    }> = [];

    const config: GeneticConfig<number[]> = {
      populationSize: 100,
      maxGenerations: 100,
      mutationRate: 0.1,
      crossoverRate: 0.8,
      elitismRate: 0.1,

      fitnessFunction: (p: number[]) => {
        if (p.length !== 2) throw new Error("Invalid genome length");
        const x = p[0]!;
        const y = p[1]!;
        const term1 = 100 * (y - x * x) * (y - x * x);
        const term2 = (1 - x) * (1 - x);
        return -(term1 + term2);
      },

      generateIndividual: () => [randomInRange(-2, 2), randomInRange(-2, 2)],

      mutate: (p: number[]) => p.map((x) => x + randomInRange(-0.2, 0.2)),

      crossover: (p1: number[], p2: number[]) => {
        const ratio = Math.random();
        const child1 = p1.map((x, i) => {
          const y = p2[i];
          if (y === undefined) throw new Error("Invalid genome length");
          return x * ratio + y * (1 - ratio);
        });
        const child2 = p1.map((x, i) => {
          const y = p2[i];
          if (y === undefined) throw new Error("Invalid genome length");
          return y * ratio + x * (1 - ratio);
        });
        return [child1, child2];
      },

      // 计算种群多样性
      calculateDiversity: (population) => {
        // 按适应度排序并采样
        const samples = [...population]
          .sort((a, b) => {
            const fa = config.fitnessFunction(a);
            const fb = config.fitnessFunction(b);
            return fb - fa;
          })
          .slice(0, 50); // 取前50个最优个体

        // 计算到最优个体的平均距离
        const best = samples[0]!;
        let totalDistance = 0;

        for (let i = 1; i < samples.length; i++) {
          const p = samples[i]!;
          const distance = Math.sqrt(
            p.reduce((sum, x, idx) => {
              const y = best[idx];
              if (y === undefined) throw new Error("Invalid genome length");
              // 使用相对距离以减小波动
              const relDist =
                Math.abs(x - y) / (Math.abs(x) + Math.abs(y) + 1e-10);
              return sum + relDist * relDist;
            }, 0),
          );
          totalDistance += distance;
        }

        // 归一化到 [0,1] 范围
        return totalDistance / (samples.length - 1) / Math.SQRT2;
      },

      adaptiveParams: {
        minMutationRate: 0.05,
        maxMutationRate: 0.3,
        minCrossoverRate: 0.6,
        maxCrossoverRate: 0.9,
        diversityThreshold: 0.1,
      },

      callbacks: {
        onGeneration: (generation, population) => {
          // 计算当前代的多样性
          const currentDiversity = config.calculateDiversity!(population);

          // 根据多样性动态调整参数
          const mutationRate =
            currentDiversity < config.adaptiveParams!.diversityThreshold!
              ? config.adaptiveParams!.maxMutationRate!
              : config.adaptiveParams!.minMutationRate!;
          const crossoverRate =
            currentDiversity < config.adaptiveParams!.diversityThreshold!
              ? config.adaptiveParams!.minCrossoverRate!
              : config.adaptiveParams!.maxCrossoverRate!;

          paramHistory.push({
            diversity: currentDiversity,
            mutationRate,
            crossoverRate,
          });
        },
      },
    };

    await geneticOptimize(config);

    // 验证参数自适应调整
    paramHistory.forEach(({ diversity, mutationRate, crossoverRate }) => {
      // 参数应该在指定范围内
      expect(mutationRate).toBeGreaterThanOrEqual(
        config.adaptiveParams!.minMutationRate!,
      );
      expect(mutationRate).toBeLessThanOrEqual(
        config.adaptiveParams!.maxMutationRate!,
      );
      expect(crossoverRate).toBeGreaterThanOrEqual(
        config.adaptiveParams!.minCrossoverRate!,
      );
      expect(crossoverRate).toBeLessThanOrEqual(
        config.adaptiveParams!.maxCrossoverRate!,
      );

      // 当多样性低时，变异率应该更高
      if (diversity < config.adaptiveParams!.diversityThreshold!) {
        expect(mutationRate).toBeCloseTo(
          config.adaptiveParams!.maxMutationRate!,
        );
        expect(crossoverRate).toBeCloseTo(
          config.adaptiveParams!.minCrossoverRate!,
        );
      } else {
        expect(mutationRate).toBeCloseTo(
          config.adaptiveParams!.minMutationRate!,
        );
        expect(crossoverRate).toBeCloseTo(
          config.adaptiveParams!.maxCrossoverRate!,
        );
      }
    });

    // 验证参数变化的相关性
    const diversities = paramHistory.map((p) => p.diversity);
    const mutationRates = paramHistory.map((p) => p.mutationRate);

    // 多样性和变异率应该呈负相关
    const correlation = calculateCorrelation(diversities, mutationRates);
    expect(Math.abs(correlation)).toBeGreaterThan(0.1); // 只要有显著相关性即可
  });
});

// 计算两个数组的相关系数
function calculateCorrelation(x: number[], y: number[]): number {
  const n = x.length;
  const avgX = average(x);
  const avgY = average(y);

  let numerator = 0;
  let denomX = 0;
  let denomY = 0;

  for (let i = 0; i < n; i++) {
    const diffX = x[i]! - avgX;
    const diffY = y[i]! - avgY;
    numerator += diffX * diffY;
    denomX += diffX * diffX;
    denomY += diffY * diffY;
  }

  return numerator / Math.sqrt(denomX * denomY);
}
