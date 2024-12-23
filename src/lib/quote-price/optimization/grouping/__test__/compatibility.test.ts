import { describe, it, expect } from "vitest";
import {
  checkProductCompatibility,
  checkGroupCompatibility,
} from "../compatibility";
import type { Product } from "../../../product/types";
import type { GroupingConfig } from "../../types";

describe("产品组合兼容性测试", () => {
  // 创建基础的测试产品
  const baseProduct: Product = {
    id: "1",
    name: "测试产品",
    material: {
      name: "ABS",
      density: 0.0012,
      price: 0.013,
      shrinkageRate: 0.02,
      processingTemp: 200,
    },
    color: "black",
    dimensions: {
      width: 100,
      height: 100,
      depth: 50,
    },
    quantity: 10000,
    netVolume: 10000,
    envelopeVolume: 10000,
  };

  // 创建基础配置
  const baseConfig: GroupingConfig = {
    forceGrouping: {
      allowDifferentMaterials: false,
      allowDifferentColors: false,
    },
    risk: {
      weights: {
        materialDifference: 0.1,
        colorTransition: 0.1,
        quantityRatio: 0.1,
        structure: 0.1,
      },
      thresholds: {
        low: 30,
        medium: 60,
        high: 80,
        extreme: 100,
      },
    },
  };

  describe("checkProductCompatibility", () => {
    it("相同材料和颜色的产品应该兼容", () => {
      const product1 = { ...baseProduct, id: "1" };
      const product2 = { ...baseProduct, id: "2" };

      const result = checkProductCompatibility(product1, product2, baseConfig);
      expect(result).toBe(true);
    });

    it("不同材料且不允许不同材料时应该不兼容", () => {
      const product1 = {
        ...baseProduct,
        id: "1",
        material: {
          name: "ABS",
          density: 0.0012,
          price: 0.013,
          shrinkageRate: 0.02,
          processingTemp: 200,
        },
      };
      const product2 = {
        ...baseProduct,
        id: "2",
        material: {
          name: "PC",
          density: 0.0012,
          price: 0.013,
          shrinkageRate: 0.02,
          processingTemp: 200,
        },
      };

      const result = checkProductCompatibility(product1, product2, baseConfig);
      expect(result).toBe(false);
    });

    it("不同材料但允许不同材料时应该兼容", () => {
      const product1 = {
        ...baseProduct,
        id: "1",
        material: {
          name: "ABS",
          density: 0.0012,
          price: 0.013,
          shrinkageRate: 0.02,
          processingTemp: 200,
        },
      };
      const product2 = {
        ...baseProduct,
        id: "2",
        material: {
          name: "PC",
          density: 0.0012,
          price: 0.013,
          shrinkageRate: 0.02,
          processingTemp: 200,
        },
      };
      const config = {
        ...baseConfig,
        forceGrouping: {
          allowDifferentMaterials: true,
          allowDifferentColors: false,
        },
      };

      const result = checkProductCompatibility(product1, product2, config);
      expect(result).toBe(true);
    });

    it("不同颜色且不允许不同颜色时应该不兼容", () => {
      const product1 = { ...baseProduct, id: "1", color: "black" };
      const product2 = { ...baseProduct, id: "2", color: "white" };

      const result = checkProductCompatibility(product1, product2, baseConfig);
      expect(result).toBe(false);
    });

    it("不同颜色但允许不同颜色时应该兼容", () => {
      const product1 = { ...baseProduct, id: "1", color: "black" };
      const product2 = { ...baseProduct, id: "2", color: "white" };
      const config = {
        ...baseConfig,
        forceGrouping: {
          allowDifferentMaterials: false,
          allowDifferentColors: true,
        },
      };

      const result = checkProductCompatibility(product1, product2, config);
      expect(result).toBe(true);
    });
  });

  describe("checkGroupCompatibility", () => {
    it("空组应该返回true", () => {
      
      expect(()=> checkGroupCompatibility([], baseConfig)).toThrow('产品列表不能为空');
    });

    it("单个产品应该返回true", () => {
      const result = checkGroupCompatibility([baseProduct], baseConfig);
      expect(result).toBe(true);
    });

    it("所有产品相同材料和颜色时应该兼容", () => {
      const products = [
        { ...baseProduct, id: "1" },
        { ...baseProduct, id: "2" },
        { ...baseProduct, id: "3" },
      ];

      const result = checkGroupCompatibility(products, baseConfig);
      expect(result).toBe(true);
    });

    it("存在不同材料且不允许时应该不兼容", () => {
      const products = [
        {
          ...baseProduct,
          id: "1",
          material: {
            name: "ABS",
            density: 0.0012,
            price: 0.013,
            shrinkageRate: 0.02,
            processingTemp: 200,
          },
        },
        {
          ...baseProduct,
          id: "2",
          material: {
            name: "PC",
            density: 0.0012,
            price: 0.013,
            shrinkageRate: 0.02,
            processingTemp: 200,
          },
        },
        {
          ...baseProduct,
          id: "3",
          material: {
            name: "ABS",
            density: 0.0012,
            price: 0.013,
            shrinkageRate: 0.02,
            processingTemp: 200,
          },
        },
      ];

      const result = checkGroupCompatibility(products, baseConfig);
      expect(result).toBe(false);
    });

    it("存在不同颜色且不允许时应该不兼容", () => {
      const products = [
        { ...baseProduct, id: "1", color: "black" },
        { ...baseProduct, id: "2", color: "white" },
        { ...baseProduct, id: "3", color: "black" },
      ];

      const result = checkGroupCompatibility(products, baseConfig);
      expect(result).toBe(false);
    });

    
  });
});

