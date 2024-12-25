import { test, expect } from "vitest";
import type { DistanceTestCase } from "../types";
import { calculateDistanceScore } from "../../metrics/distance";
import { calculateCV, calculateRange } from "../../physics/statistics";

/**
 * 运行距离测试用例
 * @param testCase 测试用例
 */
export function runDistanceTestCase(testCase: DistanceTestCase) {
  test(testCase.name, () => {
    const { distances, layoutSize = 1 } = testCase.input;

    // 计算变异系数和极值差
    const cv = calculateCV(distances);
    const range = calculateRange(distances);

    const score = calculateDistanceScore(cv, range, layoutSize, distances);

    try {
      // 检查分数是否在期望范围内
      if (testCase.expect.exact !== undefined) {
        expect(
          score.total,
          `期望分数为 ${testCase.expect.exact}，但得到 ${score.total}`,
        ).toBeCloseTo(testCase.expect.exact, 1);
      }

      if (testCase.expect.min !== undefined) {
        expect(
          score.total,
          `分数 ${score.total} 应该大于等于 ${testCase.expect.min}`,
        ).toBeGreaterThanOrEqual(testCase.expect.min);
      }

      if (testCase.expect.max !== undefined) {
        expect(
          score.total,
          `分数 ${score.total} 应该小于等于 ${testCase.expect.max}`,
        ).toBeLessThanOrEqual(testCase.expect.max);
      }
    } catch (error) {
      // 如果测试失败，打印详细信息
      console.log("\n测试失败详情:");
      console.log(`测试名称: ${testCase.name}`);
      console.log(`输入:`);
      console.log(`  距离数组: [${distances.join(", ")}]`);
      console.log(`  变异系数: ${cv.toFixed(4)}`);
      console.log(`  极值差: ${range.toFixed(4)}`);
      console.log(`  布局尺寸: ${layoutSize}`);
      console.log(`得分详情:`);
      console.log(`  总分: ${score.total}`);
      console.log(`  分项得分:`);
      console.log(JSON.stringify(score.breakdown, null, 2));
      console.log(`期望结果:`);
      console.log(JSON.stringify(testCase.expect, null, 2));
      throw error;
    }
  });
}
