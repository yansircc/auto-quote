import { test, expect } from "vitest";
import type { MomentumTestCase } from "../types";
import { calculateMomentumScore } from "../../metrics/momentum";
import { DEFAULT_MOMENTUM } from "../../magic-numbers/options/momentum/default";
import { calculateRatio, calculateRSD } from "../../physics/statistics";

/**
 * 运行力矩测试用例
 * @param testCase 测试用例
 */
export function runMomentumTestCase(testCase: MomentumTestCase) {
  test(testCase.name, () => {
    const { moments } = testCase.input;
    const ratio = calculateRatio(moments);
    const rsd = calculateRSD(moments);
    const score = calculateMomentumScore(ratio, rsd, moments);

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
      // TODO: 未来删除
      //   const debugPrefix = "分析时，始终考虑：\n1. 数值合理吗？是不是算法问题？\n2. 是不是用例本身有问题？\n3. 是不是用例的期待不符合预期？\n4. 是不是配置项有问题？\n\n使用英文推理，中文来写代码中的注释和说明。";
      //   console.log(debugPrefix);
      console.log("\n测试失败详情:");
      console.log(`测试名称: ${testCase.name}`);
      console.log(`输入:`);
      console.log(`  力矩数组: [${moments.join(", ")}]`);
      console.log(`  比例: ${ratio.toFixed(3)}`);
      console.log(`  相对标准差: ${rsd.toFixed(3)}`);
      console.log(`得分详情:`);
      console.log(`  总分: ${score.total}`);
      console.log(`  分项得分:`);
      console.log(JSON.stringify(score.breakdown, null, 2));
      console.log(`期望结果:`);
      console.log(JSON.stringify(testCase.expect, null, 2));
      console.log(`\n配置权重:`);
      console.log(`  比例权重: ${DEFAULT_MOMENTUM.WEIGHT.RATIO}`);
      console.log(`  标准差权重: ${DEFAULT_MOMENTUM.WEIGHT.RSD}`);
      throw error;
    }
  });
}
