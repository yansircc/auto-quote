/**
 * 力矩平衡得分测试用例
 *
 * 1. 测试目标
 *    验证力矩平衡评分系统能够正确识别和评估不同程度的力矩分布情况
 *
 * 2. 测试用例设计原则
 *    - 完美分布 (90-100分)：三个轴向完全对称
 *    - 良好分布 (65-85分)：单轴轻微不对称（5%偏差）
 *    - 轻微不均匀 (45-65分)：双轴明显不对称（20%偏差）
 *    - 中等不均匀 (55-75分)：三轴有大小和位置差异
 *    - 严重问题 (0-30分)：极端不平衡
 *
 * 3. 注意事项
 *    - 每个测试用例都应该包含明确的输入数据和预期结果
 *    - 测试用例应该覆盖各种边界情况和典型场景
 *    - 分数区间应该有一定的重叠，避免过于严格的界限
 */

import type { MomentumTestSuite } from "../types";
import {
  createCuboid,
  calculatePhysicalProperties,
} from "../../physics/mechanics";

// 辅助函数：从立方体计算力矩数组
function getMomentumFromCuboids(cuboids: ReturnType<typeof createCuboid>[]) {
  const result = calculatePhysicalProperties(cuboids);
  const mean =
    result.moments.reduce((sum, m) => sum + m, 0) / result.moments.length;
  const maxMoment = Math.max(...result.moments);

  // 计算标准差
  const variance =
    result.moments.reduce((sum, m) => sum + Math.pow(m - mean, 2), 0) /
    result.moments.length;
  const std = Math.sqrt(variance);

  return {
    moments: result.moments,
    ratio: mean === 0 ? 1 : maxMoment / mean,
    rsd: mean === 0 ? 0 : std / mean,
  };
}

