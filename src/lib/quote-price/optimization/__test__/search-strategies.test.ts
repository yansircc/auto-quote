import { ternarySearchForOptimalCavity } from "../search-strategies";
import { describe, it, expect } from "vitest";

describe("优化策略", () => {
  describe("ternarySearchForOptimalCavity", () => {
    // 模拟一个成本函数：穴数越多，单件成本降低，但模具成本上升
    const mockCostFunction = (cavity: number): number => {
      const moldBaseCost = 10000; // 基础模具成本
      const cavityCost = 5000; // 每穴增加成本
      const productionCost = 10; // 每件生产成本
      const quantity = 10000; // 假设生产数量

      const moldCost = moldBaseCost + cavityCost * cavity;
      const totalProductionCost = (productionCost / cavity) * quantity;

      return moldCost + totalProductionCost;
    };

    it("在给定范围内找到最优穴数", () => {
      const result = ternarySearchForOptimalCavity(mockCostFunction, 1, 32);

      // 根据我们的成本函数，最优穴数应该在4-8之间
      expect(result).toBeGreaterThanOrEqual(4);
      expect(result).toBeLessThanOrEqual(8);
      // 假设最优穴数为6
      expect(result).toBe(6);
    });

    it("处理单调递增的成本函数", () => {
      // 模拟成本随穴数增加而单调递增的情况
      const increasingCostFunction = (cavity: number): number => cavity * 10000;

      const result = ternarySearchForOptimalCavity(
        increasingCostFunction,
        1,
        32,
      );
      // 当成本单调递增时，最优解应该在左边界
      expect(result).toBe(1);
    });

    it("处理单调递减的成本函数", () => {
      // 模拟成本随穴数增加而单调递减的情况
      const decreasingCostFunction = (cavity: number): number =>
        100000 / cavity;

      const result = ternarySearchForOptimalCavity(
        decreasingCostFunction,
        1,
        32,
      );
      // 当成本单调递减时，最优解应该在右边界
      expect(result).toBe(32);
    });

    it("验证搜索结果是否为局部最优解", () => {
      const result = ternarySearchForOptimalCavity(mockCostFunction, 1, 32);
      const cost = mockCostFunction(result);

      // 验证结果是否为局部最优解
      // 检查相邻点的成本是否都大于当前点
      expect(mockCostFunction(result - 1)).toBeGreaterThan(cost);
      expect(mockCostFunction(result + 1)).toBeGreaterThan(cost);
    });

    it("处理边界情况", () => {
      // 测试搜索范围只有一个点的情况
      const result = ternarySearchForOptimalCavity(mockCostFunction, 4, 4);
      expect(result).toBe(4);

      // 测试搜索范围只有两个点的情况
      const result2 = ternarySearchForOptimalCavity(mockCostFunction, 4, 5);
      expect(result2).toBeGreaterThanOrEqual(4);
      expect(result2).toBeLessThanOrEqual(5);
    });

    it("验证搜索过程的收敛性", () => {
      // 使用一个简单的二次函数，确保有明确的最优解
      const quadraticCostFunction = (cavity: number): number => {
        const optimal = 10;
        return Math.pow(cavity - optimal, 2);
      };

      const result = ternarySearchForOptimalCavity(
        quadraticCostFunction,
        1,
        32,
      );
      // 验证是否收敛到真实的最优解附近
      expect(Math.abs(result - 10)).toBeLessThanOrEqual(1);
    });
  });
});
