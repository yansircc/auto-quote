import { calculateGeometricBalance } from "../geometry/geometric-balance";
import { describe, it, expect } from "vitest";
import { TEST_CASES } from "../geometry/__tests__/test-cases";

describe("calculateGeometricBalance", () => {
  // 边界情况测试
  describe("边界情况", () => {
    it("空列表应该返回0分", () => {
      const score = calculateGeometricBalance([]);
      expect(score).toBe(0);
    });

    it("单个立方体应该返回100分", () => {
      // 找到单个立方体的测试用例
      const singleCuboidCase = TEST_CASES.find(
        (tc) => tc.name === "单个立方体应该返回100分",
      );

      if (singleCuboidCase?.cuboids[0]) {
        const score = calculateGeometricBalance([singleCuboidCase.cuboids[0]]);
        expect(score).toBe(100);
      } else {
        throw new Error("测试数据缺失：找不到单个立方体的测试用例");
      }
    });
  });

  // 测试所有测试用例
  describe("测试用例", () => {
    TEST_CASES.forEach((testCase, index) => {
      it(`测试用例 ${index + 1}: ${testCase.name}`, () => {
        const score = calculateGeometricBalance(testCase.cuboids);

        // 验证分数是否在预期范围内
        if (testCase.expectedMin !== undefined) {
          expect(score).toBeGreaterThanOrEqual(testCase.expectedMin);
        }
        if (testCase.expectedMax !== undefined) {
          expect(score).toBeLessThanOrEqual(testCase.expectedMax);
        }
      });
    });
  });
});
