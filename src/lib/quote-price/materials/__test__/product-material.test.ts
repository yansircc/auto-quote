import { describe, it, expect } from "vitest";
import {
  getProductMaterial,
  calculateProductMaterialCost,
} from "../product-materials";
import { materialList } from "src/lib/constants/price-constant";
import type { ProductMaterial } from "../types";

describe("产品材料测试", () => {
  describe("getProductMaterial", () => {
    it("应正确获取已存在的产品材料信息", () => {
      const existingMaterial = materialList[0];
      const result = getProductMaterial(existingMaterial.name);

      expect(result).toEqual({
        id: existingMaterial.name,
        name: existingMaterial.name,
        density: existingMaterial.density,
        pricePerKg: existingMaterial.price,
      });
    });

    it("当材料不存在时应抛出错误", () => {
      expect(() => {
        getProductMaterial("不存在的材料");
      }).toThrow("没有找到产品材料: 不存在的材料");
    });
  });

  describe("calculateProductMaterialCost", () => {
    const mockMaterial: ProductMaterial = {
      id: "ABS",
      name: "ABS塑料",
      density: 1.05, // g/cm³
      pricePerKg: 15, // 元/kg
      shrinkageRate: 0.006, // 0.6%
      processingTemp: 230, // °C
    };

    it("应正确计算正常体积的材料成本", () => {
      const volume = 1000; // cm³
      // 考虑收缩率的实际体积
      const actualVolume = volume * (1 + mockMaterial.shrinkageRate);
      const weight = actualVolume * mockMaterial.density;
      const expectedCost = weight * mockMaterial.pricePerKg;

      const result = calculateProductMaterialCost(mockMaterial, volume);
      expect(result).toBe(expectedCost);
    });

    it("当体积为负数时应抛出错误", () => {
      expect(() => {
        calculateProductMaterialCost(mockMaterial, -100);
      }).toThrow("产品体积不能为负数");
    });

    it("当体积为0时应返回0成本", () => {
      const result = calculateProductMaterialCost(mockMaterial, 0);
      expect(result).toBe(0);
    });

    it("应正确处理小体积产品的成本", () => {
      const smallVolume = 0.1; // cm³
      const actualVolume = smallVolume * (1 + mockMaterial.shrinkageRate);
      const expectedCost =
        actualVolume * mockMaterial.density * mockMaterial.pricePerKg;

      const result = calculateProductMaterialCost(mockMaterial, smallVolume);
      expect(result).toBe(expectedCost);
    });

    it("应正确处理大体积产品的成本", () => {
      const largeVolume = 10000; // cm³
      const actualVolume = largeVolume * (1 + mockMaterial.shrinkageRate);
      const expectedCost =
        actualVolume * mockMaterial.density * mockMaterial.pricePerKg;

      const result = calculateProductMaterialCost(mockMaterial, largeVolume);
      expect(result).toBe(expectedCost);
    });
  });
});
