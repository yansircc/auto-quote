import type { DistanceTestSuite } from "../types";
import {
  createCuboid,
  calculatePhysicalProperties,
} from "../../physics/mechanics";

// 辅助函数：从立方体计算距离数组
function getDistancesFromCuboids(cuboids: ReturnType<typeof createCuboid>[]) {
  const result = calculatePhysicalProperties(cuboids);
  return {
    distances: result.distances,
    layoutSize: Math.sqrt(
      result.width * result.width + result.height * result.height,
    ),
  };
}

export const distanceTestCases: DistanceTestSuite = {
  description: "重心距离分布得分测试",
  cases: [
    // 基础测试用例
    {
      name: "空数组应该返回0分",
      input: (() => {
        const cuboids: ReturnType<typeof createCuboid>[] = [];
        return getDistancesFromCuboids(cuboids);
      })(),
      expect: {
        exact: 0,
      },
    },
    {
      name: "单个点应该返回100分",
      input: (() => {
        const cuboids = [createCuboid(0, 0, 0, 1)];
        return getDistancesFromCuboids(cuboids);
      })(),
      expect: {
        exact: 100,
      },
    },

    // 理想分布测试用例
    {
      name: "完全对称分布应该得到90分以上",
      input: (() => {
        const cuboids = [
          createCuboid(-10, -10, 0, 1),
          createCuboid(-10, 10, 0, 1),
          createCuboid(10, -10, 0, 1),
          createCuboid(10, 10, 0, 1),
        ];
        return getDistancesFromCuboids(cuboids);
      })(),
      expect: {
        min: 90,
        max: 100,
      },
    },
    {
      name: "近乎完美分布应该得到85分以上",
      input: (() => {
        const cuboids = [
          createCuboid(-5, -5, 0, 1),
          createCuboid(-5.1, 5, 0, 1),
          createCuboid(4.9, -5, 0, 1),
          createCuboid(5.05, 5, 0, 1),
        ];
        return getDistancesFromCuboids(cuboids);
      })(),
      expect: {
        min: 85,
        max: 95,
      },
    },

    // 轻微不均匀分布测试用例
    {
      name: "轻微不均匀分布（小集群）应该得到75分以上",
      input: (() => {
        const cuboids = [
          createCuboid(-8, -8, 0, 1),
          createCuboid(-7, 7, 0, 1),
          createCuboid(6, -6, 0, 1),
          createCuboid(9, 9, 0, 1),
        ];
        return getDistancesFromCuboids(cuboids);
      })(),
      expect: {
        min: 75,
        max: 85,
      },
    },
    {
      name: "轻微不均匀分布（三点集群）应该得到55分以上",
      input: (() => {
        const cuboids = [
          createCuboid(-8, -8, 0, 1),
          createCuboid(-7, -7.5, 0, 1),
          createCuboid(-7.2, -7.8, 0, 1),
          createCuboid(9, 9, 0, 1),
        ];
        return getDistancesFromCuboids(cuboids);
      })(),
      expect: {
        min: 55,
        max: 70,
      },
    },

    // 中等不均匀分布测试用例
    {
      name: "中等不均匀分布（分散集群）应该得到50分以上",
      input: (() => {
        const cuboids = [
          createCuboid(-15, -15, 0, 1),
          createCuboid(-5, 5, 0, 1),
          createCuboid(3, -3, 0, 1),
          createCuboid(12, 12, 0, 1),
        ];
        return getDistancesFromCuboids(cuboids);
      })(),
      expect: {
        min: 50,
        max: 65,
      },
    },
    {
      name: "中等不均匀分布（双集群）应该得到45分以上",
      input: {
        // 手动设置距离数组以确保中等程度的不均匀性
        // 两个点距离较近（10单位），两个点距离较远（30单位）
        // CV应该约0.35，Range应该约0.67
        distances: [30.0, 30.0, 10.0, 10.0],
        layoutSize: 35.0,
      },
      expect: {
        min: 45,
        max: 60,
      },
    },

    // 严重不均匀分布测试用例
    {
      name: "明显不均匀分布（双极化）应该得到25分以上",
      input: (() => {
        const cuboids = [
          createCuboid(-20, -20, 0, 1),
          createCuboid(-2, 2, 0, 1),
          createCuboid(1, -1, 0, 1),
          createCuboid(18, 18, 0, 1),
        ];
        return getDistancesFromCuboids(cuboids);
      })(),
      expect: {
        min: 25,
        max: 40,
      },
    },
    {
      name: "明显不均匀分布（紧密集群）应该得到20分以上",
      input: (() => {
        const cuboids = [
          createCuboid(-20, -20, 0, 1),
          createCuboid(0.5, 0, 0, 1),
          createCuboid(0, 0, 0, 1),
          createCuboid(18, 18, 0, 1),
        ];
        return getDistancesFromCuboids(cuboids);
      })(),
      expect: {
        min: 20,
        max: 35,
      },
    },

    // 极端不均匀分布测试用例
    {
      name: "极度不均匀分布（极端集群）应该得到15分以上",
      input: (() => {
        const cuboids = [
          createCuboid(-25, -25, 0, 1),
          createCuboid(-1, 1, 0, 1),
          createCuboid(0, 0, 0, 1),
          createCuboid(24, 24, 0, 1),
        ];
        return getDistancesFromCuboids(cuboids);
      })(),
      expect: {
        min: 15,
        max: 30,
      },
    },
    {
      name: "极度不均匀分布（三点重合）应该得到10分以上",
      input: {
        // 手动设置距离数组，确保完全重合
        distances: [35.0, 0.0, 0.0, 0.0],
        layoutSize: 35.0,
      },
      expect: {
        min: 10,
        max: 25,
      },
    },
  ],
};
