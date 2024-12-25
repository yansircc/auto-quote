import { describe, test, expect, vi } from "vitest";
import {
  calculateProductMaterialPrice,
  calculateProductMaterialWeight,
  calculateProductPrice,
} from "../price";
import { getProductMaterial } from "../../materials/product-materials";
import { fixedLossRate } from "src/lib/constants/price-constant";
import type { ProductPriceDimensions } from "../product-schema";

// Mock getProductMaterial
vi.mock("../../materials/product-materials", () => ({
  getProductMaterial: vi.fn((material: string) => {
    if (material === "ABS") {
      return {
        name: "ABS",
        density: 1.05,
        pricePerKg: 25,
      };
    }
    return null;
  }),
}));

describe("calculateProductMaterialPrice", () => {
  test("应该正确计算材料价格", () => {
    const volume = 100; // cm³
    const material = "ABS";

    const result = calculateProductMaterialPrice(volume, material);

    // 期望价格 = 体积 * 密度 * 损耗率 * 单价
    // 100 * 1.05 * 1.1 * 25 = 2887.5
    const expectedPrice = volume * 1.05 * fixedLossRate * 25;
    expect(result).toBe(expectedPrice);
  });

  test("当材料不存在时应该抛出错误", () => {
    const volume = 100;
    const material = "不存在的材料";

    expect(() => calculateProductMaterialPrice(volume, material)).toThrow(
      "没有找到产品材料: 不存在的材料",
    );
  });

  test("当材料密度为空时应该抛出错误", () => {
    vi.mocked(getProductMaterial).mockReturnValueOnce({
      name: "TEST",
      density: 0,
      pricePerKg: 25,
      id: "TEST",
    });

    expect(() => calculateProductMaterialPrice(100, "TEST")).toThrow(
      "产品材料TEST的密度为空",
    );
  });
});

describe("calculateProductMaterialWeight", () => {
  test("应该正确计算材料重量", () => {
    const volume = 100; // cm³
    const material = "ABS";

    const result = calculateProductMaterialWeight(volume, material);

    // 期望重量 = 体积 * 密度
    // 100 * 1.05 = 105
    expect(result).toBe(105);
  });

  test("当材料不存在时应该抛出错误", () => {
    const volume = 100;
    const material = "不存在的材料";

    expect(() => calculateProductMaterialWeight(volume, material)).toThrow(
      "没有找到产品材料: 不存在的材料",
    );
  });

  test("当材料密度为空时应该抛出错误", () => {
    vi.mocked(getProductMaterial).mockReturnValueOnce({
      name: "TEST",
      density: 0,
      pricePerKg: 25,
      id: "TEST",
    });

    expect(() => calculateProductMaterialWeight(100, "TEST")).toThrow(
      "产品材料TEST的密度为空",
    );
  });
});

describe("calculateProductPrice", () => {
  test("应该正确计算单个产品的价格", () => {
    const products: ProductPriceDimensions[] = [
      {
        productMaterial: "ABS",
        volume: 100,
        productQuantity: 10,
        length: 10,
        width: 10,
        height: 10,
        color: "red",
        density: 1.05,
      },
    ];
    const maxMachiningCost = 1000;

    const result = calculateProductPrice(products, maxMachiningCost);

    expect(result).toHaveLength(1);
    expect(result[0]).toHaveProperty("productQuantity", 10);
    expect(result[0]).toHaveProperty("density", 1.05);
  });

  test("应该正确分摊多个产品的加工费", () => {
    const products: ProductPriceDimensions[] = [
      {
        productMaterial: "ABS",
        volume: 100,
        productQuantity: 20,
        length: 10,
        width: 10,
        height: 10,
        color: "red",
        density: 1.05,
      },
      {
        productMaterial: "ABS",
        volume: 150,
        productQuantity: 20,
        length: 10,
        width: 10,
        height: 10,
        color: "red",
        density: 1.05,
      },
    ];
    const maxMachiningCost = 1000;

    const result = calculateProductPrice(products, maxMachiningCost);

    expect(result).toHaveLength(2);
    result.forEach((product) => {
      expect(product.productQuantity).toBe(20); // 1000/2
    });
  });

  test("应该处理不同批次的产品数量", () => {
    const products: ProductPriceDimensions[] = [
      {
        productMaterial: "ABS",
        volume: 100,
        productQuantity: 10,
        length: 10,
        width: 10,
        height: 10,
        color: "red",
        density: 1.05,
      },
      {
        productMaterial: "ABS",
        volume: 150,
        productQuantity: 20,
        length: 10,
        width: 10,
        height: 10,
        color: "red",
        density: 1.05,
      },
    ];
    const maxMachiningCost = 1000;

    const result = calculateProductPrice(products, maxMachiningCost);

    expect(result[0]).toHaveProperty("productQuantity", 10);
    expect(result[1]).toHaveProperty("productQuantity", 20);
  });
});
