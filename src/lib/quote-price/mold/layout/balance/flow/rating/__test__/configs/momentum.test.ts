import { describe, test, expect, beforeAll } from "vitest";
import { calculateMomentumScore } from "../../metrics/momentum";
import { MOMENTUM } from "../../magic-numbers/options/momentum";
import { momentumTestCases } from "../test-cases/momentum-test-cases";
import { runMomentumTestCase } from "../test-utils/run-momentum-test";
import { calculateRatio, calculateRSD } from "../../physics/statistics";

beforeAll(() => {
  console.clear();
  console.log(
    "bun test src/lib/quote-price/mold/layout/balance/flow/rating/magic-numbers/__test__/configs/momentum.test.ts",
  );
  console.log(momentumTestCases.description);
});

describe(momentumTestCases.description, () => {
  // 运行所有基本测试用例
  momentumTestCases.cases.forEach((testCase) => {
    runMomentumTestCase(testCase);
  });

  // 特殊测试：权重验证
  test("得分应该根据配置的权重正确组合", () => {
    const moments = [10, 12, 15, 8];
    const ratio = calculateRatio(moments);
    const rsd = calculateRSD(moments);
    const score = calculateMomentumScore(ratio, rsd, moments);

    // 验证分项得分是否在合理范围内
    expect(score.breakdown.ratio).toBeGreaterThanOrEqual(0);
    expect(score.breakdown.ratio).toBeLessThanOrEqual(100);
    expect(score.breakdown.rsd).toBeGreaterThanOrEqual(0);
    expect(score.breakdown.rsd).toBeLessThanOrEqual(100);

    // 验证总分是否大于等于加权和
    // 因为总分还包含了奖励分，所以总分应该大于等于加权和
    const weightedSum =
      MOMENTUM.WEIGHT.RATIO * score.breakdown.ratio +
      MOMENTUM.WEIGHT.RSD * score.breakdown.rsd;

    expect(score.total).toBeGreaterThanOrEqual(weightedSum);
  });

  // 一致性测试
  test("相同的输入应该得到相同的分数", () => {
    const moments1 = [10, 12, 15, 8];
    const ratio1 = calculateRatio(moments1);
    const rsd1 = calculateRSD(moments1);
    const score1 = calculateMomentumScore(ratio1, rsd1, moments1);

    const moments2 = [10, 12, 15, 8];
    const ratio2 = calculateRatio(moments2);
    const rsd2 = calculateRSD(moments2);
    const score2 = calculateMomentumScore(ratio2, rsd2, moments2);

    expect(score1.total).toBe(score2.total);
    expect(score1.breakdown.ratio).toBe(score2.breakdown.ratio);
    expect(score1.breakdown.rsd).toBe(score2.breakdown.rsd);
  });

  // 边界测试
  test("空数组或单个值应该返回合理的分数", () => {
    const emptyScore = calculateMomentumScore(0, 0, []);
    expect(emptyScore.total).toBeGreaterThanOrEqual(0);
    expect(emptyScore.total).toBeLessThanOrEqual(100);

    const singleScore = calculateMomentumScore(1, 0, [10]);
    expect(singleScore.total).toBeGreaterThanOrEqual(0);
    expect(singleScore.total).toBeLessThanOrEqual(100);
  });
});
