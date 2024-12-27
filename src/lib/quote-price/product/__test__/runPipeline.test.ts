import { describe, test, expect } from "vitest";
import { runProductPricePipeline } from "../runPipeLine";
import type { Product } from "../types";
import type { MoldMaterial } from "../../materials";
import { getMoldMaterialDensity } from "../common";

describe("runProductPricePipeline", () => {
  const mockProducts: Product[] = [
    {
      id: "1",
      name: "测试产品1",
      material: {
        name: "ABS",
        density: 1.05,
        price: 25,
        shrinkageRate: 0.6,
        processingTemp: 230,
      },
      dimensions: {
        depth: 100,
        width: 50,
        height: 30,
      },
      color: "red",
      quantity: 1000,
      netVolume: 150,
      envelopeVolume: 180,
    },
    {
      id: "2",
      name: "测试产品2",
      material: {
        name: "ABS",
        density: 1.05,
        price: 25,
        shrinkageRate: 0.6,
        processingTemp: 230,
      },
      dimensions: {
        depth: 80,
        width: 40,
        height: 25,
      },
      color: "blue",
      quantity: 500,
      netVolume: 80,
      envelopeVolume: 100,
    },
  ];

  const mockMoldMaterial: MoldMaterial = {
    id: "718H",
    name: "718H",
    density: getMoldMaterialDensity(),
    pricePerKg: 50,
  };

  test("应该正确计算模具尺寸和价格", () => {
    const result = runProductPricePipeline(mockProducts, mockMoldMaterial);

    // 验证模具尺寸
    expect(result.width).toBeGreaterThan(0);
    expect(result.depth).toBeGreaterThan(0);
    expect(result.height).toBeGreaterThan(0);

    // 验证边距
    expect(result.verticalMargin).toBeGreaterThan(0);
    expect(result.horizontalMargin).toBeGreaterThan(0);

    // 验证模具材料和重量
    expect(result.moldMaterial).toBe(mockMoldMaterial.name);
    expect(result.moldWeight).toBeGreaterThanOrEqual(0);

    // 验证模具价格
    expect(result.moldPrice).toBeGreaterThan(0);
  });

  test("空产品列表应该抛出错误", () => {
    expect(() => runProductPricePipeline([], mockMoldMaterial)).toThrow(
      "产品列表不能为空",
    );
  });

  test("应该正确处理多个产品的布局", () => {
    const result = runProductPricePipeline(mockProducts, mockMoldMaterial);

    // 验证模具尺寸能容纳所有产品
    const totalProductWidth = Math.max(
      ...mockProducts.map((p) => p.dimensions.width),
    );
    const totalProductHeight = Math.max(
      ...mockProducts.map((p) => p.dimensions.height),
    );

    expect(result.width).toBeGreaterThan(totalProductWidth);
    expect(result.height).toBeGreaterThan(totalProductHeight);
  });

  test("应该考虑模具边距", () => {
    const result = runProductPricePipeline(mockProducts, mockMoldMaterial);

    // 验证边距是否合理
    expect(result.verticalMargin).toBeGreaterThanOrEqual(
      Math.min(result.width, result.depth) * 0.1,
    );
    expect(result.horizontalMargin).toBeGreaterThanOrEqual(
      Math.min(result.width, result.depth) * 0.1,
    );
  });

  test("应该正确计算模具重量和价格", () => {
    const result = runProductPricePipeline(mockProducts, mockMoldMaterial);

    // 验证模具重量计算
    expect(result.moldWeight).toBeGreaterThan(65.93);

    // 验证模具价格计算
    const materialCost = result.moldWeight * mockMoldMaterial.pricePerKg;
    expect(result.moldPrice).toBeGreaterThan(materialCost);
  });
});
