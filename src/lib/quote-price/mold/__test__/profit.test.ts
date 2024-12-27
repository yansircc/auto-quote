import { describe, it, expect } from "vitest";
import { calculateMoldPrice } from "../cost";

describe("calculateMoldSellingPrice", () => {
  it("计算包含毛利在内的模具售价", () => {
    // 测试用的模拟值
    const mockMaterialCost = 10000; // 模具材料成本（元）
    const mockMaintenanceFee = 5000; // 供应商运维费（元）
    const mockGrossProfit = 22000; // 毛利
    const mockProcessingFee = 3000; // 额外加工费
    const sellingPrice = calculateMoldPrice(
      mockMaterialCost,
      mockMaintenanceFee,
      mockGrossProfit,
      mockProcessingFee,
    );

    // 具体预期值计算：
    expect(sellingPrice).toBe(40000);
  });

  it("处理成本为零的情况", () => {
    expect(() => calculateMoldPrice(0, 0, 3000, 0)).toThrow(
      "成本不能为负数或0",
    );
  });

  it("处理不同毛利的情况", () => {
    const materialCost = 10000;
    const mockMaintenanceFee = 5000;
    const mockProcessingFee = 3000;
    const baseCost = materialCost + mockMaintenanceFee + mockProcessingFee; // 18000元

    // 无毛利情况
    expect(() =>
      calculateMoldPrice(
        materialCost,
        mockMaintenanceFee,
        mockProcessingFee,
        0,
      ),
    ).toThrow("毛利不能为负数或0");

    // 毛利
    expect(
      calculateMoldPrice(
        materialCost,
        mockMaintenanceFee,
        mockProcessingFee,
        22000,
      ),
    ).toBe(baseCost + 22000);

    // 负毛利
    expect(() =>
      calculateMoldPrice(
        materialCost,
        mockMaintenanceFee,
        mockProcessingFee,
        -2000,
      ),
    ).toThrow("毛利不能为负数或0");
  });

  it("处理异常情况", () => {
    // 利润率不能低于 -1（-100%）
    expect(() => calculateMoldPrice(10000, 5000, 3000, -1000)).toThrow(
      "毛利不能为负数或0",
    );

    // 成本不能为负数
    expect(() => calculateMoldPrice(-10000, 5000, 3000, -1000)).toThrow(
      "成本不能为负数或0",
    );
    expect(() => calculateMoldPrice(10000, -5000, 3000, -1000)).toThrow(
      "成本不能为负数或0",
    );
  });
});
