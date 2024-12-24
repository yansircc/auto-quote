import { createTestCases } from "@/lib/quote-price/mold/layout/balance/generic-optimizer";
import type { TestCaseBuilderOptions } from "@/lib/quote-price/mold/layout/balance/generic-optimizer";
import type { PositionInput, PositionConfig } from "../core/types";

/**
 * 距离优化器测试用例数据
 */
export const TEST_CASES_DATA: TestCaseBuilderOptions<PositionInput>[] = [
  // 理想情况：完全居中
  {
    input: {
      deviation: 0,
      height: 0,
      layoutSize: 100,
    },
    minScore: 90,
    maxScore: 100,
    description: "理想情况：零偏离，最低重心",
  },

  // 小偏离，低重心
  {
    input: {
      deviation: 5,
      height: 0.1,
      layoutSize: 100,
    },
    minScore: 85,
    maxScore: 95,
    description: "良好情况：轻微偏离，较低重心",
  },

  // 中等偏离，中等重心
  {
    input: {
      deviation: 15,
      height: 0.3,
      layoutSize: 100,
    },
    minScore: 70,
    maxScore: 85,
    description: "中等情况：中等偏离，中等重心",
  },

  // 大偏离，高重心
  {
    input: {
      deviation: 25,
      height: 0.6,
      layoutSize: 100,
    },
    minScore: 50,
    maxScore: 70,
    description: "较差情况：明显偏离，较高重心",
  },

  // 极端情况：严重偏离
  {
    input: {
      deviation: 40,
      height: 0.8,
      layoutSize: 100,
    },
    minScore: 35,
    maxScore: 45,
    description: "极端情况：严重偏离，高重心",
  },

  // 小布局尺寸测试
  {
    input: {
      deviation: 2,
      height: 0.1,
      layoutSize: 20,
    },
    minScore: 85,
    maxScore: 90,
    description: "相对偏离，低重心，小布局尺寸",
  },

  // 大布局尺寸测试
  {
    input: {
      deviation: 40,
      height: 0.2,
      layoutSize: 400,
    },
    minScore: 85,
    maxScore: 90,
    description: "相对偏离，低重心，大布局尺寸",
  },

  // 边界测试：零尺寸布局
  {
    input: {
      deviation: 0,
      height: 0.1,
      layoutSize: 0,
    },
    minScore: 90,
    maxScore: 100,
    description: "边界测试：单点布局",
  },

  // 特殊情况：低偏离但高重心
  {
    input: {
      deviation: 5,
      height: 0.5,
      layoutSize: 100,
    },
    minScore: 65,
    maxScore: 80,
    description: "特殊情况：轻微偏离但重心较高",
  },

  // 特殊情况：高偏离但低重心
  {
    input: {
      deviation: 25,
      height: 0.1,
      layoutSize: 100,
    },
    minScore: 65,
    maxScore: 80,
    description: "特殊情况：明显偏离但重心较低",
  },

  // 中等布局，完美重心但轻微偏离
  {
    input: {
      deviation: 8,
      height: 0.05,
      layoutSize: 200,
    },
    minScore: 85,
    maxScore: 95,
    description: "良好情况：轻微偏离，接近完美重心",
  },

  // 中等布局，完美偏离但稍高重心
  {
    input: {
      deviation: 3,
      height: 0.2,
      layoutSize: 200,
    },
    minScore: 80,
    maxScore: 90,
    description: "良好情况：接近完美偏离，稍高重心",
  },

  // 大布局，中等表现
  {
    input: {
      deviation: 12,
      height: 0.25,
      layoutSize: 300,
    },
    minScore: 75,
    maxScore: 85,
    description: "中等情况：中等偏离和重心，大布局",
  },

  // 小布局，中等表现
  {
    input: {
      deviation: 10,
      height: 0.3,
      layoutSize: 50,
    },
    minScore: 75,
    maxScore: 85,
    description: "中等情况：中等偏离和重心，小布局",
  },

  // 边界测试：极小偏离，中等重心
  {
    input: {
      deviation: 2,
      height: 0.3,
      layoutSize: 100,
    },
    minScore: 75,
    maxScore: 85,
    description: "边界测试：极小偏离，中等重心",
  },

  // 边界测试：极大偏离，极低重心
  {
    input: {
      deviation: 35,
      height: 0.05,
      layoutSize: 100,
    },
    minScore: 60,
    maxScore: 75,
    description: "边界测试：极大偏离，极低重心",
  },
];

/**
 * 距离优化器测试用例
 */
export const TEST_CASES = createTestCases<PositionInput, PositionConfig>(
  TEST_CASES_DATA,
);
