import { createTestCases } from "@/lib/quote-price/mold/layout/balance/generic-optimizer";
import type { TestCaseBuilderOptions } from "@/lib/quote-price/mold/layout/balance/generic-optimizer";
import type { MomentumInput, MomentumConfig } from "../core/types";
import { MomentumMetric } from "../core/types";

/**
 * 动量优化器测试用例数据
 */
export const TEST_CASES_DATA: TestCaseBuilderOptions<MomentumInput>[] = [
  // ==================== 理想/完美情况 ====================
  {
    input: {
      [MomentumMetric.Ratio]: 1.0,
      [MomentumMetric.RSD]: 0.01,
    },
    minScore: 90,
    maxScore: 100,
    description: "理想情况：完美对称分布，最小相对标准差",
  },
  {
    input: {
      [MomentumMetric.Ratio]: 1.01,
      [MomentumMetric.RSD]: 0.01,
    },
    minScore: 90,
    maxScore: 100,
    description: "理想情况：接近完美对称，极小波动",
  },
  {
    input: {
      [MomentumMetric.Ratio]: 1.02,
      [MomentumMetric.RSD]: 0.015,
    },
    minScore: 90,
    maxScore: 100,
    description: "理想情况：轻微不对称，极小波动",
  },

  // ==================== 良好情况 ====================
  {
    input: {
      [MomentumMetric.Ratio]: 1.05,
      [MomentumMetric.RSD]: 0.05,
    },
    minScore: 85,
    maxScore: 95,
    description: "良好情况：轻微不对称，较小相对标准差",
  },
  {
    input: {
      [MomentumMetric.Ratio]: 1.03,
      [MomentumMetric.RSD]: 0.08,
    },
    minScore: 82,
    maxScore: 92,
    description: "良好情况：较小不对称，中等波动",
  },
  {
    input: {
      [MomentumMetric.Ratio]: 1.08,
      [MomentumMetric.RSD]: 0.03,
    },
    minScore: 80,
    maxScore: 90,
    description: "良好情况：中等不对称，较小波动",
  },

  // ==================== 中等情况 ====================
  {
    input: {
      [MomentumMetric.Ratio]: 1.15,
      [MomentumMetric.RSD]: 0.15,
    },
    minScore: 70,
    maxScore: 85,
    description: "中等情况：明显不对称，中等相对标准差",
  },
  {
    input: {
      [MomentumMetric.Ratio]: 1.12,
      [MomentumMetric.RSD]: 0.18,
    },
    minScore: 65,
    maxScore: 80,
    description: "中等情况：中等不对称，较大波动",
  },
  {
    input: {
      [MomentumMetric.Ratio]: 1.18,
      [MomentumMetric.RSD]: 0.12,
    },
    minScore: 65,
    maxScore: 80,
    description: "中等情况：较大不对称，中等波动",
  },

  // ==================== 较差情况 ====================
  {
    input: {
      [MomentumMetric.Ratio]: 1.25,
      [MomentumMetric.RSD]: 0.25,
    },
    minScore: 50,
    maxScore: 70,
    description: "较差情况：严重不对称，较大相对标准差",
  },
  {
    input: {
      [MomentumMetric.Ratio]: 1.22,
      [MomentumMetric.RSD]: 0.28,
    },
    minScore: 48,
    maxScore: 68,
    description: "较差情况：较大不对称，严重波动",
  },
  {
    input: {
      [MomentumMetric.Ratio]: 1.28,
      [MomentumMetric.RSD]: 0.22,
    },
    minScore: 45,
    maxScore: 65,
    description: "较差情况：严重不对称，较大波动",
  },

  // ==================== 极端情况 ====================
  {
    input: {
      [MomentumMetric.Ratio]: 1.35,
      [MomentumMetric.RSD]: 0.3,
    },
    minScore: 35,
    maxScore: 45,
    description: "极端情况：极度不平衡，极大相对标准差",
  },
  {
    input: {
      [MomentumMetric.Ratio]: 1.4,
      [MomentumMetric.RSD]: 0.25,
    },
    minScore: 30,
    maxScore: 40,
    description: "极端情况：极度不对称，较大波动",
  },
  {
    input: {
      [MomentumMetric.Ratio]: 1.3,
      [MomentumMetric.RSD]: 0.35,
    },
    minScore: 30,
    maxScore: 45,
    description: "极端情况：严重不对称，极度波动",
  },

  // ==================== 特殊边界情况 ====================
  {
    input: {
      [MomentumMetric.Ratio]: 1.02,
      [MomentumMetric.RSD]: 0.2,
    },
    minScore: 60,
    maxScore: 80,
    description: "特殊情况：比率接近理想但波动较大",
  },
  // ==================== 组合测试情况 ====================
  {
    input: {
      [MomentumMetric.Ratio]: 1.1,
      [MomentumMetric.RSD]: 0.1,
    },
    minScore: 75,
    maxScore: 85,
    description: "组合情况：各项指标均处于中间水平",
  },
];

/**
 * 动量优化器测试用例
 */
export const TEST_CASES = createTestCases<MomentumInput, MomentumConfig>(
  TEST_CASES_DATA,
);
