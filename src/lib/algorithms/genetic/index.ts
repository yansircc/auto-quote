import type { GeneticConfig, GeneticResult, NumericGenome } from "./types";
import {
  SelectionStrategies,
  CrossoverStrategies,
  MutationStrategies,
} from "./strategies";

/**
 * 判断是否为数值对象类型
 */
function isNumericRecord(
  value: NumericGenome,
): value is Record<string, number> {
  return typeof value === "object" && !Array.isArray(value);
}

/**
 * 通用遗传算法实现
 */
export async function geneticOptimize<T extends NumericGenome>(
  config: GeneticConfig<T>,
): Promise<GeneticResult<T>> {
  const {
    populationSize,
    maxGenerations,
    mutationRate: initialMutationRate,
    crossoverRate: initialCrossoverRate,
    elitismRate,
    fitnessFunction,
    generateIndividual,
    mutate: customMutate,
    crossover: customCrossover,
    selectionStrategy = "tournament",
    crossoverStrategy,
    mutationStrategy,
    strategyParams = {},
    calculateDiversity,
    terminationCondition,
    adaptiveParams,
    callbacks,
  } = config;

  // 初始化种群
  let population: T[] = Array.from({ length: populationSize }, () =>
    generateIndividual(),
  );

  // 记录每代最佳适应度
  const history: number[] = [];
  const diversityHistory: number[] = [];

  // 记录全局最佳个体
  let bestIndividual = population[0]!;
  let bestFitness = fitnessFunction(bestIndividual);

  // 当前变异率和交叉率
  let currentMutationRate = initialMutationRate;
  let currentCrossoverRate = initialCrossoverRate;

  // 选择合适的策略
  const select = (population: T[], fitnesses: number[]): T => {
    switch (selectionStrategy) {
      case "roulette":
        return SelectionStrategies.roulette(population, fitnesses);
      case "rank":
        return SelectionStrategies.rank(population, fitnesses);
      case "tournament":
      default:
        return SelectionStrategies.tournament(
          population,
          fitnesses,
          strategyParams.tournamentSize,
        );
    }
  };

  const crossover = (parent1: T, parent2: T): [T, T] => {
    if (!crossoverStrategy) {
      return customCrossover(parent1, parent2);
    }

    // 如果是数组类型
    if (Array.isArray(parent1) && Array.isArray(parent2)) {
      switch (crossoverStrategy) {
        case "singlePoint":
          return CrossoverStrategies.singlePoint(parent1, parent2) as [T, T];
        case "twoPoint":
          return CrossoverStrategies.twoPoint(parent1, parent2) as [T, T];
        case "uniform":
          return CrossoverStrategies.uniform(
            parent1,
            parent2,
            strategyParams.uniformRate,
          ) as [T, T];
        default:
          return customCrossover(parent1, parent2);
      }
    }

    // 如果是对象类型
    if (typeof parent1 === "object" && typeof parent2 === "object") {
      switch (crossoverStrategy) {
        case "arithmetic":
          return CrossoverStrategies.arithmetic(
            parent1 as Record<string, number>,
            parent2 as Record<string, number>,
            strategyParams.arithmeticAlpha,
          ) as [T, T];
        default:
          return customCrossover(parent1, parent2);
      }
    }

    return customCrossover(parent1, parent2);
  };

  const mutate = (individual: T, fitness?: number): T => {
    if (!mutationStrategy) {
      return customMutate(individual);
    }

    // 如果是对象类型
    if (isNumericRecord(individual)) {
      switch (mutationStrategy) {
        case "gaussian":
          return MutationStrategies.gaussian(
            individual,
            strategyParams.gaussianSigma,
            currentMutationRate,
          ) as T;
        case "uniform":
          if (!strategyParams.mutationRange) {
            return customMutate(individual);
          }
          return MutationStrategies.uniform(
            individual,
            strategyParams.mutationRange,
            currentMutationRate,
          ) as T;
        case "adaptive":
          if (fitness === undefined) {
            return customMutate(individual);
          }
          const minFitness = Math.min(...history);
          return MutationStrategies.adaptive(
            individual,
            fitness,
            bestFitness,
            minFitness,
            {
              minMutationRate:
                adaptiveParams?.minMutationRate ?? currentMutationRate / 2,
              maxMutationRate:
                adaptiveParams?.maxMutationRate ?? currentMutationRate * 2,
              minMutationRange: adaptiveParams?.minMutationRange ?? 0.1,
              maxMutationRange: adaptiveParams?.maxMutationRange ?? 1.0,
            },
          ) as T;
        default:
          return customMutate(individual);
      }
    }

    // 如果是数组类型，使用自定义变异
    return customMutate(individual);
  };

  // 开始进化
  for (let generation = 0; generation < maxGenerations; generation++) {
    // 计算适应度
    const fitnesses = population.map(fitnessFunction);
    const maxFitness = Math.max(...fitnesses);
    const averageFitness =
      fitnesses.reduce((sum, f) => sum + f, 0) / populationSize;
    const bestIndex = fitnesses.indexOf(maxFitness);
    const currentBestIndividual = population[bestIndex]!;

    // 更新全局最佳
    if (maxFitness > bestFitness) {
      bestFitness = maxFitness;
      bestIndividual = currentBestIndividual;
      await callbacks?.onNewBest?.(bestIndividual, bestFitness, generation);
    }

    // 计算种群多样性
    const diversity = calculateDiversity?.(population) ?? 0;

    // 记录历史
    history.push(maxFitness);
    diversityHistory.push(diversity);

    // 调用回调函数
    await callbacks?.onGeneration?.(
      generation,
      population,
      fitnesses,
      maxFitness,
      averageFitness,
      diversity,
    );

    // 自适应调整参数
    if (adaptiveParams) {
      // 根据多样性调整变异率
      if (diversity < (adaptiveParams.diversityThreshold ?? 0.1)) {
        currentMutationRate = Math.min(
          adaptiveParams.maxMutationRate ?? initialMutationRate * 2,
          currentMutationRate * 1.1,
        );
      } else {
        currentMutationRate = (currentMutationRate + initialMutationRate) / 2;
      }

      // 根据适应度进展调整交叉率
      if (
        history.length >= 5 &&
        Math.abs(maxFitness - history[history.length - 5]!) < 1e-6
      ) {
        currentCrossoverRate = Math.max(
          adaptiveParams.minCrossoverRate ?? initialCrossoverRate / 2,
          currentCrossoverRate * 0.9,
        );
      } else {
        currentCrossoverRate =
          (currentCrossoverRate + initialCrossoverRate) / 2;
      }
    }

    // 检查终止条件
    if (terminationCondition?.(generation, bestFitness)) {
      await callbacks?.onTermination?.("达到目标适应度");
      return {
        bestIndividual,
        bestFitness,
        generations: generation + 1,
        history,
        diversityHistory,
        terminationReason: "达到目标适应度",
        finalPopulation: population,
      };
    }

    // 生成新种群
    const newPopulation: T[] = [];

    // 精英保留
    if (elitismRate > 0) {
      const eliteCount = Math.floor(populationSize * elitismRate);
      const sortedIndices = Array.from(
        { length: population.length },
        (_, i) => i,
      ).sort((a, b) => fitnesses[b]! - fitnesses[a]!);

      for (let i = 0; i < eliteCount; i++) {
        newPopulation.push(population[sortedIndices[i]!]!);
      }
    }

    // 生成其余个体
    while (newPopulation.length < populationSize) {
      if (Math.random() < currentCrossoverRate) {
        // 选择父代
        const parent1 = select(population, fitnesses);
        const parent2 = select(population, fitnesses);

        // 交叉
        const [child1, child2] = crossover(parent1, parent2);

        // 变异
        const mutatedChild1 = mutate(child1, fitnessFunction(child1));
        const mutatedChild2 = mutate(child2, fitnessFunction(child2));

        newPopulation.push(mutatedChild1, mutatedChild2);
      } else {
        // 直接复制
        const individual = select(population, fitnesses);
        newPopulation.push(mutate(individual, fitnessFunction(individual)));
      }
    }

    // 如果生成了过多的个体，随机移除一些
    while (newPopulation.length > populationSize) {
      const removeIndex =
        Math.floor(Math.random() * (newPopulation.length - 1)) + 1;
      newPopulation.splice(removeIndex, 1);
    }

    population = newPopulation;
  }

  await callbacks?.onTermination?.("达到最大代数");
  return {
    bestIndividual,
    bestFitness,
    generations: maxGenerations,
    history,
    diversityHistory,
    terminationReason: "达到最大代数",
    finalPopulation: population,
  };
}
