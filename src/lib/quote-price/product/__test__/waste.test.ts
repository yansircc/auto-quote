import { calculateWasteCost } from "../waste";
import { describe, it, expect } from "vitest";

describe("材料损耗计算", () => {
  describe("calculateWasteCost - 计算损耗成本", () => {
    it("应该正确计算标准损耗成本", () => {
      const params = {
        productMaterialCost: 1000, // 材料成本（元）
      };

      const wasteCost = calculateWasteCost(params.productMaterialCost);
      // 损耗成本 = 材料成本 * (损耗率 - 1)
      // 1000 * (1.1 - 1) = 100 元
      expect(wasteCost).toBe(100);
    });

    it("应该正确处理零材料成本", () => {
      const params = {
        productMaterialCost: 0,
      };
      expect(() => 
        calculateWasteCost(params.productMaterialCost)).toThrow("产品材料成本不能为空");
    });

    it("应该正确处理精确计算并保留两位小数", () => {
      const params = {
        productMaterialCost: 1234.56,
      };
      const wasteCost = calculateWasteCost(params.productMaterialCost);
      // 1234.56 * (1.1 - 1) = 123.46 元
      expect(wasteCost).toBe(123.456);
    });

    it("应该在参数为空时抛出错误", () => {
      // @ts-expect-error 测试空值情况
      expect(() => calculateWasteCost(undefined))
        .toThrow("产品材料成本不能为空");
      // @ts-expect-error 测试空值情况
      expect(() => calculateWasteCost(null))
        .toThrow("产品材料成本不能为空");
    });

    it("应该在材料成本为负数时抛出错误", () => {
      expect(() => calculateWasteCost( -1000 ))
        .toThrow("材料成本不能为负数");
    });
  });
});