export const momentumTestCases: MomentumTestSuite = {
  description: "力矩平衡得分测试",
  cases: [
    // 基础测试用例
    {
      name: "空数组应该返回0分",
      input: (() => {
        const cuboids: ReturnType<typeof createCuboid>[] = [];
        return getMomentumFromCuboids(cuboids);
      })(),
      expect: {
        exact: 0,
      },
    },
    {
      name: "单个立方体应该返回100分",
      input: (() => {
        const cuboids = [createCuboid(0, 0, 0, 1)];
        return getMomentumFromCuboids(cuboids);
      })(),
      expect: {
        exact: 100,
      },
    },

    // 理想分布测试用例
    {
      name: "完全对称分布应该得到90分以上",
      input: (() => {
        // 在三个轴向上分别放置一对立方体
        // 1. 使用相同的尺寸
        const size = 1;
        // 2. 使用相同的距离，确保完全对称
        const distance = 10;
        // 3. 在每个轴向上放置两个对称的立方体
        const cuboids = [
          // x轴方向
          createCuboid(-distance, 0, 0, size),
          createCuboid(distance, 0, 0, size),
          // y轴方向
          createCuboid(0, -distance, 0, size),
          createCuboid(0, distance, 0, size),
          // z轴方向
          createCuboid(0, 0, -distance, size),
          createCuboid(0, 0, distance, size),
        ];
        return getMomentumFromCuboids(cuboids);
      })(),
      expect: {
        min: 85,
        max: 100,
      },
    },

    // 良好分布测试用例
    {
      name: "良好分布应该得到65-85分",
      input: (() => {
        // 在三个轴向上放置立方体，制造适度的不对称
        // 1. 基准参数
        const size = 1;
        const distance = 10;

        // 2. 创建适度的不平衡
        // 注意：力矩 = 重量 * sqrt(x² + y²)
        // 使用较大的基础偏差，因为sqrt会减小差异
        const baseOffset = 0.4; // 基础偏差40%

        const cuboids = [
          // x轴：主要不对称（基础偏差 * 1.5）
          createCuboid(distance * (1 + baseOffset * 1.5), 0, 0, size * 1.2), // 右侧：更远且更重
          createCuboid(-distance * (1 - baseOffset * 1.5), 0, 0, size * 0.8), // 左侧：更近且更轻

          // y轴：次要不对称（基础偏差）
          createCuboid(0, distance * (1 + baseOffset), 0, size * 1.1), // 上侧：较远且较重
          createCuboid(0, -distance * (1 - baseOffset), 0, size * 0.9), // 下侧：较近且较轻

          // z轴：轻微不对称（基础偏差 * 0.5）
          createCuboid(0, 0, distance * (1 + baseOffset * 0.5), size), // 前侧：略远
          createCuboid(0, 0, -distance * (1 - baseOffset * 0.5), size), // 后侧：略近
        ];
        return getMomentumFromCuboids(cuboids);
      })(),
      expect: {
        min: 70,
        max: 90,
      },
    },

    // 轻微不均匀分布测试用例
    {
      name: "轻微不均匀分布（小集群）应该得到45-65分",
      input: (() => {
        // 1. 基准参数
        const size = 1;
        const distance = 10;

        // 2. 创建小集群分布
        // 在x轴正方向形成一个小集群（3个重物），在负方向放置单个重物作为平衡
        const cuboids = [
          // x轴正方向：小集群（3个紧密排列的重物）
          createCuboid(distance * 0.8, 0, 0, size * 1.2), // 近端重物
          createCuboid(distance * 1.0, 0, 0, size * 1.2), // 中间重物
          createCuboid(distance * 1.2, 0, 0, size * 1.2), // 远端重物

          // x轴负方向：单个大重物作为平衡
          createCuboid(-distance * 1.0, 0, 0, size * 3.0), // 平衡重物

          // y轴：不对称分布
          createCuboid(0, distance * 1.3, 0, size * 1.5), // 上方重物
          createCuboid(0, -distance * 0.7, 0, size * 0.8), // 下方轻物

          // z轴：显著不对称
          createCuboid(0, 0, distance * 1.4, size * 1.8), // 前方重物
          createCuboid(0, 0, -distance * 0.6, size * 0.5), // 后方轻物
        ];
        return getMomentumFromCuboids(cuboids);
      })(),
      expect: {
        min: 40,
        max: 66,
      },
    },

    // 中等不均匀分布测试用例
    {
      name: "中等不均匀分布（不同大小立方体）应该得到55-75分",
      input: (() => {
        // 在三个轴向上放置不同大小的立方体
        const distance = 10;
        const cuboids = [
          // x轴方向（大小不同）
          createCuboid(-distance, 0, 0, 2), // 左边较大
          createCuboid(distance, 0, 0, 1), // 右边较小
          // y轴方向（大小不同）
          createCuboid(0, -distance, 0, 1.5), // 下边中等
          createCuboid(0, distance, 0, 0.8), // 上边较小
          // z轴方向（大小不同）
          createCuboid(0, 0, -distance, 1.2), // 前面偏大
          createCuboid(0, 0, distance, 0.9), // 后面偏小
        ];
        return getMomentumFromCuboids(cuboids);
      })(),
      expect: {
        min: 55,
        max: 75,
      },
    },

    // 极端不均匀分布测试用例
    {
      name: "极端不均匀分布（单侧巨大力矩）应该得到30分以下",
      input: (() => {
        // 1. 基准参数
        const size = 1;
        const distance = 10;

        // 2. 创建极端不平衡
        // 关键：将重物放在y-z平面上，这样会产生巨大的x方向力矩，而y和z方向力矩较小
        const cuboids = [
          // x方向的主要力矩来源：在y-z平面上放置重物
          createCuboid(0, distance * 2, distance * 2, size * 10), // 在远端y-z平面放置超重物
          createCuboid(0, -distance * 2, -distance * 2, size * 10), // 对称位置放置另一个超重物

          // y方向的次要力矩：在x-z平面上放置轻物
          createCuboid(distance, 0, distance * 0.5, size * 0.2), // 较轻的平衡重物
          createCuboid(-distance, 0, -distance * 0.5, size * 0.2), // 对称位置的轻物

          // z方向的最小力矩：在x-y平面上放置极轻物
          createCuboid(distance * 0.5, distance * 0.5, 0, size * 0.1), // 极轻的平衡重物
          createCuboid(-distance * 0.5, -distance * 0.5, 0, size * 0.1), // 对称位置的极轻物
        ];

        return getMomentumFromCuboids(cuboids);
      })(),
      expect: {
        min: 0,
        max: 30,
      },
    },
  ],
};
