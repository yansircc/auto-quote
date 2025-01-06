import { describe, expect, it } from "vitest";
import { calculateMoldCosts } from "../cost";
import type { Dimensions, MoldMaterial } from "../../core";

describe("模具总价计算", () => {
  const testMaterial: MoldMaterial = {
    name: "P20",
    density: 0.00000785,
    pricePerKg: 0.013,
  };

  const testDimensions: Dimensions = {
    width: 200,
    depth: 200,
    height: 100,
  };

  it("应该正确计算小型模具价格", () => {
    const dimensions: Dimensions = { width: 100, depth: 100, height: 50 };
    const { total: price } = calculateMoldCosts(dimensions, testMaterial);
    expect(price).toBeGreaterThan(0);
  });

  it("应该正确计算中型模具价格", () => {
    const dimensions: Dimensions = { width: 300, depth: 300, height: 150 };
    const { total: price } = calculateMoldCosts(dimensions, testMaterial);
    expect(price).toBeGreaterThan(0);
  });

  it("应该正确计算大型模具价格", () => {
    const dimensions: Dimensions = { width: 500, depth: 500, height: 250 };
    const { total: price } = calculateMoldCosts(dimensions, testMaterial);
    expect(price).toBeGreaterThan(0);
  });

  it("应该正确处理边界尺寸", () => {
    const dimensions: Dimensions = { width: 1000, depth: 1000, height: 500 };
    const { total: price } = calculateMoldCosts(dimensions, testMaterial);
    expect(price).toBeGreaterThan(0);
  });

  it("应该抛出错误当尺寸为负数", () => {
    const invalidDimensions: Dimensions = { width: -1, depth: 100, height: 50 };
    expect(() => calculateMoldCosts(invalidDimensions, testMaterial)).toThrow();
  });

  it("应该正确处理不同材料的价格差异", () => {
    const materials: MoldMaterial[] = [
      { name: "P20", density: 0.00000785, pricePerKg: 0.013 },
      { name: "NAK80", density: 0.00000785, pricePerKg: 0.015 },
      { name: "718H", density: 0.00000785, pricePerKg: 0.014 },
    ];

    materials.forEach((material) => {
      const { total: price } = calculateMoldCosts(testDimensions, material);
      expect(price).toBeGreaterThan(0);
    });
  });

  it("应该正确处理极端尺寸", () => {
    const smallDimensions: Dimensions = { width: 1, depth: 1, height: 1 };
    const largeDimensions: Dimensions = {
      width: 1000,
      depth: 1000,
      height: 500,
    };

    const { total: smallPrice } = calculateMoldCosts(
      smallDimensions,
      testMaterial,
    );
    const { total: largePrice } = calculateMoldCosts(
      largeDimensions,
      testMaterial,
    );

    expect(smallPrice).toBeGreaterThan(0);
    expect(largePrice).toBeGreaterThan(0);
    expect(largePrice).toBeGreaterThan(smallPrice);
  });
});
