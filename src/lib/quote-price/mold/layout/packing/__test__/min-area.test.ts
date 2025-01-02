import { describe, it, expect } from "vitest";
import { calculateMinArea } from "../min-area";

interface Rectangle {
  width: number;
  height: number;
}

describe("calculateMinArea", () => {
  it("应该正确处理单个矩形", () => {
    const rectangles: Rectangle[] = [{ width: 100, height: 50 }];
    const result = calculateMinArea(rectangles);

    expect(result.layout[0]).toEqual({
      width: 50,
      height: 100,
      x: 0,
      y: 0,
      index: 0,
    });
  });

  it("应该正确处理多个矩形", () => {
    const rectangles: Rectangle[] = [
      { width: 100, height: 50 },
      { width: 60, height: 80 },
    ];
    const result = calculateMinArea(rectangles);

    expect(result.layout).toHaveLength(2);
  });

  it("应该处理旋转选项", () => {
    const rectangles: Rectangle[] = [
      { width: 100, height: 50 },
      { width: 60, height: 80 },
    ];
    const result = calculateMinArea(rectangles, { allowRotation: true });

    const rotated = result.layout.some(
      (rect) => rect.width !== rectangles[rect.index!]!.width,
    );
    expect(rotated).toBe(true);
  });

  it("应该保持原始宽高比", () => {
    const rectangles: Rectangle[] = [
      { width: 50, height: 100 },
      { width: 60, height: 80 },
    ];
    const result = calculateMinArea(rectangles);

    expect(result.layout[0]!.width).toBe(100);
    expect(result.layout[0]!.height).toBe(50);
  });

  it("应该处理间距选项", () => {
    const rectangles: Rectangle[] = [
      { width: 50, height: 50 },
      { width: 60, height: 60 },
    ];
    const spacing = {
      getPackingSize: (rect: Rectangle) => ({
        width: rect.width + 10,
        height: rect.height + 10,
      }),
      getActualPosition: (x: number, y: number) => ({ x: x + 5, y: y + 5 }),
    };
    const result = calculateMinArea(rectangles, { spacing });

    expect(result.layout[0]!.x).toBe(5);
    expect(result.layout[0]!.y).toBe(5);
  });

  it("应该处理空矩形列表", () => {
    const rectangles: Rectangle[] = [];
    const result = calculateMinArea(rectangles);

    expect(result.layout).toHaveLength(0);
    expect(result.width).toBe(0);
    expect(result.height).toBe(0);
  });

  it("应该正确处理相同尺寸的矩形", () => {
    const rectangles: Rectangle[] = [
      { width: 50, height: 50 },
      { width: 50, height: 50 },
      { width: 50, height: 50 },
    ];
    const result = calculateMinArea(rectangles);

    expect(result.layout).toHaveLength(3);
    expect(result.width).toBe(50);
    expect(result.height).toBe(150);
  });

  it("应该正确处理不允许旋转的情况", () => {
    const rectangles: Rectangle[] = [
      { width: 100, height: 50 },
      { width: 60, height: 80 },
    ];
    const result = calculateMinArea(rectangles, { allowRotation: false });

    const rotated = result.layout.some(
      (rect) => rect.width !== rectangles[rect.index!]!.width,
    );
    expect(rotated).toBe(false);
  });

  it("应该正确处理最大迭代次数", () => {
    const rectangles: Rectangle[] = [
      { width: 100, height: 50 },
      { width: 60, height: 80 },
    ];
    const result = calculateMinArea(rectangles, { maxIterations: 1 });

    expect(result.layout).toHaveLength(2);
  });

  it("应该正确处理极端尺寸的矩形", () => {
    const rectangles: Rectangle[] = [
      { width: 1, height: 1000 },
      { width: 1000, height: 1 },
    ];
    const result = calculateMinArea(rectangles);

    expect(result.layout).toHaveLength(2);
    expect(result.width).toBeGreaterThan(0);
    expect(result.height).toBeGreaterThan(0);
  });

  it("应该保持矩形索引正确", () => {
    const rectangles: Rectangle[] = [
      { width: 50, height: 100 },
      { width: 60, height: 80 },
      { width: 70, height: 90 },
    ];
    const result = calculateMinArea(rectangles);

    result.layout.forEach((rect, i) => {
      expect(rect.index).toBe(i);
    });
  });
});
