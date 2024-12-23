import { LayeredOptimizer } from "../optimizer";
import { DEFAULT_PARAM_RANGES } from "../optimizer/param-ranges";
import type { OptimizerProgress } from "../optimizer/optimizer-adapters";
import { TEST_CASES } from "./test-cases";
import { describe, it, expect } from "vitest";
import { calculateGeometricBalance as evaluateGeometricBalance } from "../geometric-balance";

describe("分层优化器", () => {
  it("应当能够正常完成优化过程", async () => {
    const optimizer = new LayeredOptimizer(DEFAULT_PARAM_RANGES, {
      baseWeights: {
        populationSize: 100,
        generations: 30,
      },
      detailParams: {
        searchRadius: 0.8,
        stepScale: 0.02,
      },
    });

    const progressLog: OptimizerProgress[] = [];
    const config = await optimizer.optimize((progress: OptimizerProgress) => {
      progressLog.push(progress);
    });

    // 1. 验证配置完整性
    expect(config).toBeDefined();
    expect(config.shapeSimilarity).toBeDefined();
    expect(config.volume).toBeDefined();
    expect(config.aspectRatio).toBeDefined();
    expect(config.dimensionalConsistency).toBeDefined();

    // 2. 验证优化过程
    expect(progressLog.length).toBeGreaterThan(0);
    expect(progressLog.some((p) => p.phase === "genetic")).toBe(true);
    expect(progressLog.some((p) => p.phase === "bruteforce")).toBe(true);

    // 3. 验证分数合理性
    const lastGeneticScore =
      progressLog.filter((p) => p.phase === "genetic").pop()?.bestScore ?? 0;

    const lastBruteForceScore =
      progressLog.filter((p) => p.phase === "bruteforce").pop()?.bestScore ??
      lastGeneticScore;

    expect(lastGeneticScore).toBeGreaterThan(0);
    expect(lastBruteForceScore).toBeGreaterThan(0);
    expect(
      Math.abs(lastBruteForceScore - lastGeneticScore) / lastGeneticScore,
    ).toBeLessThan(0.1); // 允许10%的分数差异
  });

  it("应当能够处理边界情况", async () => {
    const optimizer = new LayeredOptimizer(DEFAULT_PARAM_RANGES, {
      baseWeights: {
        populationSize: 100,
        generations: 30,
      },
      detailParams: {
        searchRadius: 0.8,
        stepScale: 0.02,
      },
    });

    // 选择边界情况的测试用例
    const edgeCases = TEST_CASES.filter(
      (tc) =>
        tc.name === "空列表应该返回0分" || // 空集合
        tc.name === "单个立方体应该返回100分", // 完美情况
    );

    for (const testCase of edgeCases) {
      const progressLog: OptimizerProgress[] = [];
      const config = await optimizer.optimize((progress: OptimizerProgress) => {
        progressLog.push(progress);
      });

      // 验证优化过程能够正常完成
      const score = evaluateGeometricBalance(testCase.cuboids, config);
      const lastGeneticScore =
        progressLog.filter((p) => p.phase === "genetic").pop()?.bestScore ?? 0;
      const lastBruteForceScore =
        progressLog.filter((p) => p.phase === "bruteforce").pop()?.bestScore ??
        lastGeneticScore;

      console.log(`边界测试用例 "${testCase.name}":`, {
        实际分数: score,
        遗传算法分数: lastGeneticScore,
        暴力搜索分数: lastBruteForceScore,
      });

      // 验证分数的基本合理性
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
      expect(
        Math.abs(lastBruteForceScore - lastGeneticScore) / lastGeneticScore,
      ).toBeLessThan(0.1);
    }
  });

  it("应当能够处理正常情况", async () => {
    const optimizer = new LayeredOptimizer(DEFAULT_PARAM_RANGES, {
      baseWeights: {
        populationSize: 100,
        generations: 30,
      },
      detailParams: {
        searchRadius: 0.8,
        stepScale: 0.02,
      },
    });

    // 选择一个正常的测试用例
    const testCase = TEST_CASES.find((tc) => tc.name === "综合表现中等");
    expect(testCase).toBeDefined();

    const progressLog: OptimizerProgress[] = [];
    const config = await optimizer.optimize((progress: OptimizerProgress) => {
      progressLog.push(progress);
    });

    // 验证优化过程能够正常完成
    const score = evaluateGeometricBalance(testCase!.cuboids, config);
    const lastGeneticScore =
      progressLog.filter((p) => p.phase === "genetic").pop()?.bestScore ?? 0;
    const lastBruteForceScore =
      progressLog.filter((p) => p.phase === "bruteforce").pop()?.bestScore ??
      lastGeneticScore;

    console.log(`正常测试用例 "${testCase!.name}":`, {
      实际分数: score,
      遗传算法分数: lastGeneticScore,
      暴力搜索分数: lastBruteForceScore,
    });

    // 验证分数的基本合理性
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThan(100);
    expect(
      Math.abs(lastBruteForceScore - lastGeneticScore) / lastGeneticScore,
    ).toBeLessThan(0.1);
  });

  it("应当验证配置参数", () => {
    expect(
      () =>
        new LayeredOptimizer(DEFAULT_PARAM_RANGES, {
          baseWeights: {},
          detailParams: {
            searchRadius: 0, // 无效的搜索半径
            stepScale: 0.1,
          },
        }),
    ).toThrow("searchRadius must be a positive number");

    expect(
      () =>
        new LayeredOptimizer(DEFAULT_PARAM_RANGES, {
          baseWeights: {},
          detailParams: {
            searchRadius: 0.2,
            stepScale: 1.5, // 无效的步长缩放因子
          },
        }),
    ).toThrow("stepScale must be between 0 and 1");
  });
});
