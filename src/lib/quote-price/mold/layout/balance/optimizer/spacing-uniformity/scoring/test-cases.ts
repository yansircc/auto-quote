import { createTestCases } from "@/lib/quote-price/mold/layout/balance/generic-optimizer";
import type { TestCaseBuilderOptions } from "@/lib/quote-price/mold/layout/balance/generic-optimizer";
import type { SpacingInput, SpacingConfig } from "../core/types";
import { SpacingMetric } from "../core/types";

/**
 * 间距均匀性优化器测试用例数据
 */
export const TEST_CASES_DATA: TestCaseBuilderOptions<SpacingInput>[] = [
  // ==================== 完美情况 ====================
  {
    input: {
      [SpacingMetric.Distance]: 0.01,
      [SpacingMetric.Directional]: 0.01,
    },
    minScore: 95,
    maxScore: 100,
    description: "完美情况：完全均匀分布，方向完全一致",
  },
  {
    input: {
      [SpacingMetric.Distance]: 0.02,
      [SpacingMetric.Directional]: 0.015,
    },
    minScore: 90,
    maxScore: 98,
    description: "完美情况：近乎完美均匀，方向高度一致",
  },

  // ==================== 优秀情况 ====================
  {
    input: {
      [SpacingMetric.Distance]: 0.05,
      [SpacingMetric.Directional]: 0.04,
    },
    minScore: 85,
    maxScore: 95,
    description: "优秀情况：极高均匀性，方向一致性优秀",
  },
  {
    input: {
      [SpacingMetric.Distance]: 0.08,
      [SpacingMetric.Directional]: 0.06,
    },
    minScore: 80,
    maxScore: 90,
    description: "优秀情况：优秀均匀性，方向一致性很好",
  },

  // ==================== 良好情况 ====================
  {
    input: {
      [SpacingMetric.Distance]: 0.12,
      [SpacingMetric.Directional]: 0.1,
    },
    minScore: 70,
    maxScore: 85,
    description: "良好情况：良好均匀性，方向一致性较好",
  },
  {
    input: {
      [SpacingMetric.Distance]: 0.15,
      [SpacingMetric.Directional]: 0.12,
    },
    minScore: 65,
    maxScore: 80,
    description: "良好情况：较好均匀性，方向一致性良好",
  },

  // ==================== 一般情况 ====================
  {
    input: {
      [SpacingMetric.Distance]: 0.17,
      [SpacingMetric.Directional]: 0.15,
    },
    minScore: 60,
    maxScore: 75,
    description: "一般情况：中等均匀性，方向一致性一般",
  },
  {
    input: {
      [SpacingMetric.Distance]: 0.21,
      [SpacingMetric.Directional]: 0.19,
    },
    minScore: 50,
    maxScore: 70,
    description: "一般情况：一般均匀性，方向一致性中等",
  },

  // ==================== 较差情况 ====================
  {
    input: {
      [SpacingMetric.Distance]: 0.3,
      [SpacingMetric.Directional]: 0.28,
    },
    minScore: 40,
    maxScore: 60,
    description: "较差情况：较差均匀性，方向一致性较差",
  },
  {
    input: {
      [SpacingMetric.Distance]: 0.35,
      [SpacingMetric.Directional]: 0.32,
    },
    minScore: 40,
    maxScore: 55,
    description: "较差情况：差的均匀性，方向一致性不佳",
  },

  // ==================== 极差情况 ====================
  {
    input: {
      [SpacingMetric.Distance]: 0.4,
      [SpacingMetric.Directional]: 0.38,
    },
    minScore: 30,
    maxScore: 45,
    description: "极差情况：很差的均匀性，方向混乱",
  },
  {
    input: {
      [SpacingMetric.Distance]: 0.45,
      [SpacingMetric.Directional]: 0.42,
    },
    minScore: 25,
    maxScore: 40,
    description: "极差情况：极差均匀性，方向严重混乱",
  },

  // ==================== 边界情况 ====================
  {
    input: {
      [SpacingMetric.Distance]: 0.05,
      [SpacingMetric.Directional]: 0.4,
    },
    minScore: 55,
    maxScore: 70,
    description: "边界情况：均匀性好但方向性极差",
  },
  {
    input: {
      [SpacingMetric.Distance]: 0.4,
      [SpacingMetric.Directional]: 0.05,
    },
    minScore: 60,
    maxScore: 75,
    description: "边界情况：均匀性差但方向性好",
  },
];

/**
 * 间距均匀性优化器测试用例
 */
export const TEST_CASES = createTestCases<SpacingInput, SpacingConfig>(
  TEST_CASES_DATA,
);
