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

  // it("应该正确处理数量成比例的产品", () => {
  //   const products: ProductProps[] = [
  //     {
  //       id: 1,
  //       materialName: "ABS",
  //       netVolume: 1000,
  //       dimensions: { width: 100, depth: 100, height: 100 },
  //       color: "red",
  //       quantity: 10000,
  //     },
  //     {
  //       id: 2,
  //       materialName: "ABS",
  //       netVolume: 1000,
  //       dimensions: { width: 100, depth: 100, height: 100 },
  //       color: "red",
  //       quantity: 30000,
  //     },
  //   ];

  //   const result = searchBestCavityCount(products, mockMold, mockForceOptions);

  //   expect(result[0]!.productCavityMap).toEqual([
  //     { productId: 1, cavityCount: 1 },
  //     { productId: 2, cavityCount: 3 },
  //   ]);
  // });

  it("应该正确处理复杂情况", () => {
    const products: ProductProps[] = [
      {
        id: 1,
        materialName: "TPU",
        netVolume: 50000,
        dimensions: { width: 100, depth: 100, height: 100 },
        color: "red",
        quantity: 20000,
      },
      {
        id: 2,
        materialName: "PVC",
        netVolume: 50000,
        dimensions: { width: 100, depth: 100, height: 100 },
        color: "red",
        quantity: 55000,
      },
    ];

    const result = searchBestCavityCount(products, mockMold, mockForceOptions);

    expect(result[0]!.total).toEqual(1);
  });
});
