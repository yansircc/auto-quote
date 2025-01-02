import { describe, it, expect } from "vitest";
import {
  searchBestCavityCount,
  type ProductProps,
  type MoldProps,
} from "../search-cavity";
import type { ForceOptions } from "@/lib/quote-price/core";

describe("searchBestCavityCount", () => {
  const mockMold: MoldProps = {
    materialName: "P20",
  };

  const mockForceOptions: ForceOptions = {
    isForceColorSimultaneous: false,
    isForceMaterialSimultaneous: false,
  };

  it("应该正确处理数量成比例的产品", () => {
    const products: ProductProps[] = [
      {
        id: 1,
        materialName: "ABS",
        netVolume: 1000,
        dimensions: { width: 100, depth: 100, height: 100 },
        color: "red",
        quantity: 10000,
      },
      {
        id: 2,
        materialName: "ABS",
        netVolume: 1000,
        dimensions: { width: 100, depth: 100, height: 100 },
        color: "red",
        quantity: 30000,
      },
    ];

    const result = searchBestCavityCount(products, mockMold, mockForceOptions);

    expect(result[0]!.productCavityMap).toEqual([
      { productId: 1, cavityCount: 1 },
      { productId: 2, cavityCount: 3 },
    ]);
  });
});

import { calculateSolutionPrice } from "../solution-price";

describe("interesting", () => {
  const mockMold: MoldProps = {
    materialName: "P20",
  };

  const mockForceOptions: ForceOptions = {
    isForceColorSimultaneous: false,
    isForceMaterialSimultaneous: false,
  };

  it("should be interesting", () => {
    const products = [
      {
        id: 1,
        materialName: "ABS",
        netVolume: 1000,
        dimensions: { width: 100, depth: 100, height: 100 },
        color: "red",
        quantity: 10000,
        cavityCount: 1,
      },
      {
        id: 2,
        materialName: "ABS",
        netVolume: 1000,
        dimensions: { width: 100, depth: 100, height: 100 },
        color: "red",
        quantity: 30000,
        cavityCount: 3,
      },
    ];

    const result = calculateSolutionPrice(products, mockMold, mockForceOptions);
    expect(result).toEqual(43525.98234613117); // Expected price from search
  });
});
