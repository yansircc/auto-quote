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
        quantity: 20000,
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
import { evaluateSolution } from "../evaluator";

describe("interesting", () => {
  const mockMold: MoldProps = {
    materialName: "P20",
  };

  const mockForceOptions: ForceOptions = {
    isForceColorSimultaneous: false,
    isForceMaterialSimultaneous: false,
  };

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

  it("should be interesting", () => {
    const result = calculateSolutionPrice(products, mockMold, mockForceOptions);
    console.log("result", result);
    expect(result).toEqual(93867.38862041675);
  });

  it("should be interesting", () => {
    const result = evaluateSolution(products);
    console.log("result", result);
    expect(result.isPass).toEqual(true);
  });
});
