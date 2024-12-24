import { createTestCases } from "@/lib/quote-price/mold/layout/balance/generic-optimizer";
import type { TestCaseBuilderOptions } from "@/lib/quote-price/mold/layout/balance/generic-optimizer";
import type { DistanceInput, DistanceConfig } from "../core/types";

/**
 * 距离优化器测试用例
 */
export const TEST_CASES_DATA: TestCaseBuilderOptions<DistanceInput>[] = [
  // 理想情况
  {
    input: { cv: 0, range: 0 },
    minScore: 95,
    maxScore: 100,
    description: "理想情况：无偏离 + 无极差",
  },
  // 极微偏离
  {
    input: { cv: 0.01, range: 0.05 },
    minScore: 90,
    maxScore: 100,
    description: "极微偏离：几乎完美",
  },
  // 完美情况
  {
    input: { cv: 0.03, range: 0.1 },
    minScore: 90,
    maxScore: 100,
    description: "完美情况：极小偏离 + 低重心",
  },
  // 优秀情况
  {
    input: { cv: 0.15, range: 0.25 },
    minScore: 80,
    maxScore: 95,
    description: "优秀情况：小偏离 + 中等重心",
  },
  // 良好情况
  {
    input: { cv: 0.35, range: 0.45 },
    minScore: 70,
    maxScore: 80,
    description: "良好情况：中等偏离 + 中等重心",
  },
  // 中等情况
  {
    input: { cv: 0.45, range: 0.5 },
    minScore: 65,
    maxScore: 85,
    description: "中等情况：偏离中等偏高 + 极差比中等偏高",
  },
  // 一般情况
  {
    input: { cv: 0.6, range: 0.7 },
    minScore: 60,
    maxScore: 75,
    description: "一般情况：中等偏离 + 中等重心",
  },
  // 偏离度中上
  {
    input: { cv: 0.7, range: 0.2 },
    minScore: 60,
    maxScore: 80,
    description: "偏离度中上 + 极差比较低",
  },
  // 较差情况
  {
    input: { cv: 0.8, range: 0.9 },
    minScore: 40,
    maxScore: 60,
    description: "较差情况：大偏离 + 高重心",
  },
  // 近极端情况
  {
    input: { cv: 0.99, range: 0.99 },
    minScore: 0,
    maxScore: 40,
    description: "近极端情况：偏离度与极差比均接近 1",
  },
  // 极端情况
  {
    input: { cv: 1.0, range: 1.0 },
    minScore: 0,
    maxScore: 30,
    description: "极端情况：极大偏离 + 极高重心",
  },
  // 特殊矛盾情况
  {
    input: { cv: 0.05, range: 2.0 },
    minScore: 30,
    maxScore: 60,
    description: "矛盾情况：偏离度极小但极差比很大",
  },
  {
    input: { cv: 1.0, range: 0.05 },
    minScore: 45,
    maxScore: 65,
    description: "混合极端：偏离度极大 + 极差比极小",
  },
  // 超极端情况
  {
    input: { cv: 2.0, range: 5.0 },
    minScore: 0,
    maxScore: 35,
    description: "超极端情况：偏离度与极差比都超大",
  },
];

export const TEST_CASES = createTestCases<DistanceInput, DistanceConfig>(
  TEST_CASES_DATA,
);
