import { calculateMoldSellingPrice } from "../profit";
import { describe, it, expect } from "vitest";

describe("calculateMoldSellingPrice", () => {
  it("计算包含利润在内的模具售价", () => {
    // 测试用的模拟值
    const mockMaterialCost = 10000; // 材料成本（元）
    const mockProcessingCost = 5000; // 加工成本（元）
    const mockProfitRatio = 0.3; // 利润率30%

    const sellingPrice = calculateMoldSellingPrice(
      mockMaterialCost,
      mockProcessingCost,
      mockProfitRatio,
    );

    // 具体预期值计算：
    // 总成本 = 10000 + 5000 = 15000
    // 售价 = 15000 * (1 + 0.3) = 19500
    expect(sellingPrice).toBe(19500);
  });

  it("处理成本为零的情况", () => {
    const sellingPrice = calculateMoldSellingPrice(0, 0, 0.3);
    expect(sellingPrice).toBe(0);
  });

  it("处理不同利润率的情况", () => {
    const materialCost = 10000;
    const processingCost = 5000;
    const baseCost = materialCost + processingCost; // 15000元

    // 无利润情况（利润率0%）
    expect(calculateMoldSellingPrice(materialCost, processingCost, 0)).toBe(
      15000,
    );

    // 100%利润
    expect(calculateMoldSellingPrice(materialCost, processingCost, 1.0)).toBe(
      30000,
    );

    // 负利润（亏本50%）
    expect(calculateMoldSellingPrice(materialCost, processingCost, -0.5)).toBe(
      7500,
    );
  });

  it("处理异常情况", () => {
    // 利润率不能低于 -1（-100%）
    expect(() => calculateMoldSellingPrice(10000, 5000, -1.1)).toThrow(
      "利润率不能低于 -100%",
    );

    // 成本不能为负数
    expect(() => calculateMoldSellingPrice(-10000, 5000, 0.3)).toThrow(
      "材料成本不能为负数",
    );
    expect(() => calculateMoldSellingPrice(10000, -5000, 0.3)).toThrow(
      "加工成本不能为负数",
    );
  });
});
