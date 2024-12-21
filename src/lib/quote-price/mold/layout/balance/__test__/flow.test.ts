import { calculateFlowBalance } from "../flow";
import type { Cuboid } from "../types";
import { describe, it, expect } from "vitest";

describe("calculateFlowBalance", () => {
  // 标准立方体，用作基准
  const standardCuboid: Cuboid = {
    width: 100,
    height: 100,
    depth: 100,
    position: { x: 0, y: 0, z: 0 },
    weight: 1,
  };

  /**
   * 边界情况测试
   */
  describe("边界情况", () => {
    it("空列表应该返回0分", () => {
      const score = calculateFlowBalance([]);
      expect(score).toBe(0);
    });

    it("单个立方体应该返回100分", () => {
      const score = calculateFlowBalance([standardCuboid]);
      expect(score).toBe(100);
    });

    it("缺少位置信息应该抛出错误", () => {
      const cuboid = { ...standardCuboid };
      delete (cuboid as any).position;
      expect(() => calculateFlowBalance([cuboid])).toThrow();
    });
  });

  /**
   * 重心距离分布测试 (50%)
   */
  describe("重心距离分布", () => {
    it("对称布局应该得到高分", () => {
      // 2x2 对称布局
      const cuboids: Cuboid[] = [
        { ...standardCuboid, position: { x: 50, y: 50, z: 0 } },
        { ...standardCuboid, position: { x: 150, y: 50, z: 0 } },
        { ...standardCuboid, position: { x: 50, y: 150, z: 0 } },
        { ...standardCuboid, position: { x: 150, y: 150, z: 0 } },
      ];
      const score = calculateFlowBalance(cuboids);
      expect(score).toBeGreaterThan(90);
    });

    it("一字型布局应该得到较低分数", () => {
      // 水平排列的三个立方体
      const cuboids: Cuboid[] = [
        { ...standardCuboid, position: { x: 50, y: 100, z: 0 } },
        { ...standardCuboid, position: { x: 150, y: 100, z: 0 } },
        { ...standardCuboid, position: { x: 250, y: 100, z: 0 } },
      ];
      const score = calculateFlowBalance(cuboids);
      expect(score).toBeLessThan(60);
    });

    it("考虑权重的距离分布", () => {
      const cuboids: Cuboid[] = [
        { ...standardCuboid, position: { x: 0, y: 0, z: 0 }, weight: 1 },
        { ...standardCuboid, position: { x: 100, y: 0, z: 0 }, weight: 2 },
        { ...standardCuboid, position: { x: 200, y: 0, z: 0 }, weight: 1 },
      ];
      const score = calculateFlowBalance(cuboids);
      expect(score).toBeLessThan(85);
      expect(score).toBeGreaterThan(60);
    });
  });

  /**
   * 重心位置评分测试 (30%)
   */
  describe("重心位置评分", () => {
    it("重心在几何中心附近应该得高分", () => {
      const cuboids: Cuboid[] = [
        { ...standardCuboid, position: { x: -50, y: -50, z: 0 }, weight: 1 },
        { ...standardCuboid, position: { x: 50, y: -50, z: 0 }, weight: 1 },
        { ...standardCuboid, position: { x: 0, y: 50, z: 0 }, weight: 2 },
      ];
      const score = calculateFlowBalance(cuboids);
      expect(score).toBeGreaterThan(80);
    });

    it("重心严重偏离应该得低分", () => {
      const cuboids: Cuboid[] = [
        { ...standardCuboid, position: { x: 0, y: 0, z: 0 }, weight: 1 },
        { ...standardCuboid, position: { x: 100, y: 0, z: 0 }, weight: 2 },
        { ...standardCuboid, position: { x: 200, y: 0, z: 0 }, weight: 3 },
      ];
      const score = calculateFlowBalance(cuboids);
      expect(score).toBeLessThan(70);
    });

    it("重心轻微偏离应该得到中等分数", () => {
      const cuboids: Cuboid[] = [
        { ...standardCuboid, position: { x: 0, y: 0, z: 0 }, weight: 1 },
        { ...standardCuboid, position: { x: 50, y: 0, z: 0 }, weight: 1.2 },
        { ...standardCuboid, position: { x: 100, y: 0, z: 0 }, weight: 1 },
      ];
      const score = calculateFlowBalance(cuboids);
      expect(score).toBeLessThan(90);
      expect(score).toBeGreaterThan(75);
    });
  });

  /**
   * 力矩平衡测试 (20%)
   */
  describe("力矩平衡", () => {
    it("完全对称的力矩分布应该得高分", () => {
      const cuboids: Cuboid[] = [
        { ...standardCuboid, position: { x: -100, y: 0, z: 0 }, weight: 1 },
        { ...standardCuboid, position: { x: 0, y: 0, z: 0 }, weight: 1 },
        { ...standardCuboid, position: { x: 100, y: 0, z: 0 }, weight: 1 },
      ];
      const score = calculateFlowBalance(cuboids);
      expect(score).toBeGreaterThan(90);
    });

    it("力矩不平衡应该得低分", () => {
      const cuboids: Cuboid[] = [
        { ...standardCuboid, position: { x: 0, y: 0, z: 0 }, weight: 2 },
        { ...standardCuboid, position: { x: 100, y: 0, z: 0 }, weight: 2 },
        { ...standardCuboid, position: { x: -200, y: 0, z: 0 }, weight: 1 },
      ];
      const score = calculateFlowBalance(cuboids);
      expect(score).toBeLessThan(70);
    });

    it("三维力矩分布", () => {
      const cuboids: Cuboid[] = [
        { ...standardCuboid, position: { x: 0, y: 0, z: 0 }, weight: 1 },
        { ...standardCuboid, position: { x: 100, y: 100, z: 100 }, weight: 1 },
        {
          ...standardCuboid,
          position: { x: -100, y: -100, z: -100 },
          weight: 1,
        },
      ];
      const score = calculateFlowBalance(cuboids);
      expect(score).toBeGreaterThan(80);
    });
  });

  /**
   * 组合测试
   */
  describe("组合特性", () => {
    it("L型布局带权重应该得到中等分数", () => {
      const cuboids: Cuboid[] = [
        { ...standardCuboid, position: { x: 0, y: 0, z: 0 }, weight: 1 },
        { ...standardCuboid, position: { x: 100, y: 0, z: 0 }, weight: 1.5 },
        { ...standardCuboid, position: { x: 0, y: 100, z: 0 }, weight: 1.5 },
      ];
      const score = calculateFlowBalance(cuboids);
      expect(score).toBeLessThan(85);
      expect(score).toBeGreaterThan(60);
    });

    it("不规则三维分布带权重", () => {
      const cuboids: Cuboid[] = [
        { ...standardCuboid, position: { x: 0, y: 0, z: 0 }, weight: 1 },
        { ...standardCuboid, position: { x: 100, y: 50, z: 25 }, weight: 2 },
        { ...standardCuboid, position: { x: -50, y: -75, z: 50 }, weight: 1.5 },
      ];
      const score = calculateFlowBalance(cuboids);
      expect(score).toBeLessThan(80);
      expect(score).toBeGreaterThan(50);
    });

    it("极端不平衡布局", () => {
      const cuboids: Cuboid[] = [
        { ...standardCuboid, position: { x: 0, y: 0, z: 0 }, weight: 0.5 },
        { ...standardCuboid, position: { x: 200, y: 200, z: 200 }, weight: 3 },
      ];
      const score = calculateFlowBalance(cuboids);
      expect(score).toBeLessThan(50);
    });
  });
});
// bun test src/lib/quote-price/mold/layout/balance/__test__/flow.test.ts
