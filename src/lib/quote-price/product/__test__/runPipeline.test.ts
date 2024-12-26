import { describe, test, expect, vi } from "vitest";
import { runProductPricePipeline } from "../runPipeLine";
import type { Product } from "../types";
import type { MoldMaterial } from "../../materials";
import { g } from "vitest/dist/suite-IbNSsUWN.js";
import { getMoldMaterialDensity } from "../common";

// Mock required functions
vi.mock("../../materials", () => ({
  getMoldMaterial: vi.fn(() => ({
    id: "718H",
    name: "718H",
    density: 7.85,
    pricePerKg: 50,
  })),
}));

vi.mock("../mold/layout", () => ({
  runAllScorers: vi.fn(() => ({
    weightedAverage: 0.85,
    balanceScore: 0.8,
    layoutScore: 0.9,
  })),
}));

vi.mock("../mold/cost", () => ({
  calculateMoldMaterialCost: vi.fn(() => 5000),
  calculateMaintenanceFee: vi.fn(() => 2000),
  calculateProcessingFee: vi.fn(() => 3000),
  calculateGrossProfit: vi.fn(() => 2000),
}));

describe("runProductPricePipeline", () => {
  const mockProducts: Product[] = [
    {
      id: "1",
      name: "测试产品1",
      material: {
        name: "ABS",
        density: 0.0012,
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
        density: 0.0012,
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
    expect(result.moldWeight).toBeGreaterThan(0);

    // 验证模具价格
    expect(result.moldPrice).toBe(14035.031); // 5000 + 2000 + 3000 + 2000
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

  test("应该包含正确的评分信息", () => {
    const result = runProductPricePipeline(mockProducts, mockMoldMaterial);

    expect(result.scores).toBeDefined();
    const weightedAverage = result.weightedAverage?.toFixed(3) ?? "";
    expect(Number(weightedAverage)).toBe(48.641);
    expect(result.scores).toEqual({
      aspectRatio: 24.477105357456065,
      distance: 44.978407597329515,
      momentum: 20.66741354574514,
      position: 56.45337394901311,
      shapeSimilarity: 56.619983191846735,
      spaceUtilization: 72.67767916719998,
      spacing: 60.83156256074968,
      symmetry: 80.83757245215422,
      uniformity: 44.07270197278524,
    });
  });

  test("应该正确计算内部尺寸和边距", () => {
    const result = runProductPricePipeline(mockProducts, mockMoldMaterial);

    // 验证内部尺寸
    expect(result.maxInnerLength).toBeGreaterThan(0);
    expect(result.maxInnerWidth).toBeGreaterThan(0);

    // 验证边距合理性
    expect(result.verticalMargin).toBe(result.horizontalMargin);
    expect(result.verticalMargin).toBeGreaterThanOrEqual(
      Math.min(result.width, result.depth) * 0.1,
    );
  });

  test("应该正确处理模具重量计算", () => {
    const result = runProductPricePipeline(mockProducts, mockMoldMaterial);

    // 验证模具重量计算的合理性
    const volume = result.width * result.depth * result.height;
    expect(result.moldWeight).toBeGreaterThan(0);
    expect(result.moldWeight).toBeLessThan(volume * mockMoldMaterial.density); // 重量应该小于实心体积
  });
});
