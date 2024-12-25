import { createTestCases } from "@/lib/quote-price/mold/layout/balance/generic-optimizer";
import type { TestCaseBuilderOptions } from "@/lib/quote-price/mold/layout/balance/generic-optimizer";
import type { ShapeInput, ShapeConfig } from "../core/types";
import { ShapeMetric } from "../core/types";

/**
 * 形状相似度优化器测试用例数据
 */
export const TEST_CASES_DATA: TestCaseBuilderOptions<ShapeInput>[] = [
  // ==================== 完美情况 ====================
  {
    input: {
      [ShapeMetric.DimensionDiff]: 0,
      [ShapeMetric.ExtremeIndex]: 0,
      [ShapeMetric.SwapRatio]: 0,
    },
    minScore: 95,
    maxScore: 100,
    description: "完美情况：完全匹配维度，无极端形状，无维度交换",
  },
  {
    input: {
      [ShapeMetric.DimensionDiff]: 0.05,
      [ShapeMetric.ExtremeIndex]: 0.05,
      [ShapeMetric.SwapRatio]: 0.05,
    },
    minScore: 90,
    maxScore: 98,
    description: "完美情况：微小维度差异，极轻微极端形状，极少维度交换",
  },

  // ==================== 优秀情况 ====================
  {
    input: {
      [ShapeMetric.DimensionDiff]: 0.1,
      [ShapeMetric.ExtremeIndex]: 0.12,
      [ShapeMetric.SwapRatio]: 0.08,
    },
    minScore: 85,
    maxScore: 95,
    description: "优秀情况：轻微维度差异，轻微极端形状，少量维度交换",
  },
  {
    input: {
      [ShapeMetric.DimensionDiff]: 0.15,
      [ShapeMetric.ExtremeIndex]: 0.15,
      [ShapeMetric.SwapRatio]: 0.12,
    },
    minScore: 80,
    maxScore: 90,
    description: "优秀情况：小幅维度差异，小幅极端形状，较少维度交换",
  },

  // ==================== 良好情况 ====================
  {
    input: {
      [ShapeMetric.DimensionDiff]: 0.25,
      [ShapeMetric.ExtremeIndex]: 0.25,
      [ShapeMetric.SwapRatio]: 0.2,
    },
    minScore: 70,
    maxScore: 85,
    description: "良好情况：适中维度差异，适中极端形状，适中维度交换",
  },
  {
    input: {
      [ShapeMetric.DimensionDiff]: 0.3,
      [ShapeMetric.ExtremeIndex]: 0.3,
      [ShapeMetric.SwapRatio]: 0.25,
    },
    minScore: 65,
    maxScore: 80,
    description: "良好情况：明显维度差异，明显极端形状，明显维度交换",
  },

  // ==================== 一般情况 ====================
  {
    input: {
      [ShapeMetric.DimensionDiff]: 0.4,
      [ShapeMetric.ExtremeIndex]: 0.4,
      [ShapeMetric.SwapRatio]: 0.35,
    },
    minScore: 55,
    maxScore: 70,
    description: "一般情况：显著维度差异，显著极端形状，频繁维度交换",
  },
  {
    input: {
      [ShapeMetric.DimensionDiff]: 0.45,
      [ShapeMetric.ExtremeIndex]: 0.45,
      [ShapeMetric.SwapRatio]: 0.4,
    },
    minScore: 50,
    maxScore: 65,
    description: "一般情况：严重维度差异，严重极端形状，高频维度交换",
  },

  // ==================== 较差情况 ====================
  {
    input: {
      [ShapeMetric.DimensionDiff]: 0.55,
      [ShapeMetric.ExtremeIndex]: 0.55,
      [ShapeMetric.SwapRatio]: 0.5,
    },
    minScore: 40,
    maxScore: 55,
    description: "较差情况：高度维度差异，高度极端形状，很频繁维度交换",
  },
  {
    input: {
      [ShapeMetric.DimensionDiff]: 0.6,
      [ShapeMetric.ExtremeIndex]: 0.6,
      [ShapeMetric.SwapRatio]: 0.55,
    },
    minScore: 35,
    maxScore: 50,
    description: "较差情况：过度维度差异，过度极端形状，极频繁维度交换",
  },

  // ==================== 极差情况 ====================
  {
    input: {
      [ShapeMetric.DimensionDiff]: 0.7,
      [ShapeMetric.ExtremeIndex]: 0.7,
      [ShapeMetric.SwapRatio]: 0.65,
    },
    minScore: 25,
    maxScore: 40,
    description: "极差情况：严重失衡维度，严重失衡形状，持续维度交换",
  },
  {
    input: {
      [ShapeMetric.DimensionDiff]: 0.75,
      [ShapeMetric.ExtremeIndex]: 0.75,
      [ShapeMetric.SwapRatio]: 0.7,
    },
    minScore: 20,
    maxScore: 35,
    description: "极差情况：完全失衡维度，完全失衡形状，大量维度交换",
  },

  // ==================== 边界情况 ====================
  {
    input: {
      [ShapeMetric.DimensionDiff]: 0.9,
      [ShapeMetric.ExtremeIndex]: 0.9,
      [ShapeMetric.SwapRatio]: 0.85,
    },
    minScore: 10,
    maxScore: 25,
    description: "边界情况：接近极限维度差异和形状失衡",
  },
  {
    input: {
      [ShapeMetric.DimensionDiff]: 1.0,
      [ShapeMetric.ExtremeIndex]: 1.0,
      [ShapeMetric.SwapRatio]: 1.0,
    },
    minScore: 0,
    maxScore: 15,
    description: "边界情况：最大维度差异，最大形状失衡，完全维度交换",
  },
];

/**
 * 形状相似度优化器测试用例
 */
export const TEST_CASES = createTestCases<ShapeInput, ShapeConfig>(
  TEST_CASES_DATA,
);
