import { createTestCases } from "@/lib/quote-price/mold/layout/balance/generic-optimizer";
import type { TestCaseBuilderOptions } from "@/lib/quote-price/mold/layout/balance/generic-optimizer";
import type { SpaceInput, SpaceConfig } from "../core/types";
import { SpaceMetric } from "../core/types";

/**
 * 空间利用率优化器测试用例数据
 */
export const TEST_CASES_DATA: TestCaseBuilderOptions<SpaceInput>[] = [
  // ==================== 理想/完美情况 ====================
  {
    input: {
      [SpaceMetric.VolumeRatio]: 0.98,
      [SpaceMetric.AspectRatio]: 1.05,
    },
    minScore: 90,
    maxScore: 100,
    description: "理想情况：极高空间利用率，近乎完美的长宽高比",
  },
  {
    input: {
      [SpaceMetric.VolumeRatio]: 0.92,
      [SpaceMetric.AspectRatio]: 1.08,
    },
    minScore: 90,
    maxScore: 98,
    description: "理想情况：很高空间利用率，非常好的长宽高比",
  },

  // ==================== 良好情况 ====================
  {
    input: {
      [SpaceMetric.VolumeRatio]: 0.85,
      [SpaceMetric.AspectRatio]: 1.15,
    },
    minScore: 85,
    maxScore: 95,
    description: "良好情况：良好空间利用率，较好的长宽高比",
  },
  {
    input: {
      [SpaceMetric.VolumeRatio]: 0.82,
      [SpaceMetric.AspectRatio]: 1.2,
    },
    minScore: 82,
    maxScore: 92,
    description: "良好情况：较好空间利用率，可接受的长宽高比",
  },

  // ==================== 中等情况 ====================
  {
    input: {
      [SpaceMetric.VolumeRatio]: 0.75,
      [SpaceMetric.AspectRatio]: 1.35,
    },
    minScore: 75,
    maxScore: 85,
    description: "中等情况：中等空间利用率，轻微不均衡的长宽高比",
  },
  {
    input: {
      [SpaceMetric.VolumeRatio]: 0.7,
      [SpaceMetric.AspectRatio]: 1.5,
    },
    minScore: 70,
    maxScore: 80,
    description: "中等情况：一般空间利用率，明显不均衡的长宽高比",
  },

  // ==================== 较差情况 ====================
  {
    input: {
      [SpaceMetric.VolumeRatio]: 0.6,
      [SpaceMetric.AspectRatio]: 1.8,
    },
    minScore: 50,
    maxScore: 65,
    description: "较差情况：较低空间利用率，严重不均衡的长宽高比",
  },
  {
    input: {
      [SpaceMetric.VolumeRatio]: 0.5,
      [SpaceMetric.AspectRatio]: 2.0,
    },
    minScore: 40,
    maxScore: 55,
    description: "较差情况：低空间利用率，极度不均衡的长宽高比",
  },

  // ==================== 特殊情况 ====================
  {
    input: {
      [SpaceMetric.VolumeRatio]: 0.9,
      [SpaceMetric.AspectRatio]: 1.8,
    },
    minScore: 65,
    maxScore: 80,
    description: "特殊情况：很高空间利用率但长宽高比不均衡",
  },
  {
    input: {
      [SpaceMetric.VolumeRatio]: 0.55,
      [SpaceMetric.AspectRatio]: 1.1,
    },
    minScore: 60,
    maxScore: 75,
    description: "特殊情况：较低空间利用率但长宽高比很好",
  },

  // ==================== 组合测试情况 ====================
  {
    input: {
      [SpaceMetric.VolumeRatio]: 0.7,
      [SpaceMetric.AspectRatio]: 1.5,
    },
    minScore: 70,
    maxScore: 85,
    description: "组合情况：各项指标均处于中等水平",
  },
  {
    input: {
      [SpaceMetric.VolumeRatio]: 0.8,
      [SpaceMetric.AspectRatio]: 1.3,
    },
    minScore: 75,
    maxScore: 90,
    description: "组合情况：较好的空间利用率和长宽高比",
  },
];

/**
 * 空间利用率优化器测试用例
 */
export const TEST_CASES = createTestCases<SpaceInput, SpaceConfig>(
  TEST_CASES_DATA,
);
