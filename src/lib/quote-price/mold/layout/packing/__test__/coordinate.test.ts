import { describe, it, expect } from "vitest";
import { getTopAlignedCuboidsLayout, getBoundingBox } from "../coordinate";
import type { BaseCuboid } from "../../types";

describe("getTopAlignedCuboidsLayout", () => {
  it("应该正确处理单个立方体", () => {
    const cuboids: BaseCuboid[] = [{ width: 100, depth: 50, height: 30 }];
    const result = getTopAlignedCuboidsLayout(cuboids);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      dimensions: {
        width: 100,
        depth: 50,
        height: 30,
      },
      position: {
        x: 0,
        y: 0,
        z: -30,
      },
      index: 0,
    });
  });

  it("应该正确处理多个立方体", () => {
    const cuboids: BaseCuboid[] = [
      { width: 100, depth: 50, height: 30 },
      { width: 80, depth: 60, height: 40 },
    ];
    const result = getTopAlignedCuboidsLayout(cuboids);

    expect(result).toHaveLength(2);
    // 验证第一个立方体
    expect(result[0]!.dimensions).toEqual({
      width: 100,
      depth: 50,
      height: 30,
    });
    // 验证第二个立方体
    expect(result[1]!.dimensions).toEqual({
      width: 80,
      depth: 60,
      height: 40,
    });
  });

  it("应该正确处理立方体的位置", () => {
    const cuboids: BaseCuboid[] = [
      { width: 100, depth: 50, height: 30 },
      { width: 80, depth: 60, height: 40 },
    ];
    const result = getTopAlignedCuboidsLayout(cuboids);

    // 验证位置是否正确
    expect(result[0]!.position.z).toBe(-30);
    expect(result[1]!.position.z).toBe(-40);
  });

  it("应该正确处理立方体的索引", () => {
    const cuboids: BaseCuboid[] = [
      { width: 100, depth: 50, height: 30 },
      { width: 80, depth: 60, height: 40 },
    ];
    const result = getTopAlignedCuboidsLayout(cuboids);

    expect(result[0]!.index).toBe(0);
    expect(result[1]!.index).toBe(1);
  });

  it("应该正确处理空数组", () => {
    const cuboids: BaseCuboid[] = [];
    const result = getTopAlignedCuboidsLayout(cuboids);

    expect(result).toHaveLength(0);
  });

  it("应该正确处理极端尺寸的立方体", () => {
    const cuboids: BaseCuboid[] = [{ width: 1, depth: 1000, height: 1 }];
    const result = getTopAlignedCuboidsLayout(cuboids);

    expect(result).toHaveLength(1);
    expect(result[0]!.dimensions).toEqual({
      width: 1000,
      depth: 1,
      height: 1,
    });
  });

  it("应该确保 width >= depth", () => {
    const cuboids: BaseCuboid[] = [
      { width: 50, depth: 100, height: 30 }, // 深度大于宽度
      { width: 80, depth: 60, height: 40 }, // 宽度大于深度
    ];
    const result = getTopAlignedCuboidsLayout(cuboids);

    expect(result[0]!.dimensions.width).toBeGreaterThanOrEqual(
      result[0]!.dimensions.depth,
    );
    expect(result[1]!.dimensions.width).toBeGreaterThanOrEqual(
      result[1]!.dimensions.depth,
    );

    // 验证坐标不变
    expect(result[0]!.position.x).toBeGreaterThanOrEqual(0);
    expect(result[0]!.position.y).toBeGreaterThanOrEqual(0);
  });
});

describe("getBoundingBox", () => {
  it("应该正确处理单个立方体的包围盒", () => {
    const layouts = [
      {
        dimensions: { width: 100, depth: 50, height: 30 },
        position: { x: 0, y: 0, z: -30 },
        index: 0,
      },
    ];
    const result = getBoundingBox(layouts);

    expect(result).toEqual({
      dimensions: {
        width: 100,
        depth: 50,
        height: 30,
      },
      position: {
        x: 0,
        y: 0,
        z: -30,
      },
      index: 0,
    });
  });

  it("应该正确处理多个立方体的包围盒", () => {
    const layouts = [
      {
        dimensions: { width: 100, depth: 50, height: 30 },
        position: { x: 0, y: 0, z: -30 },
        index: 0,
      },
      {
        dimensions: { width: 80, depth: 60, height: 40 },
        position: { x: 120, y: 60, z: -40 },
        index: 1,
      },
    ];
    const result = getBoundingBox(layouts);

    expect(result).toEqual({
      dimensions: {
        width: 200, // 0-120 + 80
        depth: 120, // 0-60 + 60
        height: 40, // -40 to 0
      },
      position: {
        x: 0,
        y: 0,
        z: -40,
      },
      index: 0,
    });
  });

  it("应该正确处理立方体在负坐标的情况", () => {
    const layouts = [
      {
        dimensions: { width: 100, depth: 50, height: 30 },
        position: { x: -50, y: -30, z: -30 },
        index: 0,
      },
      {
        dimensions: { width: 80, depth: 60, height: 40 },
        position: { x: 70, y: 40, z: -40 },
        index: 1,
      },
    ];
    const result = getBoundingBox(layouts);

    expect(result).toEqual({
      dimensions: {
        width: 200, // -50 to 150
        depth: 130, // -30 to 100
        height: 40, // -40 to 0
      },
      position: {
        x: -50,
        y: -30,
        z: -40,
      },
      index: 0,
    });
  });

  it("应该正确处理空数组", () => {
    expect(() => getBoundingBox([])).toThrowError(
      "Cannot calculate bounding box for empty layout",
    );
  });

  it("应该正确处理立方体在 Z 轴上的重叠", () => {
    const layouts = [
      {
        dimensions: { width: 100, depth: 50, height: 30 },
        position: { x: 0, y: 0, z: -30 },
        index: 0,
      },
      {
        dimensions: { width: 80, depth: 60, height: 40 },
        position: { x: 50, y: 30, z: -20 },
        index: 1,
      },
    ];
    const result = getBoundingBox(layouts);

    expect(result.dimensions.height).toBe(50); // -30 to 20
  });
});
