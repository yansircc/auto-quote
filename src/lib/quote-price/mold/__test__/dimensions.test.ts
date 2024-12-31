import { describe, expect, it } from "vitest";
import { getMoldDimensions } from "../dimensions";
import type { Dimensions } from "../../core";

describe("模具尺寸计算", () => {
  it("应正确计算包含安全厚度的模具尺寸", () => {
    const input: Dimensions = { width: 500, depth: 400, height: 100 };
    const result = getMoldDimensions(input);

    // 根据 safe-thickness.ts 中的数据：
    // width: 500 + 95*2 = 690
    // depth: 400 + 85*2 = 570
    // height: 100 + 310 = 410
    expect(result.width).toBe(690);
    expect(result.depth).toBe(570);
    expect(result.height).toBe(410);
  });

  it("应正确处理最小尺寸", () => {
    const input: Dimensions = { width: 100, depth: 100, height: 50 };
    const result = getMoldDimensions(input);

    // 根据 safe-thickness.ts 中的数据：
    // width: 100 + 60*2 = 220
    // depth: 100 + 60*2 = 220
    // height: 50 + 210 = 260
    expect(result.width).toBe(220);
    expect(result.depth).toBe(220);
    expect(result.height).toBe(260);
  });

  it("应正确处理最大尺寸", () => {
    const input: Dimensions = { width: 1000, depth: 1000, height: 210 };
    const result = getMoldDimensions(input);

    // 根据 safe-thickness.ts 中的数据：
    // width: 1000 + 145*2 = 1290
    // depth: 1000 + 145*2 = 1290
    // height: 210 + 510 = 720
    expect(result.width).toBe(1290);
    expect(result.depth).toBe(1290);
    expect(result.height).toBe(720);
  });

  it("当输入尺寸为0时应抛出错误", () => {
    const invalidInputs: Dimensions[] = [
      { width: 0, depth: 100, height: 100 },
      { width: 100, depth: 0, height: 100 },
      { width: 100, depth: 100, height: 0 },
    ];

    invalidInputs.forEach((input) => {
      expect(() => getMoldDimensions(input)).toThrow();
    });
  });
});
