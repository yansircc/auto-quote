import {
  calculateProductMaterialCost,
  calculateProductTotalCost,
} from "../cost";
import { describe, it, expect } from "vitest";

describe("产品成本计算", () => {
  describe("calculateProductMaterialCost - 单件产品材料成本", () => {
    it("计算单件产品的材料成本", () => {
      const productNetVolume = 100; // 立方厘米
      const productMaterialDensity = 0.91; // 克/立方厘米（示例：PP塑料密度）
      const productMaterialUnitPrice = 15; // 元/千克

      const cost = calculateProductMaterialCost(
        productNetVolume,
        productMaterialDensity,
        productMaterialUnitPrice,
      );

      // 具体预期值计算：
      // 100 cm³ * 0.91 g/cm³ = 91g = 0.091kg
      // 0.091kg * 15 元/kg = 1.365 元
      expect(cost).toBe(1.365);
    });

    it("处理零体积的情况", () => {
      const cost = calculateProductMaterialCost(0, 0.91, 15);
      expect(cost).toBe(0);
    });

    it("处理负数输入", () => {
      expect(() => calculateProductMaterialCost(-100, 0.91, 15)).toThrow(
        "产品体积不能为负数",
      );
      expect(() => calculateProductMaterialCost(100, -0.91, 15)).toThrow(
        "材料密度不能为负数",
      );
      expect(() => calculateProductMaterialCost(100, 0.91, -15)).toThrow(
        "材料单价不能为负数",
      );
    });
  });

  describe("calculateProductTotalCost - 总产品成本", () => {
    it("计算指定数量的产品总成本", () => {
      const productQuantity = 1000; // 产品数量
      const singleProductCost = 1.365; // 单件成本（元）

      const totalCost = calculateProductTotalCost(
        productQuantity,
        singleProductCost,
      );

      // 1000件 * 1.365元/件 = 1365元
      expect(totalCost).toBe(1365);
    });

    it("处理零数量的情况", () => {
      const totalCost = calculateProductTotalCost(0, 1.365);
      expect(totalCost).toBe(0);
    });

    it("处理非整数数量", () => {
      expect(() => calculateProductTotalCost(100.5, 1.365)).toThrow(
        "产品数量必须为整数",
      );
    });

    it("处理负数输入", () => {
      expect(() => calculateProductTotalCost(-100, 1.365)).toThrow(
        "产品数量不能为负数",
      );
      expect(() => calculateProductTotalCost(100, -1.365)).toThrow(
        "单件成本不能为负数",
      );
    });
  });
});
