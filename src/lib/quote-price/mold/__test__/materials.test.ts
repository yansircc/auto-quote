import { describe, it, expect } from "vitest";
import {
  getProductMaterialDensityByName,
  getProductMaterialPriceByName,
} from "../../materials/common";

describe("材料属性测试", () => {
  describe("getMaterialDensity", () => {
    it("应该返回正确的ABS密度", () => {
      const density = getProductMaterialDensityByName("ABS");

      expect(density).toBe(0.0012);
    });

    it("应该返回正确的PC密度", () => {
      const density = getProductMaterialDensityByName("PC");

      expect(density).toBe(0.0012);
    });

    it("应该返回正确的PP密度", () => {
      const density = getProductMaterialDensityByName("PP");

      expect(density).toBe(0.001);
    });

    
    it("对于未知材料类型应该抛出错误", () => {
      expect(() => getProductMaterialDensityByName("unknown_material")).toThrow(
        "没有找到对应的产品材料",
      );
    });
  });

  describe("getMaterialUnitPrice", () => {
    it("应该返回正确的ABS单价", () => {
      const price = getProductMaterialPriceByName("ABS");
      // 假设钢材单价为 50 元/kg
      expect(price).toBe(0.013);
    });

    it("应该返回正确的PC单价", () => {
      const price = getProductMaterialPriceByName("PC");
      // 假设铝材单价为 80 元/kg
      expect(price).toBe(0.023);
    });

    it("应该返回正确的PP单价", () => {
      const price = getProductMaterialPriceByName("PP");
      // 假设铜材单价为 120 元/kg
      expect(price).toBe(0.011);
    });

    it("对于未知材料类型应该抛出错误", () => {
      expect(() => getProductMaterialPriceByName("unknown_material")).toThrow(
        "没有找到对应的产品材料",
      );
    });
  });
});
