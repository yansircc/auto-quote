import { geneticOptimize } from "./index";
import type { GeneticConfig } from "./types";

/**
 * 示例1：使用数组表示的连续函数优化
 * 目标：找到函数 f(x1, x2) = -(x1^2 + x2^2) 的最大值
 */
async function arrayExample() {
  // 基因组类型：两个连续变量的数组
  type Genome = [number, number];

  const config: GeneticConfig<Genome> = {
    populationSize: 100,
    maxGenerations: 50,
    mutationRate: 0.1,
    crossoverRate: 0.8,
    elitismRate: 0.1,

    // 适应度函数：计算 -(x^2 + y^2)
    fitnessFunction: ([x, y]: Genome) => -(x * x + y * y),

    // 随机生成个体：在 [-10, 10] 范围内
    generateIndividual: () =>
      [Math.random() * 20 - 10, Math.random() * 20 - 10] as Genome,

    // 基本变异和交叉函数（作为备用）
    mutate: (individual: Genome): Genome => {
      const [x, y] = individual;
      return [
        x + (Math.random() * 2 - 1),
        y + (Math.random() * 2 - 1),
      ] as Genome;
    },

    crossover: (parent1: Genome, parent2: Genome): [Genome, Genome] => {
      const alpha = Math.random();
      return [
        [
          parent1[0] * alpha + parent2[0] * (1 - alpha),
          parent1[1] * alpha + parent2[1] * (1 - alpha),
        ] as Genome,
        [
          parent1[0] * (1 - alpha) + parent2[0] * alpha,
          parent1[1] * (1 - alpha) + parent2[1] * alpha,
        ] as Genome,
      ];
    },

    // 使用两点交叉
    crossoverStrategy: "twoPoint",

    // 计算种群多样性：使用欧氏距离的平均值
    calculateDiversity: (population: Genome[]) => {
      let totalDistance = 0;
      let count = 0;

      for (let i = 0; i < population.length; i++) {
        for (let j = i + 1; j < population.length; j++) {
          const [x1, y1] = population[i]!;
          const [x2, y2] = population[j]!;
          const distance = Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
          totalDistance += distance;
          count++;
        }
      }

      return totalDistance / count;
    },

    // 终止条件：当最佳适应度接近0或达到最大代数
    terminationCondition: (_, bestFitness) => bestFitness > -0.001,

    // 回调函数：打印进度
    callbacks: {
      onGeneration: (generation, _, __, bestFitness, avgFitness, diversity) => {
        console.log(
          `Generation ${generation}: Best = ${bestFitness.toFixed(4)}, ` +
            `Avg = ${avgFitness.toFixed(4)}, Diversity = ${diversity.toFixed(4)}`,
        );
      },
      onNewBest: (individual, fitness) => {
        console.log(
          `New best solution found: (${individual[0]?.toFixed(4)}, ${individual[1]?.toFixed(4)}) ` +
            `with fitness ${fitness.toFixed(4)}`,
        );
      },
    },
  };

  const result = await geneticOptimize(config);
  console.log("\nOptimization completed!");
  console.log(
    `Best solution: (${result.bestIndividual[0]?.toFixed(4)}, ${result.bestIndividual[1]?.toFixed(4)})`,
  );
  console.log(`Best fitness: ${result.bestFitness.toFixed(4)}`);
  console.log(`Generations: ${result.generations}`);
}

/**
 * 示例2：使用对象表示的参数优化
 * 目标：优化神经网络的学习率和动量参数
 */
