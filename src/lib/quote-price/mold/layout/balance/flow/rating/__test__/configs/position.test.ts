import { describe, test, expect, beforeAll } from "vitest";
import { calculatePositionScore } from "../../metrics/position";
import { POSITION } from "../../magic-numbers/options";
import { positionTestCases } from "../test-cases/position-test-cases";
import { runPositionTestCase } from "../test-utils/run-position-test";

beforeAll(() => {
  console.clear();
  console.log(
    "bun test src/lib/quote-price/mold/layout/balance/flow/rating/__test__/position.test.ts",
  );
  console.log(positionTestCases.description);
});

describe(positionTestCases.description, () => {
  // 运行所有基本测试用例
  positionTestCases.cases.forEach((testCase) => {
    runPositionTestCase(testCase);
  });

  // 特殊测试：权重验证
  test("得分应该根据配置的权重正确组合", () => {
    const score = calculatePositionScore(0.2, 0.4, 10);

    // 验证分项得分是否在合理范围内
    expect(score.breakdown.deviation).toBeGreaterThanOrEqual(0);
    expect(score.breakdown.deviation).toBeLessThanOrEqual(100);
    expect(score.breakdown.height).toBeGreaterThanOrEqual(0);
    expect(score.breakdown.height).toBeLessThanOrEqual(100);

    // 验证总分是否大于等于加权和
    // 因为总分还包含了奖励分，所以总分应该大于等于加权和
    const weightedSum =
      POSITION.WEIGHT.DEVIATION * score.breakdown.deviation +
      POSITION.WEIGHT.HEIGHT * score.breakdown.height;

    expect(score.total).toBeGreaterThanOrEqual(weightedSum);
  });

  // 一致性测试
  test("相同的输入应该得到相同的分数", () => {
    const score1 = calculatePositionScore(0.1, 0.2, 10);
    const score2 = calculatePositionScore(0.1, 0.2, 10);
    expect(score1.total).toBe(score2.total);
    expect(score1.breakdown.deviation).toBe(score2.breakdown.deviation);
    expect(score1.breakdown.height).toBe(score2.breakdown.height);
  });
});
