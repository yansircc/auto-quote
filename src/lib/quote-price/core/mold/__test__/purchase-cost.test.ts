import { describe, expect, it } from "vitest";
import { getPurchaseCostMultiple } from "../purchase-cost";

describe("采购成本倍率计算", () => {
  it("应该正确处理最小重量", () => {
    expect(getPurchaseCostMultiple(0)).toBe(4);
    expect(getPurchaseCostMultiple(500)).toBe(4);
  });

  it("应该正确处理边界重量", () => {
    expect(getPurchaseCostMultiple(1001)).toBe(3);
    expect(getPurchaseCostMultiple(1000)).toBe(4);
  });

  it("应该正确处理中间值", () => {
    expect(getPurchaseCostMultiple(1500)).toBe(3);
    expect(getPurchaseCostMultiple(2500)).toBe(3);
  });

  it("应该抛出错误当重量为负数", () => {
    expect(() => getPurchaseCostMultiple(-1)).toThrow("模具重量不能为负数");
  });

  it("应该抛出错误当重量超过最大阈值", () => {
    expect(() => getPurchaseCostMultiple(4001)).toThrow(
      "模具重量 4001 超出计算范围",
    );
  });

  it("应该正确处理所有重量范围", () => {
    // 测试所有重量范围的边界值
    for (let weight = 0; weight <= 4000; weight += 100) {
      expect(() => getPurchaseCostMultiple(weight)).not.toThrow();
    }
  });
});
