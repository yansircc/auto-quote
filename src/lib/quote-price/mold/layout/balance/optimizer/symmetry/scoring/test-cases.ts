import { createTestCases } from "@/lib/quote-price/mold/layout/balance/generic-optimizer";
import type { TestCaseBuilderOptions } from "@/lib/quote-price/mold/layout/balance/generic-optimizer";
import type { SymmetryInput, SymmetryConfig } from "../core/types";
import { SymmetryMetric } from "../core/types";

/**
 * 对称性优化器测试用例数据
 */
export const TEST_CASES_DATA: TestCaseBuilderOptions<SymmetryInput>[] = [
  // ==================== 完美情况 ====================
  {
    input: {
      [SymmetryMetric.Axial]: 0.01,
      [SymmetryMetric.Mass]: 0.01,
    },
    minScore: 95,
    maxScore: 100,
    description: "完美情况：几乎完全对称，重心位置理想",
  },
  {
    input: {
      [SymmetryMetric.Axial]: 0.015,
      [SymmetryMetric.Mass]: 0.012,
    },
    minScore: 92,
    maxScore: 98,
    description: "完美情况：极微小偏差，整体表现优异",
  },

  // ==================== 优秀情况 ====================
  {
    input: {
      [SymmetryMetric.Axial]: 0.03,
      [SymmetryMetric.Mass]: 0.025,
    },
    minScore: 85,
    maxScore: 92,
    description: "优秀情况：轻微不对称，重心位置优秀",
  },
  {
    input: {
      [SymmetryMetric.Axial]: 0.045,
      [SymmetryMetric.Mass]: 0.035,
    },
    minScore: 82,
    maxScore: 88,
    description: "优秀情况：可察觉偏差，但整体表现优秀",
  },

  // ==================== 良好情况 ====================
  {
    input: {
      [SymmetryMetric.Axial]: 0.06,
      [SymmetryMetric.Mass]: 0.05,
    },
    minScore: 70,
    maxScore: 85,
    description: "良好情况：不对称明显但仍在控制范围内",
  },
  {
    input: {
      [SymmetryMetric.Axial]: 0.1,
      [SymmetryMetric.Mass]: 0.08,
    },
    minScore: 70,
    maxScore: 85,
    description: "良好情况：不对称明显但仍在控制范围内",
  },

  // ==================== 一般情况 ====================
  {
    input: {
      [SymmetryMetric.Axial]: 0.12,
      [SymmetryMetric.Mass]: 0.1,
    },
    minScore: 60,
    maxScore: 70,
    description: "一般情况：中等程度不对称",
  },
  {
    input: {
      [SymmetryMetric.Axial]: 0.15,
      [SymmetryMetric.Mass]: 0.12,
    },
    minScore: 55,
    maxScore: 65,
    description: "一般情况：显著偏差但仍可使用",
  },

  // ==================== 较差情况 ====================
  {
    input: {
      [SymmetryMetric.Axial]: 0.25,
      [SymmetryMetric.Mass]: 0.2,
    },
    minScore: 45,
    maxScore: 55,
    description: "较差情况：严重不对称",
  },
  {
    input: {
      [SymmetryMetric.Axial]: 0.3,
      [SymmetryMetric.Mass]: 0.25,
    },
    minScore: 40,
    maxScore: 50,
    description: "较差情况：显著的平衡问题",
  },

  // ==================== 极差情况 ====================
  {
    input: {
      [SymmetryMetric.Axial]: 0.4,
      [SymmetryMetric.Mass]: 0.35,
    },
    minScore: 30,
    maxScore: 40,
    description: "极差情况：严重失衡",
  },
  {
    input: {
      [SymmetryMetric.Axial]: 0.5,
      [SymmetryMetric.Mass]: 0.45,
    },
    minScore: 20,
    maxScore: 30,
    description: "极差情况：完全失衡",
  },

  // ==================== 边界情况 ====================
  {
    input: {
      [SymmetryMetric.Axial]: 0.05,
      [SymmetryMetric.Mass]: 0.3,
    },
    minScore: 50,
    maxScore: 60,
    description: "边界情况：轴向对称性好但重心严重偏移",
  },
  {
    input: {
      [SymmetryMetric.Axial]: 0.3,
      [SymmetryMetric.Mass]: 0.05,
    },
    minScore: 55,
    maxScore: 65,
    description: "边界情况：重心位置好但轴向严重不对称",
  },
];

/**
 * 对称性优化器测试用例
 */
export const TEST_CASES = createTestCases<SymmetryInput, SymmetryConfig>(
  TEST_CASES_DATA,
);
