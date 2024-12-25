import { createTestCases } from "@/lib/quote-price/mold/layout/balance/generic-optimizer";
import type { TestCaseBuilderOptions } from "@/lib/quote-price/mold/layout/balance/generic-optimizer";
import type { PositionInput, PositionConfig } from "../core/types";
import { PositionMetric } from "../core/types";

/**
 * 位置分布优化器测试用例数据
 */
export const TEST_CASES_DATA: TestCaseBuilderOptions<PositionInput>[] = [
  // ==================== 完美情况 ====================
  {
    input: {
      [PositionMetric.Deviation]: 0,
      [PositionMetric.Height]: 0,
    },
    minScore: 95,
    maxScore: 100,
    description: "完美情况：完全居中，零重心",
  },
  {
    input: {
      [PositionMetric.Deviation]: 0.05,
      [PositionMetric.Height]: 0.05,
    },
    minScore: 90,
    maxScore: 98,
    description: "完美情况：微小偏差，极低重心",
  },

  // ==================== 优秀情况 ====================
  {
    input: {
      [PositionMetric.Deviation]: 0.1,
      [PositionMetric.Height]: 0.15,
    },
    minScore: 85,
    maxScore: 95,
    description: "优秀情况：轻微偏离，低重心",
  },
  {
    input: {
      [PositionMetric.Deviation]: 0.15,
      [PositionMetric.Height]: 0.2,
    },
    minScore: 80,
    maxScore: 90,
    description: "优秀情况：小幅偏离，较低重心",
  },

  // ==================== 良好情况 ====================
  {
    input: {
      [PositionMetric.Deviation]: 0.25,
      [PositionMetric.Height]: 0.3,
    },
    minScore: 70,
    maxScore: 85,
    description: "良好情况：适中偏离，中低重心",
  },
  {
    input: {
      [PositionMetric.Deviation]: 0.3,
      [PositionMetric.Height]: 0.35,
    },
    minScore: 65,
    maxScore: 80,
    description: "良好情况：明显偏离，中等重心",
  },

  // ==================== 一般情况 ====================
  {
    input: {
      [PositionMetric.Deviation]: 0.4,
      [PositionMetric.Height]: 0.45,
    },
    minScore: 55,
    maxScore: 70,
    description: "一般情况：显著偏离，较高重心",
  },
  {
    input: {
      [PositionMetric.Deviation]: 0.45,
      [PositionMetric.Height]: 0.5,
    },
    minScore: 50,
    maxScore: 65,
    description: "一般情况：严重偏离，高重心",
  },

  // ==================== 较差情况 ====================
  {
    input: {
      [PositionMetric.Deviation]: 0.55,
      [PositionMetric.Height]: 0.6,
    },
    minScore: 40,
    maxScore: 55,
    description: "较差情况：高度偏离，很高重心",
  },
  {
    input: {
      [PositionMetric.Deviation]: 0.6,
      [PositionMetric.Height]: 0.65,
    },
    minScore: 35,
    maxScore: 50,
    description: "较差情况：过度偏离，极高重心",
  },

  // ==================== 极差情况 ====================
  {
    input: {
      [PositionMetric.Deviation]: 0.7,
      [PositionMetric.Height]: 0.75,
    },
    minScore: 25,
    maxScore: 40,
    description: "极差情况：严重失衡，危险重心",
  },
  {
    input: {
      [PositionMetric.Deviation]: 0.75,
      [PositionMetric.Height]: 0.8,
    },
    minScore: 20,
    maxScore: 35,
    description: "极差情况：完全失衡，极限重心",
  },

  // ==================== 边界情况 ====================
  {
    input: {
      [PositionMetric.Deviation]: 0.9,
      [PositionMetric.Height]: 0.9,
    },
    minScore: 10,
    maxScore: 25,
    description: "边界情况：接近极限偏离和重心",
  },
  {
    input: {
      [PositionMetric.Deviation]: 1.0,
      [PositionMetric.Height]: 1.0,
    },
    minScore: 0,
    maxScore: 15,
    description: "边界情况：最大偏离和最高重心",
  },
];

/**
 * 位置分布优化器测试用例
 */
export const TEST_CASES = createTestCases<PositionInput, PositionConfig>(
  TEST_CASES_DATA,
);
