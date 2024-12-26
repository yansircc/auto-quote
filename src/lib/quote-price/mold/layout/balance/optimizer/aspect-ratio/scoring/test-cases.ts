import { createTestCases } from "@/lib/quote-price/mold/layout/balance/generic-optimizer";
import type { TestCaseBuilderOptions } from "@/lib/quote-price/mold/layout/balance/generic-optimizer";
import type { RatioInput, AspectRatioConfig } from "../core/types";
import { RatioType } from "../core/types";

/**
 * 长宽比优化器测试用例数据
 */
export const TEST_CASES_DATA: TestCaseBuilderOptions<RatioInput>[] = [
  // ==================== 理想/完美情况 ====================
  {
    input: {
      [RatioType.LongestToShortest]: 1.0,
      [RatioType.MiddleToShortest]: 1.0,
      [RatioType.LongestToMiddle]: 1.0,
    },
    minScore: 90,
    maxScore: 100,
    description: "理想情况：完美立方体，三边完全相等",
  },
  {
    input: {
      [RatioType.LongestToShortest]: 1.05,
      [RatioType.MiddleToShortest]: 1.02,
      [RatioType.LongestToMiddle]: 1.03,
    },
    minScore: 90,
    maxScore: 100,
    description: "理想情况：接近立方体，比例极其接近",
  },
  {
    input: {
      [RatioType.LongestToShortest]: 1.08,
      [RatioType.MiddleToShortest]: 1.04,
      [RatioType.LongestToMiddle]: 1.04,
    },
    minScore: 90,
    maxScore: 100,
    description: "理想情况：轻微偏离，整体保持均衡",
  },

  // ==================== 良好情况 ====================
  {
    input: {
      [RatioType.LongestToShortest]: 1.15,
      [RatioType.MiddleToShortest]: 1.08,
      [RatioType.LongestToMiddle]: 1.06,
    },
    minScore: 80,
    maxScore: 90,
    description: "良好情况：轻微拉伸，比例协调",
  },
  {
    input: {
      [RatioType.LongestToShortest]: 1.12,
      [RatioType.MiddleToShortest]: 1.1,
      [RatioType.LongestToMiddle]: 1.02,
    },
    minScore: 75,
    maxScore: 85,
    description: "良好情况：中间边略长，整体平衡",
  },
  {
    input: {
      [RatioType.LongestToShortest]: 1.18,
      [RatioType.MiddleToShortest]: 1.06,
      [RatioType.LongestToMiddle]: 1.11,
    },
    minScore: 80,
    maxScore: 90,
    description: "良好情况：最长边略长，其他边协调",
  },

  // ==================== 中等情况 ====================
  {
    input: {
      [RatioType.LongestToShortest]: 1.25,
      [RatioType.MiddleToShortest]: 1.15,
      [RatioType.LongestToMiddle]: 1.09,
    },
    minScore: 70,
    maxScore: 85,
    description: "中等情况：明显拉伸，比例尚可接受",
  },
  {
    input: {
      [RatioType.LongestToShortest]: 1.3,
      [RatioType.MiddleToShortest]: 1.1,
      [RatioType.LongestToMiddle]: 1.18,
    },
    minScore: 65,
    maxScore: 80,
    description: "中等情况：最长边明显，其他边适中",
  },
  {
    input: {
      [RatioType.LongestToShortest]: 1.28,
      [RatioType.MiddleToShortest]: 1.2,
      [RatioType.LongestToMiddle]: 1.07,
    },
    minScore: 65,
    maxScore: 80,
    description: "中等情况：中间边偏长，整体偏离",
  },

  // ==================== 较差情况 ====================
  {
    input: {
      [RatioType.LongestToShortest]: 1.4,
      [RatioType.MiddleToShortest]: 1.25,
      [RatioType.LongestToMiddle]: 1.12,
    },
    minScore: 50,
    maxScore: 70,
    description: "较差情况：严重拉伸，比例失衡",
  },
  {
    input: {
      [RatioType.LongestToShortest]: 1.45,
      [RatioType.MiddleToShortest]: 1.15,
      [RatioType.LongestToMiddle]: 1.26,
    },
    minScore: 48,
    maxScore: 68,
    description: "较差情况：最长边过长，比例不协调",
  },
  {
    input: {
      [RatioType.LongestToShortest]: 1.42,
      [RatioType.MiddleToShortest]: 1.3,
      [RatioType.LongestToMiddle]: 1.09,
    },
    minScore: 50,
    maxScore: 70,
    description: "较差情况：中间边过长，整体不平衡",
  },

  // ==================== 极端情况 ====================
  {
    input: {
      [RatioType.LongestToShortest]: 2.7,
      [RatioType.MiddleToShortest]: 2.1,
      [RatioType.LongestToMiddle]: 1.3,
    },
    minScore: 35,
    maxScore: 45,
    description: "极端情况：严重失衡，各边比例过大",
  },

  // ==================== 特殊边界情况 ====================
  {
    input: {
      [RatioType.LongestToShortest]: 1.1,
      [RatioType.MiddleToShortest]: 1.08,
      [RatioType.LongestToMiddle]: 1.02,
    },
    minScore: 75,
    maxScore: 85,
    description: "特殊情况：最长边适中，其他边接近",
  },

  // ==================== 组合测试情况 ====================
  {
    input: {
      [RatioType.LongestToShortest]: 1.2,
      [RatioType.MiddleToShortest]: 1.15,
      [RatioType.LongestToMiddle]: 1.04,
    },
    minScore: 75,
    maxScore: 85,
    description: "组合情况：各项指标均处于中间水平",
  },
];

/**
 * 长宽比优化器测试用例
 */
export const TEST_CASES = createTestCases<RatioInput, AspectRatioConfig>(
  TEST_CASES_DATA,
);
