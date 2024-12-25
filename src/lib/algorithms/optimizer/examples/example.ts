import { GeneticOptimizer } from "../genetic/optimizer";
import type { GeneticConfig } from "../genetic/types";
import type { OptimizerConfig, RelativeRange } from "../core/types";
import { relativeToAbsolute } from "../utils/range-utils";

/**
 * 示例1：优化简单的数值参数
 * 目标：找到使 f(x, y) = x^2 + y^2 最小的 x 和 y 值
 */
function example1() {
  // 1. 定义参数类型
  interface Params extends Record<string, number> {
    x: number;
    y: number;
  }

  // 2. 定义参数范围
  const config: OptimizerConfig<Params> = {
    ranges: {
      x: { min: -10, max: 10, step: 0.1 },
      y: { min: -10, max: 10, step: 0.1 },
    },
  };

  // 3. 配置遗传算法
  const geneticConfig: GeneticConfig<Params> = {
    populationSize: 50,
    maxGenerations: 100,
    mutationRate: 0.1,
    eliteRatio: 0.1,
    convergenceThreshold: 1e-6,
    parameterConfig: config,
    fitnessFunction: (params) => {
      // 目标是最小化 x^2 + y^2，所以返回负值
      return -(params.x * params.x + params.y * params.y);
    },
  };

  // 4. 运行优化
  const optimizer = new GeneticOptimizer(geneticConfig);
  const result = optimizer.optimize();

  console.log("示例1结果:", result);
}

/**
 * 示例2：带约束的参数优化
 * 目标：优化三个参数 a, b, c，满足：
 * 1. a + b + c = 1
 * 2. a < b < c
 * 3. 最大化 a * b * c
 */
function example2() {
  // 1. 定义参数类型
  interface Params extends Record<string, number> {
    a: number;
    b: number;
    c: number;
  }

  // 2. 定义参数范围和约束
  const config: OptimizerConfig<Params> = {
    ranges: {
      a: { min: 0, max: 1, step: 0.01 },
      b: { min: 0, max: 1, step: 0.01 },
      c: { min: 0, max: 1, step: 0.01 },
    },
    // 参数顺序约束
    orderedGroups: [
      {
        name: "abc",
        params: ["a", "b", "c"],
      },
    ],
    // 和约束
    sumConstraints: [
      {
        targetSum: 1,
        params: ["a", "b", "c"],
        tolerance: 0.001,
      },
    ],
  };

  // 3. 配置遗传算法
  const geneticConfig: GeneticConfig<Params> = {
    populationSize: 100,
    maxGenerations: 200,
    mutationRate: 0.1,
    eliteRatio: 0.1,
    convergenceThreshold: 1e-6,
    parameterConfig: config,
    fitnessFunction: (params) => {
      return params.a * params.b * params.c;
    },
  };

  // 4. 运行优化
  const optimizer = new GeneticOptimizer(geneticConfig);
  const result = optimizer.optimize();

  console.log("示例2结果:", result);
}

/**
 * 示例3：使用相对范围的参数优化
 * 目标：优化一组评分权重，使得总分最接近目标值
 */
function example3() {
  // 1. 定义参数类型
  interface Params extends Record<string, number> {
    weight1: number;
    weight2: number;
    weight3: number;
    threshold1: number;
    threshold2: number;
  }

  // 2. 定义相对范围
  const relativeRanges: Record<keyof Params, RelativeRange> = {
    weight1: { base: 0.4, variation: 0.1 }, // 40% ± 10%
    weight2: { base: 0.3, variation: 0.1 }, // 30% ± 10%
    weight3: { base: 0.3, variation: 0.1 }, // 30% ± 10%
    threshold1: { base: 0.7, variation: 0.05 }, // 70% ± 5%
    threshold2: { base: 0.4, variation: 0.05 }, // 40% ± 5%
  };

  // 3. 转换为绝对范围
  const ranges = relativeToAbsolute(relativeRanges);

  // 4. 定义配置
  const config: OptimizerConfig<Params> = {
    ranges,
    // 权重和为1
    sumConstraints: [
      {
        targetSum: 1,
        params: ["weight1", "weight2", "weight3"],
        tolerance: 0.001,
      },
    ],
    // 阈值顺序：threshold1 > threshold2
    orderedGroups: [
      {
        name: "thresholds",
        params: ["threshold2", "threshold1"],
      },
    ],
  };

  // 5. 配置遗传算法
  const geneticConfig: GeneticConfig<Params> = {
    populationSize: 100,
    maxGenerations: 200,
    mutationRate: 0.1,
    eliteRatio: 0.1,
    convergenceThreshold: 1e-6,
    parameterConfig: config,
    fitnessFunction: (params) => {
      // 模拟一些测试用例
      const testCases = [
        { scores: [0.8, 0.6, 0.7], target: 0.75 },
        { scores: [0.6, 0.8, 0.5], target: 0.65 },
        { scores: [0.9, 0.4, 0.6], target: 0.7 },
      ];

      let totalError = 0;
      for (const testCase of testCases) {
        // 计算加权分数
        const weightedScore =
          testCase.scores[0]! * params.weight1 +
          testCase.scores[1]! * params.weight2 +
          testCase.scores[2]! * params.weight3;

        // 应用阈值调整
        let finalScore = weightedScore;
        if (weightedScore >= params.threshold1) {
          finalScore *= 1.2; // 超过高阈值，加分20%
        } else if (weightedScore <= params.threshold2) {
          finalScore *= 0.8; // 低于低阈值，减分20%
        }

        // 计算与目标分数的误差
        const error = Math.abs(finalScore - testCase.target);
        totalError += error;
      }

      // 返回负误差作为适应度（误差越小越好）
      return -totalError;
    },
  };

  // 6. 运行优化
  const optimizer = new GeneticOptimizer(geneticConfig);
  const result = optimizer.optimize();

  console.log("示例3结果:", result);
}

// 运行示例
console.log("=== 运行优化器示例 ===");

console.log("\n1. 简单数值优化");
example1();

console.log("\n2. 带约束的参数优化");
example2();

console.log("\n3. 评分权重优化");
example3();

// bun run src/lib/algorithms/optimizer/examples/example.ts
