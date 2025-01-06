import { describe, expect, it } from "vitest";
import { getMoldGrossProfit } from "../gross-profit";

describe("模具利润计算", () => {
  it("应该正确处理最小重量", () => {
    expect(getMoldGrossProfit(0)).toBe(9000);
    expect(getMoldGrossProfit(50)).toBe(9000);
  });

  it("应该正确处理边界重量", () => {
    expect(getMoldGrossProfit(100)).toBe(9000);
    expect(getMoldGrossProfit(101)).toBe(10000);
  });

  it("应该正确处理中间值", () => {
    expect(getMoldGrossProfit(150)).toBe(10000);
    expect(getMoldGrossProfit(250)).toBe(11000);
  });

  it("应该正确处理最大重量", () => {
    expect(getMoldGrossProfit(4000)).toBe(34500);
  });

  it("应该抛出错误当重量为负数", () => {
    expect(() => getMoldGrossProfit(-1)).toThrow("模具重量不能为负数");
  });

  it("应该抛出错误当重量超过最大阈值", () => {
    expect(() => getMoldGrossProfit(4001)).toThrow("模具重量超过阈值");
  });

  it("应该正确处理所有重量阶梯", () => {
    // 测试所有重量阶梯的边界值
    for (let weight = 0; weight <= 4000; weight += 100) {
      expect(() => getMoldGrossProfit(weight)).not.toThrow();
    }
  });
});
