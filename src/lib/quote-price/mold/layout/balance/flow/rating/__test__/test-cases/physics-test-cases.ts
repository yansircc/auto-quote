import type { TestSuite } from "../types";
import { createCuboid } from "../../physics";

// 辅助函数：计算布局尺寸
function calculateLayoutSize(cuboids: ReturnType<typeof createCuboid>[]) {
  const maxX = Math.max(...cuboids.map((c) => Math.abs(c.position.x)));
  const maxY = Math.max(...cuboids.map((c) => Math.abs(c.position.y)));
  return Math.sqrt(maxX * maxX + maxY * maxY);
}

export const physicsTestCases: TestSuite = {
  description: "物理平衡测试用例",
  cases: [
    // 基本情况
    {
      name: "单个长方体",
      input: (() => {
        const cuboids = [createCuboid(0, 0, 0, 1)];
        return {
          distances: [0],
          deviation: 0,
          height: 0,
          momentums: [0],
          layoutSize: calculateLayoutSize(cuboids),
        };
      })(),
      expect: {
        min: 90,
      },
    },

    // 两个长方体的情况
    {
      name: "两个相同重量的长方体 - 完全对称",
      input: (() => {
        const cuboids = [createCuboid(-5, 0, 0, 1), createCuboid(5, 0, 0, 1)];
        return {
          distances: [5, 5],
          deviation: 0,
          height: 0,
          momentums: [0, 0],
          layoutSize: calculateLayoutSize(cuboids),
        };
      })(),
      expect: {
        min: 85,
      },
    },
    {
      name: "两个不同重量的长方体 - 非对称",
      input: (() => {
        const cuboids = [
          createCuboid(-2.5, 0, 0, 1),
          createCuboid(7.5, 0, 0, 3), // 更重的盒子
        ];
        return {
          distances: [2.5, 7.5],
          deviation: 0.5,
          height: 0,
          momentums: [25, 75],
          layoutSize: calculateLayoutSize(cuboids),
        };
      })(),
      expect: {
        min: 45,
        max: 65,
      },
    },
    {
      name: "两个长方体 - 有高度差",
      input: (() => {
        const cuboids = [
          createCuboid(-5, 0, 0, 1),
          createCuboid(5, 0, 0.3, 1), // 有高度差的盒子
        ];
        return {
          distances: [5, 5],
          deviation: 0,
          height: 0.3,
          momentums: [0, 0],
          layoutSize: calculateLayoutSize(cuboids),
        };
      })(),
      expect: {
        min: 90,
      },
    },

    // 三个长方体的情况
    {
      name: "三个相同重量的长方体 - 完全对称",
      input: (() => {
        const cuboids = [
          createCuboid(-5, 0, 0, 1),
          createCuboid(0, 0, 0, 1),
          createCuboid(5, 0, 0, 1),
        ];
        return {
          distances: [5, 0, 5],
          deviation: 0,
          height: 0,
          momentums: [0, 0, 0],
          layoutSize: calculateLayoutSize(cuboids),
        };
      })(),
      expect: {
        min: 85,
      },
    },
    {
      name: "三个不同重量的长方体 - 非对称",
      input: (() => {
        const cuboids = [
          createCuboid(-3, 0, 0.2, 3),
          createCuboid(0, 0, 0.2, 5),
          createCuboid(7, 0, 0.2, 7),
        ];
        return {
          distances: [3, 0, 7],
          deviation: 0.3,
          height: 0.2,
          momentums: [30, 50, 70],
          layoutSize: calculateLayoutSize(cuboids),
        };
      })(),
      expect: {
        min: 55,
        max: 75,
      },
    },

    // 四个长方体的情况
    {
      name: "四个长方体 - 正方形",
      input: (() => {
        const cuboids = [
          createCuboid(-7.07, -7.07, 0, 1),
          createCuboid(7.07, -7.07, 0, 1),
          createCuboid(-7.07, 7.07, 0, 1),
          createCuboid(7.07, 7.07, 0, 1),
        ];
        return {
          distances: [7.07, 7.07, 7.07, 7.07],
          deviation: 0,
          height: 0,
          momentums: [0, 0, 0, 0],
          layoutSize: calculateLayoutSize(cuboids),
        };
      })(),
      expect: {
        min: 85,
      },
    },
    {
      name: "四个长方体 - 长方形",
      input: (() => {
        const cuboids = [
          createCuboid(-5, -5, 0, 1),
          createCuboid(5, -5, 0, 1),
          createCuboid(-5, 5, 0, 1),
          createCuboid(5, 5, 0, 1),
        ];
        return {
          distances: [5, 5, 8, 8],
          deviation: 0.1,
          height: 0,
          momentums: [10, 10, 15, 15],
          layoutSize: calculateLayoutSize(cuboids),
        };
      })(),
      expect: {
        min: 75,
        max: 85,
      },
    },

    // 边界情况
    {
      name: "边界情况 - 极大偏离",
      input: (() => {
        const cuboids = [createCuboid(-1, 0, 0, 1), createCuboid(10, 0, 0, 1)];
        return {
          distances: [1, 10],
          deviation: 0.9,
          height: 0,
          momentums: [10, 100],
          layoutSize: calculateLayoutSize(cuboids),
        };
      })(),
      expect: {
        max: 40,
      },
    },
    {
      name: "边界情况 - 极大高度差",
      input: (() => {
        const cuboids = [createCuboid(-5, 0, 0, 1), createCuboid(5, 0, 0.9, 1)];
        return {
          distances: [5, 5],
          deviation: 0,
          height: 0.9,
          momentums: [0, 0],
          layoutSize: calculateLayoutSize(cuboids),
        };
      })(),
      expect: {
        min: 75,
        max: 85,
      },
    },

    // 极端情况
    {
      name: "极端情况 - 所有指标都很差",
      input: (() => {
        const cuboids = [
          createCuboid(-1, 0, 0.9, 1),
          createCuboid(5, 0, 0.9, 3),
          createCuboid(10, 0, 0.9, 5),
        ];
        return {
          distances: [1, 5, 10],
          deviation: 0.9,
          height: 0.9,
          momentums: [10, 50, 100],
          layoutSize: calculateLayoutSize(cuboids),
        };
      })(),
      expect: {
        max: 30,
      },
    },
    {
      name: "极端情况 - 所有指标都很好",
      input: (() => {
        const cuboids = [
          createCuboid(-5, -5, 0, 1),
          createCuboid(5, -5, 0, 1),
          createCuboid(-5, 5, 0, 1),
          createCuboid(5, 5, 0, 1),
        ];
        return {
          distances: [5, 5, 5, 5],
          deviation: 0,
          height: 0,
          momentums: [0, 0, 0, 0],
          layoutSize: calculateLayoutSize(cuboids),
        };
      })(),
      expect: {
        min: 95,
      },
    },

    // 特殊的力矩分布
    {
      name: "力矩分布 - 对称但较大",
      input: (() => {
        const cuboids = [createCuboid(-5, 0, 0, 1), createCuboid(5, 0, 0, 1)];
        return {
          distances: [5, 5],
          deviation: 0,
          height: 0,
          momentums: [50, 50],
          layoutSize: calculateLayoutSize(cuboids),
        };
      })(),
      expect: {
        min: 90,
      },
    },
    {
      name: "力矩分布 - 渐进式增长",
      input: (() => {
        const cuboids = [
          createCuboid(-2, 0, 0, 1),
          createCuboid(-4, 0, 0, 2),
          createCuboid(-6, 0, 0, 3),
          createCuboid(-8, 0, 0, 4),
        ];
        return {
          distances: [2, 4, 6, 8],
          deviation: 0.2,
          height: 0.1,
          momentums: [20, 40, 60, 80],
          layoutSize: calculateLayoutSize(cuboids),
        };
      })(),
      expect: {
        min: 50,
        max: 65,
      },
    },

    // 复杂情况
    {
      name: "复杂情况 - 多点不规则分布",
      input: (() => {
        const cuboids = [
          createCuboid(-3, 0, 0.3, 3),
          createCuboid(-4, 0, 0.3, 4),
          createCuboid(-5, 0, 0.3, 5),
          createCuboid(-6, 0, 0.3, 6),
          createCuboid(-7, 0, 0.3, 7),
        ];
        return {
          distances: [3, 4, 5, 6, 7],
          deviation: 0.4,
          height: 0.3,
          momentums: [30, 40, 50, 60, 70],
          layoutSize: calculateLayoutSize(cuboids),
        };
      })(),
      expect: {
        min: 50,
        max: 70,
      },
    },
    {
      name: "复杂情况 - 大小交替",
      input: (() => {
        const cuboids = [
          createCuboid(-3, 0, 0.2, 3),
          createCuboid(-6, 0, 0.2, 6),
          createCuboid(-3, 0, 0.2, 3),
          createCuboid(-6, 0, 0.2, 6),
          createCuboid(-3, 0, 0.2, 3),
          createCuboid(-6, 0, 0.2, 6),
        ];
        return {
          distances: [3, 6, 3, 6, 3, 6],
          deviation: 0.2,
          height: 0.2,
          momentums: [30, 60, 30, 60, 30, 60],
          layoutSize: calculateLayoutSize(cuboids),
        };
      })(),
      expect: {
        min: 55,
        max: 75,
      },
    },
  ],
};
