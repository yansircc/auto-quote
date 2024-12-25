import { describe, test, expect, beforeAll } from "vitest";
import { calculateDistanceScore } from "../../metrics/distance";
import { DISTANCE } from "../../magic-numbers/options/distance";
import { distanceTestCases } from "../test-cases/distance-test-cases";
import { runDistanceTestCase } from "../test-utils/run-distance-test";
import { calculateCV, calculateRange } from "../../physics/statistics";

beforeAll(() => {
  console.clear();
  console.log(
    "bun test src/lib/quote-price/mold/layout/balance/flow/rating/magic-numbers/__test__/configs/distance.test.ts",
  );
  console.log(distanceTestCases.description);
});

describe(distanceTestCases.description, () => {
  // 运行所有基本测试用例
  distanceTestCases.cases.forEach((testCase) => {
    runDistanceTestCase(testCase);
  });

  // 特殊测试：权重验证
  test("得分应该根据配置的权重正确组合", () => {
    const distances = [10, 12, 15, 8];
    const cv = calculateCV(distances);
    const range = calculateRange(distances);
    const score = calculateDistanceScore(cv, range, 20, distances);

    // 验证分项得分是否在合理范围内
    expect(score.breakdown.cv).toBeGreaterThanOrEqual(0);
    expect(score.breakdown.cv).toBeLessThanOrEqual(100);
    expect(score.breakdown.range).toBeGreaterThanOrEqual(0);
    expect(score.breakdown.range).toBeLessThanOrEqual(100);

    // 验证总分是否大于等于加权和
    // 因为总分还包含了奖励分，所以总分应该大于等于加权和
    const weightedSum =
      DISTANCE.WEIGHT.CV * score.breakdown.cv +
      DISTANCE.WEIGHT.RANGE * score.breakdown.range;

    expect(score.total).toBeGreaterThanOrEqual(weightedSum);
  });

  // 一致性测试
  test("相同的输入应该得到相同的分数", () => {
    const distances1 = [10, 12, 15, 8];
    const cv1 = calculateCV(distances1);
    const range1 = calculateRange(distances1);
    const score1 = calculateDistanceScore(cv1, range1, 20, distances1);

    const distances2 = [10, 12, 15, 8];
    const cv2 = calculateCV(distances2);
    const range2 = calculateRange(distances2);
    const score2 = calculateDistanceScore(cv2, range2, 20, distances2);

    expect(score1.total).toBe(score2.total);
    expect(score1.breakdown.cv).toBe(score2.breakdown.cv);
    expect(score1.breakdown.range).toBe(score2.breakdown.range);
  });
});
