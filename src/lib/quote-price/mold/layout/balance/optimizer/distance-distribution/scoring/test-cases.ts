import { createTestCases } from "@/lib/quote-price/mold/layout/balance/generic-optimizer";
import type { TestCaseBuilderOptions } from "@/lib/quote-price/mold/layout/balance/generic-optimizer";
import type { DistributionInput, DistributionConfig } from "../core/types";
import { DistributionMetric } from "../core/types";

/**
 * 距离分布优化器测试用例数据
 */
export const TEST_CASES_DATA: TestCaseBuilderOptions<DistributionInput>[] = [
  // ==================== 理想/完美情况 ====================
  {
    input: {
      [DistributionMetric.CV]: 0,
      [DistributionMetric.Range]: 0,
    },
    minScore: 95,
    maxScore: 100,
    description: "理想情况：完全均匀分布，无任何偏离",
  },
  {
    input: {
      [DistributionMetric.CV]: 0.01,
      [DistributionMetric.Range]: 0.05,
    },
    minScore: 90,
    maxScore: 100,
    description: "理想情况：极微偏离，几乎完美分布",
  },
  {
    input: {
      [DistributionMetric.CV]: 0.03,
      [DistributionMetric.Range]: 0.1,
    },
    minScore: 90,
    maxScore: 100,
    description: "理想情况：轻微偏离，保持极佳分布",
  },

  // ==================== 良好情况 ====================
  {
    input: {
      [DistributionMetric.CV]: 0.15,
      [DistributionMetric.Range]: 0.25,
    },
    minScore: 80,
    maxScore: 95,
    description: "良好情况：小幅偏离，分布均衡",
  },
  {
    input: {
      [DistributionMetric.CV]: 0.2,
      [DistributionMetric.Range]: 0.3,
    },
    minScore: 75,
    maxScore: 90,
    description: "良好情况：适度偏离，分布可控",
  },

  // ==================== 中等情况 ====================
  {
    input: {
      [DistributionMetric.CV]: 0.35,
      [DistributionMetric.Range]: 0.45,
    },
    minScore: 65,
    maxScore: 80,
    description: "中等情况：中等偏离，分布尚可",
  },
  {
    input: {
      [DistributionMetric.CV]: 0.4,
      [DistributionMetric.Range]: 0.5,
    },
    minScore: 65,
    maxScore: 75,
    description: "中等情况：显著偏离，分布欠佳",
  },

  // ==================== 较差情况 ====================
  {
    input: {
      [DistributionMetric.CV]: 0.45,
      [DistributionMetric.Range]: 0.6,
    },
    minScore: 50,
    maxScore: 65,
    description: "较差情况：严重偏离，分布不均",
  },
  {
    input: {
      [DistributionMetric.CV]: 0.5,
      [DistributionMetric.Range]: 0.7,
    },
    minScore: 40,
    maxScore: 55,
    description: "较差情况：极度偏离，分布失衡",
  },

  // ==================== 极端情况 ====================
  {
    input: {
      [DistributionMetric.CV]: 0.6,
      [DistributionMetric.Range]: 0.8,
    },
    minScore: 30,
    maxScore: 45,
    description: "极端情况：危险偏离，分布极差",
  },
  {
    input: {
      [DistributionMetric.CV]: 0.7,
      [DistributionMetric.Range]: 0.9,
    },
    minScore: 20,
    maxScore: 35,
    description: "极端情况：完全失控，分布崩溃",
  },
];

/**
 * 距离分布优化器测试用例
 */
export const TEST_CASES = createTestCases<
  DistributionInput,
  DistributionConfig
>(TEST_CASES_DATA);
