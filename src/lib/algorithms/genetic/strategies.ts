/**
 * 遗传算法策略集合
 */

/**
 * 选择策略
 */
export const SelectionStrategies = {
  /**
   * 轮盘赌选择
   * 按照适应度占总适应度的比例进行选择
   */
  roulette<T>(population: T[], fitnesses: number[]): T {
    const totalFitness = fitnesses.reduce((sum, fitness) => sum + fitness, 0);
    let pointer = Math.random() * totalFitness;

    for (let i = 0; i < fitnesses.length; i++) {
      pointer -= fitnesses[i]!;
      if (pointer <= 0) {
        return population[i]!;
      }
    }

    return population[population.length - 1]!;
  },

  /**
   * 锦标赛选择
   * 随机选择k个个体，返回其中最优的
   */
  tournament<T>(population: T[], fitnesses: number[], tournamentSize = 3): T {
    let bestIndex = Math.floor(Math.random() * population.length);
    let bestFitness = fitnesses[bestIndex]!;

    for (let i = 1; i < tournamentSize; i++) {
      const index = Math.floor(Math.random() * population.length);
      if (fitnesses[index]! > bestFitness) {
        bestIndex = index;
        bestFitness = fitnesses[index]!;
      }
    }

    return population[bestIndex]!;
  },

  /**
   * 排名选择
   * 按照适应度排名进行选择，减小选择压力
   */
  rank<T>(population: T[], fitnesses: number[]): T {
    // 创建索引数组并按适应度排序
    const indices = Array.from({ length: population.length }, (_, i) => i);
    indices.sort((a, b) => fitnesses[b]! - fitnesses[a]!);

    // 使用线性排名
    const ranks = indices.map((_, i) => population.length - i);
    const totalRank = ranks.reduce((sum, rank) => sum + rank, 0);

    let pointer = Math.random() * totalRank;
    for (let i = 0; i < ranks.length; i++) {
      pointer -= ranks[i]!;
      if (pointer <= 0) {
        return population[indices[i]!]!;
      }
    }

    return population[indices[indices.length - 1]!]!;
  },
};

/**
 * 交叉策略
 */
export const CrossoverStrategies = {
  /**
   * 单点交叉
   * 在随机位置交换两个父代的部分基因
   */
  singlePoint<T extends number[]>(parent1: T, parent2: T): [T, T] {
    const point = Math.floor(Math.random() * parent1.length);
    const child1 = [...parent1] as T;
    const child2 = [...parent2] as T;

    for (let i = point; i < parent1.length; i++) {
      [child1[i], child2[i]] = [child2[i]!, child1[i]!];
    }

    return [child1, child2];
  },

  /**
   * 两点交叉
   * 在两个随机位置之间交换基因
   */
  twoPoint<T extends number[]>(parent1: T, parent2: T): [T, T] {
    let point1 = Math.floor(Math.random() * parent1.length);
    let point2 = Math.floor(Math.random() * parent1.length);

    if (point1 > point2) {
      [point1, point2] = [point2, point1];
    }

    const child1 = [...parent1] as T;
    const child2 = [...parent2] as T;

    for (let i = point1; i < point2; i++) {
      [child1[i], child2[i]] = [child2[i]!, child1[i]!];
    }

    return [child1, child2];
  },

  /**
   * 均匀交叉
   * 对每个基因位置，随机决定是否交换
   */
  uniform<T extends number[]>(parent1: T, parent2: T, mixRate = 0.5): [T, T] {
    const child1 = [...parent1] as T;
    const child2 = [...parent2] as T;

    for (let i = 0; i < parent1.length; i++) {
      if (Math.random() < mixRate) {
        [child1[i], child2[i]] = [child2[i]!, child1[i]!];
      }
    }

    return [child1, child2];
  },

  /**
   * 算术交叉
   * 使用加权平均生成子代
   */
  arithmetic<T extends Record<string, number>>(
    parent1: T,
    parent2: T,
    alpha = 0.5,
  ): [T, T] {
    // 先断言为 Record<string, number>
    const child1 = { ...parent1 } as Record<string, number>;
    const child2 = { ...parent2 } as Record<string, number>;

    for (const key of Object.keys(parent1)) {
      child1[key] = alpha * parent1[key]! + (1 - alpha) * parent2[key]!;
      child2[key] = (1 - alpha) * parent1[key]! + alpha * parent2[key]!;
    }

    // 再断言回 T
    return [child1 as T, child2 as T];
  },
};

/**
 * 变异策略
 */
export const MutationStrategies = {
  /**
   * 高斯变异
   * 添加服从正态分布的随机扰动
   */
  gaussian<T extends Record<string, number>>(
    individual: T,
    sigma = 0.1,
    mutationRate = 0.1,
  ): T {
    // 先断言为 Record<string, number>
    const mutated = { ...individual } as Record<string, number>;

    for (const key of Object.keys(mutated)) {
      if (Math.random() < mutationRate) {
        // Box-Muller 变换生成正态分布随机数
        const u1 = Math.random();
        const u2 = Math.random();
        const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);

        mutated[key] = individual[key]! + z * sigma;
      }
    }

    // 再断言回 T
    return mutated as T;
  },

  /**
   * 均匀变异
   * 在指定范围内随机改变值
   */
  uniform<T extends Record<string, number>>(
    individual: T,
    range: Record<string, { min: number; max: number }>,
    mutationRate = 0.1,
  ): T {
    // 先断言为 Record<string, number>
    const mutated = { ...individual } as Record<string, number>;

    for (const key of Object.keys(mutated)) {
      if (Math.random() < mutationRate && range[key]) {
        const { min, max } = range[key];
        mutated[key] = min + Math.random() * (max - min);
      }
    }

    // 再断言回 T
    return mutated as T;
  },

  /**
   * 自适应变异
   * 根据个体适应度调整变异强度
   */
  adaptive<T extends Record<string, number>>(
    individual: T,
    fitness: number,
    maxFitness: number,
    minFitness: number,
    params: {
      minMutationRate: number;
      maxMutationRate: number;
      minMutationRange: number;
      maxMutationRange: number;
    },
  ): T {
    // 先断言为 Record<string, number>
    const mutated = { ...individual } as Record<string, number>;
    const fitnessRange = maxFitness - minFitness;

    // 根据适应度计算变异率和变异范围
    const relativeFitness =
      fitnessRange === 0 ? 1 : (fitness - minFitness) / fitnessRange;
    const mutationRate =
      params.maxMutationRate -
      (params.maxMutationRate - params.minMutationRate) * relativeFitness;
    const mutationRange =
      params.maxMutationRange -
      (params.maxMutationRange - params.minMutationRange) * relativeFitness;

    for (const key of Object.keys(mutated)) {
      if (Math.random() < mutationRate) {
        const change = (Math.random() * 2 - 1) * mutationRange;
        mutated[key] = individual[key]! + change;
      }
    }

    // 再断言回 T
    return mutated as T;
  },
};
