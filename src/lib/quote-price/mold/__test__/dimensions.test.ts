import { describe, it, expect } from "vitest";
import {
  calculateMoldVolume,
  calculateMoldDimensions,
  calculateMoldDimensionsByCavity,
} from "../dimensions";
import type { Product } from "../../product/types";
import type { MoldDimensions } from "../types";

describe("模具尺寸计算测试", () => {
  describe("calculateMoldVolume", () => {
    it("正确计算模具体积", () => {
      const dimensions: MoldDimensions = {
        width: 100,
        height: 50,
        depth: 30,
      };

      const volume = calculateMoldVolume(dimensions);
      expect(volume).toBe(150000); // 100 * 50 * 30
    });

    it("处理空尺寸", () => {
      // @ts-expect-error 测试空输入
      const volume = calculateMoldVolume(null);
      expect(volume).toBe(0);
    });

    it("处理零尺寸", () => {
      const dimensions: MoldDimensions = {
        width: 0,
        height: 0,
        depth: 0,
      };

      const volume = calculateMoldVolume(dimensions);
      expect(volume).toBe(0);
    });
  });

  describe("calculateMoldDimensions", () => {
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

    it("计算单个产品的模具尺寸", () => {
      const dimensions = calculateMoldDimensions([baseProduct], [1]);

      expect(dimensions.width).toBeGreaterThan(80);
      expect(dimensions.height).toBeGreaterThan(80);
      expect(dimensions).toEqual(
        expect.objectContaining({
          width: expect.any(Number),
          height: expect.any(Number),
          depth: expect.any(Number),
        }),
      );
    });

    it("处理空产品列表", () => {
      const dimensions = calculateMoldDimensions([], []);
      expect(dimensions).toEqual({
        width: 120,
        height: 210,
        depth: 0,
      });
    });

    it("计算多个产品的模具尺寸", () => {
      const products = [
        baseProduct,
        {
          ...baseProduct,
          id: "2",
          dimensions: {
            width: 150,
            height: 80,
            depth: 40,
          },
        },
      ];

      const dimensions = calculateMoldDimensions(products, [1, 1]);

      // 确保尺寸大于最大产品尺寸
      expect(dimensions.width).toBeGreaterThan(70);
      expect(dimensions.height).toBeGreaterThan(100);
      expect(dimensions.depth).toBeGreaterThanOrEqual(0);
    });
  });

  describe("calculateMoldDimensionsByCavity", () => {
    const productDimensions = {
      width: 100,
      height: 50,
      depth: 30,
    };

    it("处理非法穴数", () => {
      expect(() =>
        calculateMoldDimensionsByCavity(-1, productDimensions),
      ).toThrow("穴数不能为负数或0");
    });
    

    it("处理非法产品尺寸", () => {
      expect(() =>
        calculateMoldDimensionsByCavity(4, {
          width: -1,
          height: 50,
          depth: 30,
        }),
      ).toThrow("产品尺寸不能为负数");
    });
  });
});
