import { describe, it, expect } from "vitest";
import {
  bruteForceSearchAll,
  coordinateDescentMulti,
  searchBestInDimensionDiscrete,
} from "../optimization";

describe("Optimization Functions", () => {
  describe("bruteForceSearchAll", () => {
    it("为简单二次函数找到所有解", () => {
      const f = (x: number[]) => (x[0]! - 1) ** 2 + (x[1]! - 1) ** 2;
      const maxValues = [5, 5];
      const results = bruteForceSearchAll(f, maxValues);

      // 验证返回了所有可能的解
      expect(results.length).toBe(25); // 5x5种可能性

      // 验证包含最优解
      const minResult = results.reduce((min, curr) =>
        curr.val < min.val ? curr : min,
      );
      expect(minResult.x).toEqual([1, 1]);
      expect(minResult.val).toBe(0);
    });

    it("为单维函数找到所有解", () => {
      const f = (x: number[]) => (x[0]! - 1) ** 2;
      const maxValues = [5];
      const results = bruteForceSearchAll(f, maxValues);

      expect(results.length).toBe(5); // 5种可能性
      const minResult = results.reduce((min, curr) =>
        curr.val < min.val ? curr : min,
      );
      expect(minResult.x).toEqual([1]);
      expect(minResult.val).toBe(0);
    });

    it("处理未定义的最大值", () => {
      const f = (x: number[]) => x[0]! + x[1]!;
      const maxValues = [undefined as unknown as number, 2];
      const results = bruteForceSearchAll(f, maxValues);

      expect(results.length).toBe(2); // 1x2种可能性
      const minResult = results.reduce((min, curr) =>
        curr.val < min.val ? curr : min,
      );
      expect(minResult.x).toEqual([1, 1]);
      expect(minResult.val).toBe(2);
    });
  });

  describe("coordinateDescentMulti", () => {
    it("为凸函数找到最小值", () => {
      const f = (x: number[]) => (x[0]! - 1) ** 2 + (x[1]! - 1) ** 2;
      const maxValues = [5, 5];
      const result = coordinateDescentMulti(f, maxValues);

      expect(result.best.minX).toEqual([1, 1]);
      expect(result.best.minVal).toBe(0);

      // 验证是否记录了搜索过程中的所有候选解
      expect(result.allCandidates.length).toBeGreaterThan(0);
    });

    it("处理非凸函数", () => {
      const f = (x: number[]) => Math.sin(x[0]!) + Math.cos(x[1]!);
      const maxValues = [5, 5];
      const result = coordinateDescentMulti(f, maxValues);

      expect(result.best.minVal).toBeCloseTo(-2, 0.5);
      expect(result.allCandidates.length).toBeGreaterThan(0);
    });

    it("处理早期收敛", () => {
      const f = (x: number[]) => x[0]! + x[1]!;
      const maxValues = [5, 5];
      const result = coordinateDescentMulti(f, maxValues, 1);

      expect(result.best.minX).toEqual([1, 1]);
      expect(result.best.minVal).toBe(2);

      // 由于只迭代一次，候选解应该很少
      expect(result.allCandidates.length).toBeLessThan(5);
    });
  });

  describe("searchBestInDimensionDiscrete", () => {
    it("为单维函数找到最佳值", () => {
      const f = (x: number[]) => (x[0]! - 1) ** 2;
      const x = [1];
      const result = searchBestInDimensionDiscrete(x, 0, 5, f);
      expect(result.bestValueInDim).toBe(1);
      expect(result.minVal).toBe(0);
    });

    it("处理零最大值", () => {
      const f = (x: number[]) => (x[0]! - 1) ** 2;
      const x = [1];
      const result = searchBestInDimensionDiscrete(x, 0, 0, f);
      expect(result.bestValueInDim).toBe(1);
      expect(result.minVal).toBe(0);
    });
  });
});
