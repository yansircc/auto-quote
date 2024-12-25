import { createTestCases } from "@/lib/quote-price/mold/layout/balance/generic-optimizer";
import type { TestCaseBuilderOptions } from "@/lib/quote-price/mold/layout/balance/generic-optimizer";
import type { UniformityInput, UniformityConfig } from "../core/types";
import { UniformityMetric } from "../core/types";

/**
 * 分布均匀性优化器测试用例数据
 */
const TEST_CASES_DATA: TestCaseBuilderOptions<UniformityInput>[] = [
  // ==================== 完美情况 ====================
  {
    input: {
      [UniformityMetric.GridVariance]: 0.01,
      [UniformityMetric.DensityChange]: 0.02,
      [UniformityMetric.ClusterIndex]: 0.05,
    },
    minScore: 95,
    maxScore: 100,
    description: "完美情况：理想均匀分布",
  },
  {
    input: {
      [UniformityMetric.GridVariance]: 0.03,
      [UniformityMetric.DensityChange]: 0.04,
      [UniformityMetric.ClusterIndex]: 0.06,
    },
    minScore: 90,
    maxScore: 100,
    description: "完美情况：近乎理想分布",
  },

  // ==================== 优秀情况 ====================
  {
    input: {
      [UniformityMetric.GridVariance]: 0.15,
      [UniformityMetric.DensityChange]: 0.25,
      [UniformityMetric.ClusterIndex]: 0.2,
    },
    minScore: 80,
    maxScore: 90,
    description: "优秀情况：良好均匀分布",
  },
  {
    input: {
      [UniformityMetric.GridVariance]: 0.18,
      [UniformityMetric.DensityChange]: 0.28,
      [UniformityMetric.ClusterIndex]: 0.23,
    },
    minScore: 80,
    maxScore: 90,
    description: "优秀情况：高度均匀分布",
  },

  // ==================== 良好情况 ====================
  {
    input: {
      [UniformityMetric.GridVariance]: 0.25,
      [UniformityMetric.DensityChange]: 0.35,
      [UniformityMetric.ClusterIndex]: 0.3,
    },
    minScore: 70,
    maxScore: 80,
    description: "良好情况：基本均匀分布",
  },
  {
    input: {
      [UniformityMetric.GridVariance]: 0.28,
      [UniformityMetric.DensityChange]: 0.38,
      [UniformityMetric.ClusterIndex]: 0.33,
    },
    minScore: 70,
    maxScore: 80,
    description: "良好情况：较好均匀分布",
  },

  // ==================== 临界情况 ====================
  {
    input: {
      [UniformityMetric.GridVariance]: 0.3,
      [UniformityMetric.DensityChange]: 0.4,
      [UniformityMetric.ClusterIndex]: 0.35,
    },
    minScore: 65,
    maxScore: 70,
    description: "临界情况：接近及格线",
  },
  {
    input: {
      [UniformityMetric.GridVariance]: 0.45,
      [UniformityMetric.DensityChange]: 0.55,
      [UniformityMetric.ClusterIndex]: 0.5,
    },
    minScore: 55,
    maxScore: 65,
    description: "临界情况：刚好不及格",
  },

  // ==================== 一般情况 ====================
  {
    input: {
      [UniformityMetric.GridVariance]: 0.35,
      [UniformityMetric.DensityChange]: 0.45,
      [UniformityMetric.ClusterIndex]: 0.4,
    },
    minScore: 60,
    maxScore: 75,
    description: "一般情况：中等均匀分布",
  },
  {
    input: {
      [UniformityMetric.GridVariance]: 0.4,
      [UniformityMetric.DensityChange]: 0.5,
      [UniformityMetric.ClusterIndex]: 0.45,
    },
    minScore: 60,
    maxScore: 75,
    description: "一般情况：普通均匀分布",
  },

  // ==================== 较差情况 ====================
  {
    input: {
      [UniformityMetric.GridVariance]: 0.65,
      [UniformityMetric.DensityChange]: 0.75,
      [UniformityMetric.ClusterIndex]: 0.7,
    },
    minScore: 30,
    maxScore: 50,
    description: "较差情况：明显不均匀分布",
  },
  {
    input: {
      [UniformityMetric.GridVariance]: 0.7,
      [UniformityMetric.DensityChange]: 0.8,
      [UniformityMetric.ClusterIndex]: 0.75,
    },
    minScore: 30,
    maxScore: 50,
    description: "较差情况：显著不均匀分布",
  },

  // ==================== 极差情况 ====================
  {
    input: {
      [UniformityMetric.GridVariance]: 0.75,
      [UniformityMetric.DensityChange]: 0.85,
      [UniformityMetric.ClusterIndex]: 0.8,
    },
    minScore: 15,
    maxScore: 30,
    description: "极差情况：严重不均匀分布",
  },
  {
    input: {
      [UniformityMetric.GridVariance]: 0.8,
      [UniformityMetric.DensityChange]: 0.9,
      [UniformityMetric.ClusterIndex]: 0.85,
    },
    minScore: 15,
    maxScore: 30,
    description: "极差情况：高度不均匀分布",
  },

  // ==================== 极端情况 ====================
  {
    input: {
      [UniformityMetric.GridVariance]: 0.85,
      [UniformityMetric.DensityChange]: 0.95,
      [UniformityMetric.ClusterIndex]: 0.9,
    },
    minScore: 0,
    maxScore: 30,
    description: "极端情况：极度不均匀分布",
  },
  {
    input: {
      [UniformityMetric.GridVariance]: 1.0,
      [UniformityMetric.DensityChange]: 1.0,
      [UniformityMetric.ClusterIndex]: 1.0,
    },
    minScore: 0,
    maxScore: 10,
    description: "极端情况：完全集中分布",
  },
];

/**
 * 测试用例构建选项
 */
export const TEST_CASES = createTestCases<UniformityInput, UniformityConfig>(
  TEST_CASES_DATA,
);
