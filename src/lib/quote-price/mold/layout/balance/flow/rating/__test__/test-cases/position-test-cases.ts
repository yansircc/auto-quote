import type { PositionTestSuite } from "../types";
import { createCuboid } from "../../physics/mechanics";

// 辅助函数：计算布局尺寸
function calculateLayoutSize(cuboids: ReturnType<typeof createCuboid>[]) {
  const maxX = Math.max(...cuboids.map((c) => Math.abs(c.position.x)));
  const maxY = Math.max(...cuboids.map((c) => Math.abs(c.position.y)));
  return Math.sqrt(maxX * maxX + maxY * maxY);
}

export const positionTestCases: PositionTestSuite = {
  description: "重心位置得分测试",
  cases: [
    {
      name: "完全居中且重心最低",
      input: (() => {
        const cuboids = [createCuboid(0, 0, 0, 1)];
        return {
          deviation: 0,
          height: 0,
          layoutSize: calculateLayoutSize(cuboids),
        };
      })(),
      expect: {
        exact: 100,
      },
    },
    {
      name: "轻微偏离且重心较低",
      input: (() => {
        const cuboids = [createCuboid(0.3, 0, 0.15, 1)];
        return {
          deviation: 0.03,
          height: 0.15,
          layoutSize: calculateLayoutSize(cuboids),
        };
      })(),
      expect: {
        min: 85,
        max: 100,
      },
    },
    {
      name: "基本居中但重心稍高",
      input: (() => {
        const cuboids = [createCuboid(0.5, 0, 0.25, 1)];
        return {
          deviation: 0.05,
          height: 0.25,
          layoutSize: calculateLayoutSize(cuboids),
        };
      })(),
      expect: {
        min: 85,
        max: 95,
      },
    },
    {
      name: "中等偏离但重心较低",
      input: (() => {
        const cuboids = [createCuboid(1.5, 0, 0.2, 1)];
        return {
          deviation: 0.15,
          height: 0.2,
          layoutSize: calculateLayoutSize(cuboids),
        };
      })(),
      expect: {
        min: 75,
        max: 90,
      },
    },
    {
      name: "轻微偏离但重心较高",
      input: (() => {
        const cuboids = [createCuboid(0.5, 0, 0.4, 1)];
        return {
          deviation: 0.05,
          height: 0.4,
          layoutSize: calculateLayoutSize(cuboids),
        };
      })(),
      expect: {
        min: 70,
        max: 85,
      },
    },
    {
      name: "明显偏离或重心较高",
      input: (() => {
        const cuboids = [createCuboid(2.5, 0, 0.4, 1)];
        return {
          deviation: 0.25,
          height: 0.4,
          layoutSize: calculateLayoutSize(cuboids),
        };
      })(),
      expect: {
        min: 60,
        max: 75,
      },
    },
    {
      name: "严重偏离或重心很高",
      input: (() => {
        const cuboids = [createCuboid(3, 0, 0.5, 1)];
        return {
          deviation: 0.3,
          height: 0.5,
          layoutSize: calculateLayoutSize(cuboids),
        };
      })(),
      expect: {
        min: 60,
        max: 80,
      },
    },
    {
      name: "极度偏离",
      input: (() => {
        const cuboids = [createCuboid(4, 0, 0.4, 1)];
        return {
          deviation: 0.4,
          height: 0.4,
          layoutSize: calculateLayoutSize(cuboids),
        };
      })(),
      expect: {
        min: 60,
        max: 75,
      },
    },
    {
      name: "重心极高",
      input: (() => {
        const cuboids = [createCuboid(2, 0, 0.7, 1)];
        return {
          deviation: 0.2,
          height: 0.7,
          layoutSize: calculateLayoutSize(cuboids),
        };
      })(),
      expect: {
        max: 45,
      },
    },
    {
      name: "既严重偏离又重心很高",
      input: (() => {
        const cuboids = [createCuboid(4, 0, 0.7, 1)];
        return {
          deviation: 0.4,
          height: 0.7,
          layoutSize: calculateLayoutSize(cuboids),
        };
      })(),
      expect: {
        max: 40,
      },
    },
  ],
};
