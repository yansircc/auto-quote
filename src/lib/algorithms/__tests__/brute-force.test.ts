import { describe, expect, it } from "vitest";
import { bruteForceSearch } from "../brute-force";
import type {
  BruteForceConfig,
  Point2DParameterSpace,
} from "../brute-force/types";
import { isInRange, convergenceSpeed } from "./test-utils";

interface Point2D {
  x: number;
  y: number;
}

describe("暴力枚举算法", () => {
  // 基本功能测试
  it("应该能找到简单二次函数的最大值", async () => {
    const parameterSpace: Point2DParameterSpace = {
      x: { min: -5, max: 5, step: 0.5 },
      y: { min: -5, max: 5, step: 0.5 },
    };

    const config: BruteForceConfig<Point2D> = {
      parameterSpace,
      evaluateConfig: (p: Point2D) => -(p.x * p.x + p.y * p.y),
    };

    const result = await bruteForceSearch(config);

    // 理论最优解是 (0,0)
    expect(Math.abs(result.bestConfig.x)).toBeLessThan(0.5);
    expect(Math.abs(result.bestConfig.y)).toBeLessThan(0.5);
    expect(result.bestScore).toBeGreaterThan(-0.5);
  });

  // 约束条件测试
  it("应该遵守验证函数的约束", async () => {
    const parameterSpace: Point2DParameterSpace = {
      x: { min: -10, max: 10, step: 1 },
      y: { min: -10, max: 10, step: 1 },
    };

    const config: BruteForceConfig<Point2D> = {
      parameterSpace,
      evaluateConfig: (p: Point2D) => p.x + p.y,
      validateConfig: (p: Point2D) => p.x * p.x + p.y * p.y <= 50, // 限制在半径为 √50 的圆内
    };

    const result = await bruteForceSearch(config);

    // 检查结果是否在约束范围内
    expect(
      result.bestConfig.x * result.bestConfig.x +
        result.bestConfig.y * result.bestConfig.y,
    ).toBeLessThanOrEqual(50);
  });

  // 终止条件测试
  it("应该在达到终止条件时停止", async () => {
    const parameterSpace: Point2DParameterSpace = {
      x: { min: -10, max: 10, step: 0.1 },
      y: { min: -10, max: 10, step: 0.1 },
    };

    const evaluations: number[] = [];

    const config: BruteForceConfig<Point2D> = {
      parameterSpace,
      evaluateConfig: (p: Point2D) => {
        const value = -(p.x * p.x + p.y * p.y);
        evaluations.push(value);
        return value;
      },
      terminationCondition: {
        minScore: -1, // 当得分大于 -1 时停止
      },
    };

    const result = await bruteForceSearch(config);

    // 验证是否因为达到目标分数而停止
    expect(result.bestScore).toBeGreaterThan(-1);

    // 计算收敛速度
    const convergenceSteps = convergenceSpeed(evaluations, 0, 1);
    expect(convergenceSteps).toBeGreaterThan(0);
  });

  // 参数范围测试
  it("应该在参数范围内搜索", async () => {
    const parameterSpace: Point2DParameterSpace = {
      x: { min: -1, max: 2, step: 0.1 },
      y: { min: 0, max: 3, step: 0.1 },
    };

    const config: BruteForceConfig<Point2D> = {
      parameterSpace,
      evaluateConfig: (p: Point2D) => p.x + p.y,
    };

    const result = await bruteForceSearch(config);

    // 验证结果在指定范围内
    expect(isInRange(result.bestConfig.x, -1, 2)).toBe(true);
    expect(isInRange(result.bestConfig.y, 0, 3)).toBe(true);
  });

  // 错误处理测试
  it("应该正确处理评估错误", async () => {
    const parameterSpace: Point2DParameterSpace = {
      x: { min: -1, max: 1, step: 0.5 },
      y: { min: -1, max: 1, step: 0.5 },
    };

    const errors: Error[] = [];

    const config: BruteForceConfig<Point2D> = {
      parameterSpace,
      evaluateConfig: (p: Point2D) => {
        if (p.x === 0 && p.y === 0) {
          throw new Error("评估错误");
        }
        return -(p.x * p.x + p.y * p.y);
      },
      callbacks: {
        onError: (error) => {
          errors.push(error);
        },
      },
    };

    const result = await bruteForceSearch(config);

    // 验证错误被捕获
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0]?.message).toBe("评估错误");

    // 验证算法仍然能找到次优解
    expect(result.bestScore).toBeLessThan(0);
  });

  // 性能测试
  it("应该能处理较大的搜索空间", async () => {
    const parameterSpace: Point2DParameterSpace = {
      x: { min: -100, max: 100, step: 1 },
      y: { min: -100, max: 100, step: 1 },
    };

    const startTime = Date.now();

    const config: BruteForceConfig<Point2D> = {
      parameterSpace,
      evaluateConfig: (p: Point2D) => -(p.x * p.x + p.y * p.y),
    };

    const result = await bruteForceSearch(config);

    const duration = Date.now() - startTime;

    // 验证搜索空间大小
    expect(result.searchSpace.size).toBe(201 * 201);
    // 验证性能（应该在合理时间内完成）
    expect(duration).toBeLessThan(30000); // 30秒
  });
});
// bun test src/lib/algorithms/__tests__/brute-force.test.ts
