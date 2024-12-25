import type { GeneticConfig, GeneticResult } from "./types";
import { ParameterGenerator } from "../core/generator";
import { validateAllConstraints } from "../core/validator";

/**
 * 遗传算法优化器类
 */
export class GeneticOptimizer<T extends Record<string, number>> {
  private generator: ParameterGenerator<T>;
  private population: T[];
  private fitnesses: number[];
  private bestSolution: T | null = null;
  private bestFitness = -Infinity;
  private generation = 0;
  private fitnessHistory: number[] = [];

  constructor(private config: GeneticConfig<T>) {
    this.generator = new ParameterGenerator(config.parameterConfig);
    this.population = [];
    this.fitnesses = [];
  }

  /**
   * 运行优化
   */
  optimize(): GeneticResult<T> {
    // 初始化种群
    this.initializePopulation();

    // 主循环
    while (this.generation < this.config.maxGenerations) {
      // 评估适应度
      this.evaluatePopulation();

      // 记录历史
      const generationBestFitness = Math.max(...this.fitnesses);
      this.fitnessHistory.push(generationBestFitness);

      // 检查是否需要继续
      if (this.shouldTerminate()) {
        break;
      }

      // 选择和繁殖
      this.evolve();

      this.generation++;
    }

    // 确保我们有最佳解决方案
    if (!this.bestSolution) {
      throw new Error("No valid solution found during optimization");
    }

    return {
      bestParams: this.bestSolution,
      bestFitness: this.bestFitness,
      convergenceGeneration: this.generation,
      fitnessHistory: this.fitnessHistory,
    };
  }

  /**
   * 初始化种群
   */
  private initializePopulation(): void {
    this.population = Array.from({ length: this.config.populationSize }, () =>
      this.generator.generateRandom(),
    );
  }

  /**
   * 评估种群适应度
   */
  private evaluatePopulation(): void {
    this.fitnesses = this.population.map((individual) => {
      // 如果不满足约束，返回最低适应度
      if (
        !validateAllConstraints(
          individual,
          this.config.parameterConfig.ranges,
          this.config.parameterConfig.orderedGroups,
          this.config.parameterConfig.sumConstraints,
        )
      ) {
        return -Infinity;
      }
      return this.config.fitnessFunction(individual);
    });

    // 更新最佳解
    const maxFitness = Math.max(...this.fitnesses);
    const maxIndex = this.fitnesses.indexOf(maxFitness);

    if (maxFitness > this.bestFitness && maxIndex !== -1) {
      this.bestFitness = maxFitness;
      // 使用深拷贝并保持类型信息
      const bestIndividual = this.population[maxIndex];
      if (bestIndividual) {
        this.bestSolution = Object.entries(bestIndividual).reduce(
          (acc, [key, value]) => {
            acc[key as keyof T] = value as T[keyof T];
            return acc;
          },
          {} as T,
        );
      }
    }
  }

  /**
   * 进化种群
   */
  private evolve(): void {
    // 保留精英
    const eliteCount = Math.floor(
      this.config.populationSize * this.config.eliteRatio,
    );
    const sortedIndices = this.getSortedIndices();
    const newPopulation: T[] = [];

    // 添加精英
    for (let i = 0; i < eliteCount && i < sortedIndices.length; i++) {
      const eliteIndex = sortedIndices[i];
      if (eliteIndex !== undefined) {
        const elite = this.population[eliteIndex];
        if (elite) {
          // 使用类型安全的深拷贝
          const eliteCopy = Object.entries(elite).reduce(
            (acc, [key, value]) => {
              acc[key as keyof T] = value as T[keyof T];
              return acc;
            },
            {} as T,
          );
          newPopulation.push(eliteCopy);
        }
      }
    }

    // 生成新个体
    while (newPopulation.length < this.config.populationSize) {
      // 选择父代
      const parent1 = this.selectParent();
      const parent2 = this.selectParent();

      if (!parent1 || !parent2) continue;

      // 交叉
      const [child1, child2] = this.crossover(parent1, parent2);

      // 变异
      if (Math.random() < this.config.mutationRate) {
        newPopulation.push(this.generator.mutate(child1));
      } else {
        newPopulation.push(child1);
      }

      if (newPopulation.length < this.config.populationSize) {
        if (Math.random() < this.config.mutationRate) {
          newPopulation.push(this.generator.mutate(child2));
        } else {
          newPopulation.push(child2);
        }
      }
    }

    this.population = newPopulation;
  }

  /**
   * 获取排序后的索引
   */
  private getSortedIndices(): number[] {
    return Array.from({ length: this.population.length }, (_, i) => i).sort(
      (a, b) => {
        const fitnessA = this.fitnesses[a];
        const fitnessB = this.fitnesses[b];
        return (fitnessB ?? -Infinity) - (fitnessA ?? -Infinity);
      },
    );
  }

  /**
   * 选择父代
   */
  private selectParent(): T | null {
    if (this.population.length === 0) return null;

    // 锦标赛选择
    const tournamentSize = Math.min(3, this.population.length);
    let bestIndex = Math.floor(Math.random() * this.population.length);
    let bestFitness = this.fitnesses[bestIndex] ?? -Infinity;

    for (let i = 1; i < tournamentSize; i++) {
      const index = Math.floor(Math.random() * this.population.length);
      const fitness = this.fitnesses[index] ?? -Infinity;
      if (fitness > bestFitness) {
        bestIndex = index;
        bestFitness = fitness;
      }
    }

    return this.population[bestIndex] ?? null;
  }

  /**
   * 交叉操作
   */
  private crossover(parent1: T, parent2: T): [T, T] {
    // 创建新的对象，使用类型安全的深拷贝
    const child1 = Object.entries(parent1).reduce((acc, [key, value]) => {
      acc[key as keyof T] = value as T[keyof T];
      return acc;
    }, {} as T);

    const child2 = Object.entries(parent2).reduce((acc, [key, value]) => {
      acc[key as keyof T] = value as T[keyof T];
      return acc;
    }, {} as T);

    // 随机选择交叉点
    const keys = Object.keys(parent1);
    const crossoverPoint = Math.floor(Math.random() * keys.length);

    // 交换基因
    for (let i = crossoverPoint; i < keys.length; i++) {
      const key = keys[i] as keyof T;
      const tempValue = child1[key];
      child1[key] = child2[key];
      child2[key] = tempValue;
    }

    return [child1, child2];
  }

  /**
   * 判断是否应该终止
   */
  private shouldTerminate(): boolean {
    // 如果已经达到最大代数，终止
    if (this.generation >= this.config.maxGenerations - 1) {
      return true;
    }

    // 如果最近几代的最佳适应度没有显著改善，终止
    const recentGenerations = 10;
    if (this.fitnessHistory.length >= recentGenerations) {
      const recentFitnesses = this.fitnessHistory.slice(-recentGenerations);
      const improvement = Math.abs(
        (recentFitnesses[recentFitnesses.length - 1] ?? 0) -
          (recentFitnesses[0] ?? 0),
      );

      if (improvement < this.config.convergenceThreshold) {
        return true;
      }
    }

    return false;
  }
}
