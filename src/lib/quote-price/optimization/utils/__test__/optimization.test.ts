import { describe, it, expect } from "vitest";
import {
  bruteForceSearch,
  coordinateDescent,
  searchBestInDimensionDiscrete,
} from "../optimization";

describe("Optimization Functions", () => {
  describe("bruteForceSearch", () => {
    it("为简单二次函数找到最小值", () => {
      const f = (x: number[]) => (x[0]! - 1) ** 2 + (x[1]! - 1) ** 2;
      const maxValues = [5, 5];
      const result = bruteForceSearch(f, maxValues);
      expect(result.minX).toEqual([1, 1]);
      expect(result.minVal).toBe(0);
    });

    it("为单维函数找到最小值", () => {
      const f = (x: number[]) => (x[0]! - 1) ** 2;
      const maxValues = [5];
      const result = bruteForceSearch(f, maxValues);
      expect(result.minX).toEqual([1]);
      expect(result.minVal).toBe(0);
    });

    it("处理未定义的最大值", () => {
      const f = (x: number[]) => x[0]! + x[1]!;
      const maxValues = [undefined as unknown as number, 2];
      const result = bruteForceSearch(f, maxValues);
      expect(result.minX).toEqual([1, 1]);
      expect(result.minVal).toBe(2);
    });
  });

  describe("coordinateDescent", () => {
    it("为凸函数找到最小值", () => {
      const f = (x: number[]) => (x[0]! - 1) ** 2 + (x[1]! - 1) ** 2;
      const maxValues = [5, 5];
      const result = coordinateDescent(f, maxValues);
      expect(result.minX).toEqual([1, 1]);
      expect(result.minVal).toBe(0);
    });

    it("处理非凸函数", () => {
      const f = (x: number[]) => Math.sin(x[0]!) + Math.cos(x[1]!);
      const maxValues = [5, 5]; // 扩大搜索范围
      const result = coordinateDescent(f, maxValues);
      expect(result.minVal).toBeCloseTo(-2, 0.5); // 调整期望值和精度
    });

    it("处理早期收敛", () => {
      const f = (x: number[]) => x[0]! + x[1]!;
      const maxValues = [5, 5];
      const result = coordinateDescent(f, maxValues, 1); // Only 1 iteration
      expect(result.minX).toEqual([1, 1]);
      expect(result.minVal).toBe(2);
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
