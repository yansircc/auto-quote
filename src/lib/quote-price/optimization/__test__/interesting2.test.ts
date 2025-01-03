import { describe, it, expect } from "vitest";
import { type MoldProps } from "../search-cavity";
import type { ForceOptions } from "@/lib/quote-price/core";

import { calculateSolutionPrice } from "../solution-price";

describe("interesting", () => {
  const mockMold: MoldProps = {
    materialName: "P20",
  };

  const mockForceOptions: ForceOptions = {
    isForceColorSimultaneous: false,
    isForceMaterialSimultaneous: false,
  };

  // it("简单2个产品，成比例", () => {
  //   const products = [
  //     {
  //       id: 1,
  //       materialName: "ABS",
  //       netVolume: 1000,
  //       dimensions: { width: 100, depth: 100, height: 100 },
  //       color: "red",
  //       quantity: 10000,
  //       cavityCount: 1,
  //     },
  //     {
  //       id: 2,
  //       materialName: "ABS",
  //       netVolume: 1000,
  //       dimensions: { width: 100, depth: 100, height: 100 },
  //       color: "red",
  //       quantity: 30000,
  //       cavityCount: 3,
  //     },
  //   ];

  //   const result = calculateSolutionPrice(products, mockMold, mockForceOptions);
  //   expect(result).toEqual(58560.23249999999); // Expected price from search
  // });

  it("复杂情况", () => {
    const products = [
      {
        id: 1,
        materialName: "TPU",
        netVolume: 5000,
        dimensions: { width: 100, depth: 100, height: 100 },
        color: "red",
        quantity: 20000,
        cavityCount: 3,
      },
      {
        id: 2,
        materialName: "PVC",
        netVolume: 5000,
        dimensions: { width: 100, depth: 100, height: 100 },
        color: "red",
        quantity: 55000,
        cavityCount: 5,
      },
    ];

    const result = calculateSolutionPrice(products, mockMold, mockForceOptions);
    expect(result).toEqual(58560.23249999999); // Expected price from search
  });
});
