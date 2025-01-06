import { describe, it, expect } from "vitest";
import {
  searchBestCavityCount,
  type ProductProps,
  type MoldProps,
} from "../search-cavity";
import type { ForceOptions } from "@/lib/quote-price/core";

describe("searchBestCavityCount", () => {
  const mockMold: MoldProps[] = [
    {
      materialName: "P20",
    },
  ];

  const mockForceOptions: ForceOptions = {
    isForceColorSimultaneous: false,
    isForceMaterialSimultaneous: false,
  };

  it("应该正确处理单个产品", () => {
    const products: ProductProps[] = [
      {
        id: 1,
        materialName: "ABS",
        netVolume: 100,
        dimensions: { width: 100, depth: 100, height: 100 },
        color: "red",
        quantity: 100,
      },
    ];

    const result = searchBestCavityCount(products, mockMold, mockForceOptions);

    expect(result).toHaveLength(3);
    expect(result[0]!.breakdown[0]!.productCavityMap).toEqual([
      { productId: 1, cavityCount: 3 },
    ]);
    expect(result[0]!.total).toBeGreaterThan(0);
    expect(result[0]!.breakdown[0]!.layoutScore).toBeGreaterThanOrEqual(0);
    expect(result[0]!.breakdown[0]!.riskScore).toBeGreaterThanOrEqual(0);
    expect(result[0]!.breakdown[0]!.isPass).toBe(true);
  });

  it("应该正确处理多个(> 6)相同产品", () => {
    const products: ProductProps[] = Array.from({ length: 7 }, (_, i) => ({
      id: i + 1,
      materialName: "ABS",
      netVolume: 100,
      dimensions: { width: 10, depth: 10, height: 10 },
      color: "red",
      quantity: 100,
    }));

    const result = searchBestCavityCount(products, mockMold, mockForceOptions);

    expect(result).toHaveLength(3);
    expect(result[0]!.breakdown[0]!.productCavityMap).toEqual([
      { productId: 1, cavityCount: 1 },
      { productId: 2, cavityCount: 1 },
      { productId: 3, cavityCount: 1 },
      { productId: 4, cavityCount: 1 },
      { productId: 5, cavityCount: 1 },
      { productId: 6, cavityCount: 1 },
      { productId: 7, cavityCount: 1 },
    ]);
    expect(result[0]!.total).toBeGreaterThan(0);
    expect(result[0]!.breakdown[0]!.layoutScore).toBeGreaterThanOrEqual(0);
    expect(result[0]!.breakdown[0]!.riskScore).toBeGreaterThanOrEqual(0);
    expect(result[0]!.breakdown[0]!.isPass).toBe(true);
  });

  it("应该正确处理不同材料的产品", () => {
    const products: ProductProps[] = [
      {
        id: 1,
        materialName: "ABS",
        netVolume: 100,
        dimensions: { width: 100, depth: 100, height: 100 },
        color: "red",
        quantity: 100,
      },
      {
        id: 2,
        materialName: "ASA",
        netVolume: 100,
        dimensions: { width: 100, depth: 100, height: 100 },
        color: "red",
        quantity: 100,
      },
      {
        id: 3,
        materialName: "GPPS",
        netVolume: 100,
        dimensions: { width: 100, depth: 100, height: 100 },
        color: "red",
        quantity: 100,
      },
    ];

    const result = searchBestCavityCount(products, mockMold, mockForceOptions);

    expect(result).toHaveLength(3);
    expect(result[0]!.breakdown[0]!.productCavityMap).toEqual([
      { productId: 1, cavityCount: 1 },
      { productId: 2, cavityCount: 1 },
      { productId: 3, cavityCount: 1 },
    ]);
    expect(result[0]!.total).toBeGreaterThan(0);
    expect(result[0]!.breakdown[0]!.layoutScore).toBeGreaterThanOrEqual(0);
    expect(result[0]!.breakdown[0]!.riskScore).toBeGreaterThanOrEqual(0);
    expect(result[0]!.breakdown[0]!.isPass).toBe(true);
  });

  it("应该正确处理数量成比例的产品", () => {
    const products: ProductProps[] = [
      {
        id: 1,
        materialName: "ABS",
        netVolume: 10000,
        dimensions: { width: 100, depth: 100, height: 100 },
        color: "red",
        quantity: 10000,
      },
      {
        id: 2,
        materialName: "ABS",
        netVolume: 10000,
        dimensions: { width: 100, depth: 100, height: 100 },
        color: "red",
        quantity: 30000,
      },
    ];

    const result = searchBestCavityCount(products, mockMold, mockForceOptions);

    expect(result).toHaveLength(3);
    expect(result[0]!.breakdown[0]!.productCavityMap).toEqual([
      { productId: 1, cavityCount: 1 },
      { productId: 2, cavityCount: 3 },
    ]);
    expect(result[0]!.total).toBeGreaterThan(0);
    expect(result[0]!.breakdown[0]!.layoutScore).toBeGreaterThanOrEqual(0);
    expect(result[0]!.breakdown[0]!.riskScore).toBeGreaterThanOrEqual(0);
    expect(result[0]!.breakdown[0]!.isPass).toBe(true);
  });

  it("应该正确处理不同颜色的产品", () => {
    const products: ProductProps[] = [
      {
        id: 1,
        materialName: "ABS",
        netVolume: 100,
        dimensions: { width: 10, depth: 10, height: 10 },
        color: "red",
        quantity: 100,
      },
      {
        id: 2,
        materialName: "ABS",
        netVolume: 100,
        dimensions: { width: 10, depth: 10, height: 10 },
        color: "blue",
        quantity: 100,
      },
    ];

    const result = searchBestCavityCount(products, mockMold, mockForceOptions);

    expect(result).toHaveLength(3);
    expect(result[0]!.breakdown[0]!.productCavityMap).toEqual([
      { productId: 1, cavityCount: 1 },
      { productId: 2, cavityCount: 1 },
    ]);
    expect(result[0]!.total).toBeGreaterThan(0);
    expect(result[0]!.breakdown[0]!.layoutScore).toBeGreaterThanOrEqual(0);
    expect(result[0]!.breakdown[0]!.riskScore).toBeGreaterThanOrEqual(0);
    expect(result[0]!.breakdown[0]!.isPass).toBe(true);
  });

  it("应该正确处理空产品列表", () => {
    const products: ProductProps[] = [];

    expect(() =>
      searchBestCavityCount(products, mockMold, mockForceOptions),
    ).toThrow();
  });

  it("应该正确处理产品数量超过7", () => {
    const products: ProductProps[] = Array.from({ length: 8 }, (_, i) => ({
      id: i + 1,
      materialName: "ABS",
      netVolume: 100,
      dimensions: { width: 10, depth: 10, height: 10 },
      color: "red",
      quantity: 100,
    }));

    expect(() =>
      searchBestCavityCount(products, mockMold, mockForceOptions),
    ).toThrow();
  });

  it("应该正确处理无效的产品ID", () => {
    const products: ProductProps[] = [
      {
        id: null as unknown as number,
        materialName: "ABS",
        netVolume: 100,
        dimensions: { width: 10, depth: 10, height: 10 },
        color: "red",
        quantity: 100,
      },
    ];

    expect(() =>
      searchBestCavityCount(products, mockMold, mockForceOptions),
    ).toThrow();
  });
});
