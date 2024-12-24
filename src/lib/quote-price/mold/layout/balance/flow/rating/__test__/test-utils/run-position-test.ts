import { test, expect } from "vitest";
import type { PositionTestCase } from "../types";
import { calculatePositionScore } from "../../metrics/position";
import { DEFAULT_POSITION } from "../../magic-numbers/options";

/**
 * 运行位置测试用例
 * @param testCase 测试用例
 */
export function runPositionTestCase(testCase: PositionTestCase) {
  test(testCase.name, () => {
    const { deviation, height, layoutSize } = testCase.input;
    const score = calculatePositionScore(deviation, height, layoutSize);

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
      console.log(`  偏离度: ${deviation}`);
      console.log(`  高度: ${height}`);
      console.log(`  布局尺寸: ${layoutSize}`);
      console.log(`得分详情:`);
      console.log(`  总分: ${score.total}`);
      console.log(`  分项得分:`);
      console.log(JSON.stringify(score.breakdown, null, 2));
      console.log(`期望结果:`);
      console.log(JSON.stringify(testCase.expect, null, 2));
      console.log(`\n配置权重:`);
      console.log(`  偏离度权重: ${DEFAULT_POSITION.WEIGHT.DEVIATION}`);
      console.log(`  高度权重: ${DEFAULT_POSITION.WEIGHT.HEIGHT}`);
      throw error;
    }
  });
}
