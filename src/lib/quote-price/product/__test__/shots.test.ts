import { describe, expect, it } from "vitest";
import { getSingleProductShots, getProductsTotalShots } from "../shots";
import type { SimplifiedProductProps, ForceOptions } from "../../core";

describe("模次计算", () => {
  describe("单个产品模次计算", () => {
    it("应正确计算单个产品的模次", () => {
      expect(getSingleProductShots(1000, 4)).toBe(250);
      expect(getSingleProductShots(1001, 4)).toBe(251);
    });

    it("当穴数为0时应抛出错误", () => {
      expect(() => getSingleProductShots(1000, 0)).toThrow();
    });

    it("当产品数量为0时应返回0", () => {
      expect(getSingleProductShots(0, 4)).toBe(0);
    });
  });

  describe("多个产品模次计算", () => {
    const testProducts: SimplifiedProductProps[] = [
      { shots: 150, materialName: "ABS", color: "Red" },
      { shots: 100, materialName: "ABS", color: "Blue" },
      { shots: 200, materialName: "PC", color: "Red" },
    ];

    const forceOptions: ForceOptions = {
      isForceColorSimultaneous: true,
      isForceMaterialSimultaneous: false,
    };

    it("当产品列表为空时应返回0", () => {
      expect(getProductsTotalShots([], forceOptions)).toBe(0);
    });

    it("当不提供强制选项时应简单累加模次", () => {
      expect(getProductsTotalShots(testProducts)).toBe(450);
    });

    it("当颜色和材料都兼容时应返回最大模次", () => {
      const compatibleProducts: SimplifiedProductProps[] = [
        { shots: 100, materialName: "ABS", color: "Red" },
        { shots: 150, materialName: "ABS", color: "Red" },
      ];
      const options: ForceOptions = {
        isForceColorSimultaneous: true,
        isForceMaterialSimultaneous: true,
      };
      expect(getProductsTotalShots(compatibleProducts, options)).toBe(150);
    });

    it("当颜色不兼容但材料兼容时应按颜色分组计算", () => {
      const options: ForceOptions = {
        isForceColorSimultaneous: false,
        isForceMaterialSimultaneous: true,
      };
      // 分组情况：
      // 组1 Red: ABS(150), PC(200) -> max(150, 200) = 200
      // 组2 Blue: ABS(100) -> 100
      // 总模次: 200 + 100 = 300
      expect(getProductsTotalShots(testProducts, options)).toBe(300);
    });

    it("当材料不兼容但颜色兼容时应按材料分组计算", () => {
      const options: ForceOptions = {
        isForceColorSimultaneous: true,
        isForceMaterialSimultaneous: false,
      };
      // 分组情况：
      // 组1 (ABS): Red(150), Blue(100) -> max(150, 100) = 150
      // 组2 (PC): Red(200) -> 200
      // 总模次: 150 + 200 = 350
      expect(getProductsTotalShots(testProducts, options)).toBe(350);
    });

    it("当颜色和材料都不兼容时应按颜色和材料组合分组计算", () => {
      const options: ForceOptions = {
        isForceColorSimultaneous: false,
        isForceMaterialSimultaneous: false,
      };
      expect(getProductsTotalShots(testProducts, options)).toBe(450);
    });
  });
});