async function objectExample() {
  // 基因组类型：包含学习率和动量的对象
  interface Genome extends Record<string, number> {
    learningRate: number;
    momentum: number;
    batchSize: number;
  }

  const config: GeneticConfig<Genome> = {
    populationSize: 50,
    maxGenerations: 30,
    mutationRate: 0.2,
    crossoverRate: 0.7,
    elitismRate: 0.1,

    // 适应度函数：模拟神经网络训练的效果
    fitnessFunction: ({ learningRate, momentum, batchSize }: Genome) => {
      // 检查参数有效性
      if (
        !Number.isFinite(learningRate) ||
        learningRate <= 0 ||
        !Number.isFinite(momentum) ||
        momentum < 0 ||
        momentum > 1 ||
        !Number.isFinite(batchSize) ||
        batchSize < 8 ||
        batchSize > 128
      ) {
        return -Infinity;
      }

      // 模拟一个有最优值的复杂函数
      const optimalLR = 0.01;
      const optimalMomentum = 0.9;
      const optimalBatchSize = 32;

      // 在对数空间中计算学习率和批量大小的误差
      const lrError = Math.abs(Math.log2(learningRate / optimalLR));
      const batchSizeError = Math.abs(Math.log2(batchSize / optimalBatchSize));

      // 线性空间计算动量误差
      const momentumError = Math.abs(momentum - optimalMomentum);

      // 组合误差，给予不同的权重
      return -(lrError * 0.4 + momentumError * 0.3 + batchSizeError * 0.3);
    },

    // 随机生成个体
    generateIndividual: () => ({
      learningRate: Math.pow(10, Math.random() * 4 - 3), // 1e-3 到 10
      momentum: Math.random() * 0.9 + 0.1, // 0.1 到 1.0
      batchSize: Math.pow(2, Math.floor(Math.random() * 5 + 3)), // 8, 16, 32, 64, 128
    }),

    // 基本变异和交叉函数（作为备用）
    mutate: (individual: Genome): Genome => {
      const { learningRate, momentum, batchSize } = individual;

      // 在对数空间中变异学习率
      const logLR = Math.log2(learningRate);
      const mutatedLogLR = logLR + (Math.random() * 0.4 - 0.2);
      const newLR = Math.pow(2, mutatedLogLR);

      // 线性变异动量
      const newMomentum = Math.max(
        0.1,
        Math.min(1, momentum + (Math.random() * 0.2 - 0.1)),
      );

      // 在对数空间中变异批量大小，但保持在2的幂次方
      const logBS = Math.log2(batchSize);
      const mutatedLogBS =
        logBS + (Math.random() < 0.3 ? (Math.random() < 0.5 ? 1 : -1) : 0);
      const newBS = Math.pow(
        2,
        Math.round(Math.max(3, Math.min(7, mutatedLogBS))),
      ); // 保持在 8-128 之间

      return {
        learningRate: Math.max(1e-3, Math.min(10, newLR)),
        momentum: newMomentum,
        batchSize: newBS,
      };
    },

    crossover: (parent1: Genome, parent2: Genome): [Genome, Genome] => {
      // 在对数空间中对学习率进行插值
      const alpha = Math.random();
      const logLR1 = Math.log2(parent1.learningRate);
      const logLR2 = Math.log2(parent2.learningRate);
      const childLogLR1 = logLR1 * alpha + logLR2 * (1 - alpha);
      const childLogLR2 = logLR1 * (1 - alpha) + logLR2 * alpha;

      // 线性插值动量
      const beta = Math.random();
      const childMomentum1 =
        parent1.momentum * beta + parent2.momentum * (1 - beta);
      const childMomentum2 =
        parent1.momentum * (1 - beta) + parent2.momentum * beta;

      // 批量大小保持为2的幂次方，使用随机选择而不是插值
      const bs1 = Math.random() < 0.5 ? parent1.batchSize : parent2.batchSize;
      const bs2 = Math.random() < 0.5 ? parent1.batchSize : parent2.batchSize;

      return [
        {
          learningRate: Math.pow(2, childLogLR1),
          momentum: childMomentum1,
          batchSize: bs1,
        },
        {
          learningRate: Math.pow(2, childLogLR2),
          momentum: childMomentum2,
          batchSize: bs2,
        },
      ];
    },

    // 使用算术交叉
    crossoverStrategy: "arithmetic",
    strategyParams: {
      arithmeticAlpha: 0.5,
    },

    // 使用自适应变异
    mutationStrategy: "adaptive",
    adaptiveParams: {
      minMutationRate: 0.05,
      maxMutationRate: 0.3,
      minMutationRange: 0.1,
      maxMutationRange: 1.0,
      diversityThreshold: 0.5,
    },

    // 计算种群多样性
    calculateDiversity: (population: Genome[]) => {
      let totalDistance = 0;
      let count = 0;

      for (let i = 0; i < population.length; i++) {
        for (let j = i + 1; j < population.length; j++) {
          const p1 = population[i]!;
          const p2 = population[j]!;

          // 在对数空间中计算学习率的距离
          const lrDistance = Math.abs(
            Math.log2(p1.learningRate) - Math.log2(p2.learningRate),
          );

          // 线性空间计算动量的距离
          const momentumDistance = Math.abs(p1.momentum - p2.momentum);

          // 对数空间计算批量大小的距离
          const bsDistance = Math.abs(
            Math.log2(p1.batchSize) - Math.log2(p2.batchSize),
          );

          // 归一化并组合距离
          const distance = Math.sqrt(
            (lrDistance / 10) ** 2 + // 学习率在 10 个数量级范围内
              momentumDistance ** 2 + // 动量在 [0,1] 范围内
              (bsDistance / 4) ** 2, // 批量大小在 4 个二进制数量级范围内
          );

          totalDistance += distance;
          count++;
        }
      }

      return count > 0 ? totalDistance / count : 0;
    },

    // 回调函数
    callbacks: {
      onGeneration: (generation, _, __, bestFitness, avgFitness, diversity) => {
        console.log(
          `Generation ${generation}: Best = ${bestFitness.toFixed(4)}, ` +
            `Avg = ${avgFitness.toFixed(4)}, Diversity = ${diversity.toFixed(4)}`,
        );
      },
      onNewBest: (individual, fitness) => {
        console.log(
          "New best hyperparameters found:",
          `\n  Learning Rate: ${individual.learningRate.toFixed(6)}`,
          `\n  Momentum: ${individual.momentum.toFixed(4)}`,
          `\n  Batch Size: ${Math.round(individual.batchSize)}`,
          `\n  Fitness: ${fitness.toFixed(4)}`,
        );
      },
    },
  };

  const result = await geneticOptimize(config);
  console.log("\nOptimization completed!");
  console.log("Best hyperparameters:");
  console.log(
    `  Learning Rate: ${result.bestIndividual.learningRate.toFixed(6)}`,
  );
  console.log(`  Momentum: ${result.bestIndividual.momentum.toFixed(4)}`);
  console.log(`  Batch Size: ${Math.round(result.bestIndividual.batchSize)}`);
  console.log(`Best fitness: ${result.bestFitness.toFixed(4)}`);
  console.log(`Generations: ${result.generations}`);
}

// 运行示例
async function runExamples() {
  console.log("Running Array Example (Continuous Function Optimization)");
  console.log("===================================================");
  await arrayExample();

  console.log(
    "\n\nRunning Object Example (Neural Network Hyperparameter Optimization)",
  );
  console.log("===========================================================");
  await objectExample();
}

// 如果直接运行此文件，则执行示例
if (require.main === module) {
  runExamples().catch(console.error);
}

export { arrayExample, objectExample, runExamples };
// bun run src/lib/algorithms/genetic/example.ts
