import { describe, it, expect } from "vitest";
import { getMoldMaterial, calculateMoldMaterialCost } from "../mold-materials";
import { moldMaterialList } from "src/lib/constants/price-constant";
import type { MoldMaterial } from "../types";

describe("模具材料测试", () => {
  describe("getMoldMaterial", () => {
    it("应正确获取已存在的模具材料信息", () => {
      const existingMaterial = moldMaterialList[0];
      const result = getMoldMaterial(existingMaterial.name);

      expect(result).toEqual({
        id: existingMaterial.name,
        name: existingMaterial.name,
        density: existingMaterial.density,
        pricePerKg: existingMaterial.price,
      });
    });

    it("当材料不存在时应抛出错误", () => {
      expect(() => {
        getMoldMaterial("不存在的材料");
      }).toThrow("没有找到对应的模具材料");
    });
  });

  describe("calculateMoldMaterialCost", () => {
    const mockMaterial: MoldMaterial = {
      id: "P20",
      name: "718H",
      density: 7.85, // g/cm³
      pricePerKg: 50, // 元/kg
    };

    it("应正确计算正常体积的材料成本", () => {
      const volume = 1000; // cm³

      const result = calculateMoldMaterialCost(mockMaterial, volume);
      expect(result).toBe(392500);
    });

    it("应正确处理最小重量限制", () => {
      const smallVolume = 10; // cm³

      const result = calculateMoldMaterialCost(mockMaterial, smallVolume);
      expect(result).toBe(5000);
    });

    it("当体积为负数时应抛出错误", () => {
      expect(() => {
        calculateMoldMaterialCost(mockMaterial, -100);
      }).toThrow("模具体积不能为负数");
    });

    it("当体积为0时应返回最小成本", () => {
      const result = calculateMoldMaterialCost(mockMaterial, 0);
      // 最小100kg * 10元/kg
      expect(result).toBe(5000);
    });

    it("应正确处理大体积模具的成本", () => {
      const largeVolume = 10000; // cm³

      const result = calculateMoldMaterialCost(mockMaterial, largeVolume);
      expect(result).toBe(3925000);
    });
  });
});

