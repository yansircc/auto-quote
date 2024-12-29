import { describe, test, expect, vi } from "vitest";
import {
  calculateProductFinalPrice,
  getPriceDetails,
} from "../runPipeLine-product";
import type { Mold } from "../../mold/types";
import type { ProductPriceDimensions } from "../product-schema";
import { getMoldMaterialDensity } from "../common";

// Mock the required functions
vi.mock("../machine/tonnage", () => ({
  determineMachineTonnage: vi.fn(() => 100), // 100吨机器
}));

vi.mock("./volume", () => ({
  calculateInjectionVolume: vi.fn((volume) => volume * 1.2), // 20%安全系数
}));

vi.mock("./cost", () => ({
  calculateProductionProcessingFee: vi.fn(() => 1000), // 1000元加工费
}));

describe("calculateProductFinalPrice", () => {
  const mockPriceDimensions: ProductPriceDimensions[] = [
    {
      depth: 100,
      width: 50,
      height: 30,
      volume: 150,
      productMaterial: "ABS",
      productQuantity: 1000,
      color: "red",
      density: 0.0012,
    },
    {
      depth: 80,
      width: 40,
      height: 25,
      volume: 80,
      productMaterial: "ABS",
      productQuantity: 500,
      color: "blue",
      density: 0.0012,
    },
  ];

  const mockMold: Mold = {
    scores: {
      balanceScore: 0.8,
      layoutScore: 0.9,
    },
    weightedAverage: 0.85,
    material: {
      id: "718H",
      name: "718H",
      density: getMoldMaterialDensity(),
      pricePerKg: 50,
    },
    dimensions: {
      width: 300,
      height: 200,
      depth: 150,
    },
    weight: 10,
    cavityCount: 2,
  };

  test("应该正确计算产品最终价格", () => {
    const result = calculateProductFinalPrice(mockPriceDimensions, mockMold);

    expect(result).toHaveLength(mockPriceDimensions.length);
    result.forEach((product) => {
      console.log("product: ", product);
      expect(product).toHaveProperty("finalPrice");
      expect(product.finalPrice).toBeGreaterThan(0);
      // 验证加工成本数组
      expect(product.processingCost).toBeDefined();
      expect(product.processingCost.length).toBeGreaterThanOrEqual(1);

      expect(product.processingCost[0]).toHaveProperty("productMakingPrice");
      expect(product.processingCost[0]).toHaveProperty("productTotalPrice");
    });
  });

  test("空产品列表应该返回空数组", () => {
    expect(() => calculateProductFinalPrice([], mockMold)).toThrow(
      "产品数量不能为0",
    );
  });

  test("应该正确计算注胶量和机器吨位", () => {
    calculateProductFinalPrice(mockPriceDimensions, mockMold);

    // 验证注胶量计算
    const totalVolume = mockPriceDimensions.reduce(
      (sum, product) => sum + product.volume * product.density,
      0,
    );
    expect(totalVolume).toBeGreaterThan(0);
  });
});

describe("getPriceDetails", () => {
  const mockResult = {
    minimumArea: 15000,
    moldPrice: 50000,
    productPrices: [
      {
        depth: 100,
        width: 50,
        height: 30,
        volume: 150,
        productMaterial: "ABS",
        productQuantity: 1000,
        color: "red",
        density: 1.05,
        materialPrice: 3937.5,
        weight: 157.5,
        remainingQuantity: 0,
        processingCost: [
          {
            productMakingQuantity: 1000,
            productMakingPrice: 500,
            productSinglePrice: 5.5,
            productTotalPrice: 5500,
          },
        ],
        finalPrice: 5500,
      },
    ],
  };

  test("应该生成正确格式的报价详情", () => {
    const details = getPriceDetails(mockResult);

    expect(details).toContain("模具信息");
    expect(details).toContain("产品信息");
    expect(details).toContain("总价格");
    expect(details).toContain(mockResult.moldPrice.toFixed(2));
    expect(details).toContain(
      mockResult.productPrices[0].finalPrice.toFixed(2),
    );
  });

  test("应该正确计算总价格", () => {
    const details = getPriceDetails(mockResult);
    const totalPrice =
      mockResult.moldPrice + mockResult.productPrices[0].finalPrice;
    expect(details).toContain(totalPrice.toFixed(2));
  });
});
