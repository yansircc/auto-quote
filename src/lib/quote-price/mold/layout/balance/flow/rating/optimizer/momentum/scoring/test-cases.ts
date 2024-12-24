import { createTestCases } from "@/lib/quote-price/mold/layout/balance/generic-optimizer";
import type { TestCaseBuilderOptions } from "@/lib/quote-price/mold/layout/balance/generic-optimizer";
import type { MomentumInput, MomentumConfig } from "../core/types";

/**
 * 动量优化器测试用例数据
 */
export const TEST_CASES_DATA: TestCaseBuilderOptions<MomentumInput>[] = [
  // ==================== 理想/完美情况 ====================
  {
    input: {
      ratio: 1.0,
      rsd: 0.01,
    },
    minScore: 90,
    maxScore: 100,
    description: "理想情况：完美对称分布，最小相对标准差",
  },
  {
    input: {
      ratio: 1.01,
      rsd: 0.01,
    },
    minScore: 90,
    maxScore: 100,
    description: "理想情况：接近完美对称，极小波动",
  },
  {
    input: {
      ratio: 1.02,
      rsd: 0.015,
    },
    minScore: 90,
    maxScore: 100,
    description: "理想情况：轻微不对称，极小波动",
  },

  // ==================== 良好情况 ====================
  {
    input: {
      ratio: 1.05,
      rsd: 0.05,
    },
    minScore: 85,
    maxScore: 95,
    description: "良好情况：轻微不对称，较小相对标准差",
  },
  {
    input: {
      ratio: 1.03,
      rsd: 0.08,
    },
    minScore: 82,
    maxScore: 92,
    description: "良好情况：较小不对称，中等波动",
  },
  {
    input: {
      ratio: 1.08,
      rsd: 0.03,
    },
    minScore: 80,
    maxScore: 90,
    description: "良好情况：中等不对称，较小波动",
  },

  // ==================== 中等情况 ====================
  {
    input: {
      ratio: 1.15,
      rsd: 0.15,
    },
    minScore: 70,
    maxScore: 85,
    description: "中等情况：明显不对称，中等相对标准差",
  },
  {
    input: {
      ratio: 1.12,
      rsd: 0.18,
    },
    minScore: 65,
    maxScore: 80,
    description: "中等情况：中等不对称，较大波动",
  },
  {
    input: {
      ratio: 1.18,
      rsd: 0.12,
    },
    minScore: 65,
    maxScore: 80,
    description: "中等情况：较大不对称，中等波动",
  },

  // ==================== 较差情况 ====================
  {
    input: {
      ratio: 1.25,
      rsd: 0.25,
    },
    minScore: 50,
    maxScore: 70,
    description: "较差情况：严重不对称，较大相对标准差",
  },
  {
    input: {
      ratio: 1.22,
      rsd: 0.28,
    },
    minScore: 48,
    maxScore: 68,
    description: "较差情况：较大不对称，严重波动",
  },
  {
    input: {
      ratio: 1.28,
      rsd: 0.22,
    },
    minScore: 45,
    maxScore: 65,
    description: "较差情况：严重不对称，较大波动",
  },

  // ==================== 极端情况 ====================
  {
    input: {
      ratio: 1.35,
      rsd: 0.3,
    },
    minScore: 35,
    maxScore: 45,
    description: "极端情况：极度不平衡，极大相对标准差",
  },
  {
    input: {
      ratio: 1.4,
      rsd: 0.25,
    },
    minScore: 30,
    maxScore: 40,
    description: "极端情况：极度不对称，较大波动",
  },
  {
    input: {
      ratio: 1.3,
      rsd: 0.35,
    },
    minScore: 30,
    maxScore: 45,
    description: "极端情况：严重不对称，极度波动",
  },

  // ==================== 特殊边界情况 ====================
  {
    input: {
      ratio: 1.02,
      rsd: 0.2,
    },
    minScore: 60,
    maxScore: 80,
    description: "特殊情况：比率接近理想但波动较大",
  },
  {
    input: {
      ratio: 1.3,
      rsd: 0.05,
    },
    minScore: 60,
    maxScore: 75,
    description: "特殊情况：比率偏大但波动较小",
  },
  {
    input: {
      ratio: 1.15,
      rsd: 0.02,
    },
    minScore: 75,
    maxScore: 85,
    description: "特殊情况：中等不对称但波动极小",
  },

  // ==================== 组合测试情况 ====================
  {
    input: {
      ratio: 1.1,
      rsd: 0.1,
    },
    minScore: 75,
    maxScore: 85,
    description: "组合情况：各项指标均处于中间水平",
  },
  {
    input: {
      ratio: 1.05,
      rsd: 0.15,
    },
    minScore: 70,
    maxScore: 80,
    description: "组合情况：较好比率配合较差波动",
  },
  {
    input: {
      ratio: 1.2,
      rsd: 0.08,
    },
    minScore: 65,
    maxScore: 75,
    description: "组合情况：较差比率配合较好波动",
  },
];

/**
 * 动量优化器测试用例
 */
export const TEST_CASES = createTestCases<MomentumInput, MomentumConfig>(
  TEST_CASES_DATA,
);
