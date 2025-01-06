import { describe, expect, it } from "vitest";
import { calculateProductCosts } from "../cost";
import type { MachineConfig, ForceOptions } from "../../core";

describe("产品总价计算", () => {
  const testMachineConfig: MachineConfig = {
    name: "Test Machine",
    costPerShots: 0.1,
    injection: { maxWeight: 1000, safetyFactor: 1.2 },
    mold: { maxWidth: 500, maxHeight: 500 },
    smallBatch: { threshold: 1000, rate: 1.5 },
  };

  const testProducts = [
    {
      materialName: "ABS",
      shots: 100,
      color: "red",
      quantity: 100,
      weight: 0.1,
      netVolume: 100,
      cavityCount: 1,
    },
    {
      materialName: "PC",
      shots: 50,
      color: "blue",
      quantity: 200,
      weight: 0.2,
      netVolume: 100,
      cavityCount: 1,
    },
  ];
  it("应该正确计算单个产品的总价", () => {
    const singleProduct = testProducts[0]!;
    const { total: cost } = calculateProductCosts(
      [singleProduct],
      testMachineConfig,
    );
    expect(cost).toBeGreaterThan(0);
  });

  it("应该正确计算多个产品的总价", () => {
    const { total: cost } = calculateProductCosts(
      testProducts,
      testMachineConfig,
    );
    expect(cost).toBeGreaterThan(0);
  });

  it("应该处理不同穴数的模具", () => {
    const productsWithDifferentCavities = [
      { ...testProducts[0]!, cavityIndex: 0 }, // 1 cavity
      { ...testProducts[1]!, cavityIndex: 2 }, // 4 cavities
    ];
    const { total: cost } = calculateProductCosts(
      productsWithDifferentCavities,
      testMachineConfig,
    );
    expect(cost).toBeGreaterThan(0);
  });

  it("应该处理强制选项", () => {
    const forceOptions: ForceOptions = {
      isForceColorSimultaneous: true,
      isForceMaterialSimultaneous: false,
    };
    const { total: cost } = calculateProductCosts(
      testProducts,
      testMachineConfig,
      forceOptions,
    );
    expect(cost).toBeGreaterThan(0);
  });

  it("应该抛出错误当穴数索引无效", () => {
    const invalidProducts = [{ ...testProducts[0]!, cavityCount: -1 }];
    expect(() =>
      calculateProductCosts(invalidProducts, testMachineConfig),
    ).toThrow();
  });

  it("应该处理零数量的产品", () => {
    const zeroQuantityProduct = [{ ...testProducts[0]!, quantity: 0 }];
    const { total: cost } = calculateProductCosts(
      zeroQuantityProduct,
      testMachineConfig,
    );
    expect(cost).toBeGreaterThanOrEqual(0);
  });

  it("应该处理不同材料的成本差异", () => {
    const materials = ["ABS", "PC", "PP"];
    materials.forEach((material) => {
      const product = {
        ...testProducts[0]!,
        materialName: material,
      };
      const { total: cost } = calculateProductCosts(
        [product],
        testMachineConfig,
      );
      expect(cost).toBeGreaterThan(0);
    });
  });
});
