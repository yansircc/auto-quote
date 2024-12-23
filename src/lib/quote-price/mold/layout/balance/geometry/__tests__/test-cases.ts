import type { BaseCuboid as Cuboid } from "../../types";

/**
 * 测试用例的接口
 */
export interface BalanceTestCase {
  name: string;
  cuboids: Cuboid[];
  expectedMin?: number; // 期望最小分
  expectedMax?: number; // 期望最大分
  description?: string; // 可选：额外说明
}

// 有代表性的测试用例
export const TEST_CASES: BalanceTestCase[] = [
  // 1. 基础边界情况
  {
    name: "空列表应该返回0分",
    cuboids: [],
    expectedMin: 0,
    expectedMax: 0,
    description: "空集合时，无几何概念 => 0分",
  },
  {
    name: "单个立方体应该返回100分",
    cuboids: [{ width: 10, height: 10, depth: 10 }],
    expectedMin: 100,
    expectedMax: 100,
    description: "单个立方体，完美情况",
  },

  // 2. 体积平衡性测试
  {
    name: "完全相同体积应该得到高分",
    cuboids: [
      { width: 10, height: 10, depth: 10 },
      { width: 10, height: 10, depth: 10 },
      { width: 10, height: 10, depth: 10 },
    ],
    expectedMin: 90,
    description: "多个立方体同体积，期望得分 > 90",
  },
  {
    name: "体积差异中等",
    cuboids: [
      { width: 10, height: 10, depth: 10 },
      { width: 8, height: 8, depth: 8 },
      { width: 12, height: 12, depth: 12 },
    ],
    expectedMin: 70,
    expectedMax: 85,
    description: "体积比例在0.5-0.8之间，期望得分在70-85之间",
  },
  {
    name: "体积差异显著",
    cuboids: [
      { width: 20, height: 20, depth: 20 },
      { width: 5, height: 5, depth: 5 },
    ],
    expectedMax: 50,
    description: "体积比例约0.125，期望得分 < 50",
  },

  // 3. 长宽比测试
  {
    name: "理想长宽比",
    cuboids: [
      { width: 10, height: 12, depth: 15 },
      { width: 12, height: 15, depth: 10 },
    ],
    expectedMin: 85,
    description: "所有比例都在1.5左右，期望得分 > 85",
  },
  {
    name: "不理想长宽比",
    cuboids: [
      { width: 30, height: 5, depth: 5 },
      { width: 5, height: 25, depth: 5 },
    ],
    expectedMax: 60,
    description: "存在6:1的比例，期望得分 < 60",
  },

  // 4. 形状相似度测试
  {
    name: "高相似度形状",
    cuboids: [
      { width: 10, height: 12, depth: 15 },
      { width: 20, height: 24, depth: 30 },
    ],
    expectedMax: 60,
    description: "相似形状但尺寸差异大，期望得分 < 60",
  },
  {
    name: "中等相似度形状",
    cuboids: [
      { width: 10, height: 10, depth: 10 },
      { width: 12, height: 12, depth: 12 },
      { width: 15, height: 15, depth: 15 },
    ],
    expectedMin: 70,
    expectedMax: 90,
    description: "形状有一定差异，期望得分在70-90之间",
  },
  {
    name: "低相似度形状",
    cuboids: [
      { width: 20, height: 5, depth: 5 },
      { width: 5, height: 20, depth: 5 },
    ],
    expectedMax: 60,
    description: "形状差异显著，期望得分 < 60",
  },

  // 5. 维度一致性测试
  {
    name: "高维度一致性",
    cuboids: [
      { width: 10, height: 15, depth: 20 },
      { width: 11, height: 14, depth: 19 },
      { width: 9, height: 16, depth: 21 },
    ],
    expectedMin: 85,
    description: "各维度变化系数小，期望得分 > 85",
  },
  {
    name: "中等维度一致性",
    cuboids: [
      { width: 10, height: 15, depth: 20 },
      { width: 8, height: 18, depth: 16 },
      { width: 12, height: 12, depth: 24 },
    ],
    expectedMin: 70,
    expectedMax: 85,
    description: "各维度变化系数中等，期望得分在70-85之间",
  },
  {
    name: "低维度一致性",
    cuboids: [
      { width: 5, height: 25, depth: 10 },
      { width: 20, height: 5, depth: 15 },
      { width: 10, height: 15, depth: 5 },
    ],
    expectedMax: 60,
    description: "各维度变化系数大，期望得分 < 60",
  },

  // 6. 复合场景测试
  {
    name: "综合表现优秀",
    cuboids: [
      { width: 10, height: 12, depth: 15 },
      { width: 11, height: 13, depth: 16 },
      { width: 9, height: 11, depth: 14 },
    ],
    expectedMin: 90,
    description: "体积接近、形状相似、维度一致性高，期望得分 > 90",
  },
  {
    name: "综合表现中等",
    cuboids: [
      { width: 10, height: 12, depth: 15 },
      { width: 8, height: 14, depth: 12 },
      { width: 15, height: 10, depth: 18 },
    ],
    expectedMin: 70,
    expectedMax: 85,
    description: "各方面表现中等，期望得分在70-85之间",
  },
  {
    name: "综合表现差",
    cuboids: [
      { width: 30, height: 5, depth: 5 },
      { width: 5, height: 25, depth: 5 },
      { width: 10, height: 10, depth: 20 },
    ],
    expectedMax: 50,
    description: "体积差异大、形状不一、维度不一致，期望得分 < 50",
  },

  // 7. 极端情况测试
  {
    name: "单维度极度不平衡",
    cuboids: [
      { width: 100, height: 10, depth: 10 },
      { width: 10, height: 10, depth: 10 },
    ],
    expectedMax: 30,
    description: "单个维度存在10倍差异，期望得分 < 30",
  },
  {
    name: "所有维度都极度不平衡",
    cuboids: [
      { width: 100, height: 5, depth: 2 },
      { width: 2, height: 100, depth: 5 },
    ],
    expectedMax: 40,
    description: "所有维度都存在巨大差异，期望得分 < 40",
  },
];
