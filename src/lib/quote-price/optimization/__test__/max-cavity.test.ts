import { describe, it, expect } from "vitest";
import { getAllMaxCavityCount, type ProductProps } from "../max-cavity";
import type { Dimensions } from "@/lib/quote-price/core";

describe("getAllMaxCavityCount", () => {
  // 测试模具的极限尺寸
  const maxDimensions: Dimensions = {
    width: 1000,
    depth: 1000,
    height: 1000,
  };

  // 测试模具的最大承重
  const maxInjectionWeight = 5000;

  it("应正确处理单个产品", () => {
    // 单个产品的情况
    const products: ProductProps[] = [
      {
        id: 1,
        materialName: "ABS",
        netVolume: 100,
        dimensions: { width: 100, depth: 100, height: 100 },
      },
    ];

    const result = getAllMaxCavityCount(
      products,
      maxDimensions,
      maxInjectionWeight,
    );
    expect(result).toEqual({ 1: 29 });
  });

  it("应正确处理多个产品", () => {
    // 多个产品的情况
    const products: ProductProps[] = [
      {
        id: 1,
        materialName: "ABS",
        netVolume: 100,
        dimensions: { width: 100, depth: 100, height: 100 },
      },
      {
        id: 2,
        materialName: "PBT+GF",
        netVolume: 200,
        dimensions: { width: 150, depth: 150, height: 150 },
      },
    ];

    const result = getAllMaxCavityCount(
      products,
      maxDimensions,
      maxInjectionWeight,
    );
    expect(result).toEqual({ 1: 27, 2: 15 }); // 预期结果根据算法逻辑
  });

  it("应抛出错误当产品尺寸超出模具限制", () => {
    // 产品尺寸超出模具限制的情况
    const products: ProductProps[] = [
      {
        id: 1,
        materialName: "ABS",
        netVolume: 100,
        dimensions: { width: 1200, depth: 1200, height: 1200 },
      },
    ];

    expect(() =>
      getAllMaxCavityCount(products, maxDimensions, maxInjectionWeight),
    ).toThrow("产品最大边 1200 超出模具宽度 710 或深度 710");
  });

  it("应抛出错误当产品高度超出模具限制", () => {
    // 产品高度超出模具限制的情况
    const products: ProductProps[] = [
      {
        id: 1,
        materialName: "ABS",
        netVolume: 100,
        dimensions: { width: 100, depth: 100, height: 1200 },
      },
    ];

    expect(() =>
      getAllMaxCavityCount(products, maxDimensions, maxInjectionWeight),
    ).toThrow("产品最大高度 1200 超出模具高度 490");
  });

  it("应正确处理空产品列表", () => {
    // 空产品列表的情况
    const products: ProductProps[] = [];
    const result = getAllMaxCavityCount(
      products,
      maxDimensions,
      maxInjectionWeight,
    );
    expect(result).toEqual({});
  });

  it("应考虑材料密度计算最大穴数", () => {
    // 测试材料密度对最大穴数的影响
    const products: ProductProps[] = [
      {
        id: 1,
        materialName: "ABS", // 密度较低 (约 1.04 g/cm³)
        netVolume: 500000, // 增加体积以放大密度差异的影响
        dimensions: { width: 100, depth: 100, height: 100 },
      },
      {
        id: 2,
        materialName: "PBT+GF", // 密度较高 (约 1.52 g/cm³)
        netVolume: 500000, // 增加体积以放大密度差异的影响
        dimensions: { width: 100, depth: 100, height: 100 },
      },
    ];

    const result = getAllMaxCavityCount(
      products,
      maxDimensions,
      maxInjectionWeight,
    );

    // 验证 ABS 的穴数大于 PBT+GF
    expect(result[1]).toBeGreaterThan(result[2]!);
  });
});
