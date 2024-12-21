import { calculateCavityLayout } from "../cavity-layout";
import { describe, it, expect } from "vitest";
// import { visualizeLayout } from './visualize/visualize-layout';

describe("calculateMinArea", () => {
  it("应该输出两个矩形的最小面积", () => {
    // 2个边长为100的矩形
    const cuboids = [
      {
        width: 100,
        height: 100,
      },
      {
        width: 100,
        height: 100,
      },
    ];

    const result = calculateCavityLayout(cuboids);
    // visualizeLayout(result.layout, 'layout-two-squares.svg');
    const area = result.width * result.height;
    // console.log(result.layout);
    expect(area).toBe(230 * 100);
  });

  it("应该正确处理4个不同尺寸的小矩形", () => {
    const cuboids = [
      {
        width: 120,
        height: 60,
      },
      {
        width: 120,
        height: 60,
      },
      {
        width: 40,
        height: 40,
      },
      {
        width: 40,
        height: 40,
      },
    ];

    // 预期结果：
    // - 总宽度 = 220
    // - 总高度 = 120
    const result = calculateCavityLayout(cuboids);
    // visualizeLayout(result.layout, 'layout-four-rectangles.svg');
    const area = result.width * result.height;
    // console.log(result.layout);
    expect(area).toBe(220 * 120);
  });

  it("应该正确处理3个不同尺寸的大矩形", () => {
    const cuboids = [
      {
        width: 300,
        height: 100,
      },
      {
        width: 250,
        height: 100,
      },
      {
        width: 230,
        height: 180,
      },
    ];

    // 预期结果：
    // - 总宽度 = 380
    // - 总高度 = 310
    const result = calculateCavityLayout(cuboids);
    // visualizeLayout(result.layout, 'layout-three-large-rectangles.svg');
    const area = result.width * result.height;
    // console.log(result);
    expect(area).toBe(380 * 310);
  });
});
