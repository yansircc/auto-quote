import { describe, expect, it } from "vitest";
import { runPipeline } from "../pipeline";
import type { ForceOptions } from "../core";

describe("报价主流程测试", () => {
  const testProducts = [
    {
      materialName: "ABS",
      quantity: 100,
      color: "red",
      dimensions: { width: 100, depth: 100, height: 50 },
      netVolume: 83.33,
      cavityIndex: 0,
    },
    {
      materialName: "PC",
      quantity: 200,
      color: "blue",
      dimensions: { width: 150, depth: 150, height: 75 },
      netVolume: 166.67,
      cavityIndex: 1,
    },
  ];

  const testMold = {
    materialName: "P20",
    cavities: { "0": 1, "1": 2 },
  };

  const testForceOptions: ForceOptions = {
    isForceColorSimultaneous: false,
    isForceMaterialSimultaneous: true,
  };

  it("应该正确计算正常流程的总价", () => {
    const totalPrice = runPipeline(testProducts, testMold);
    expect(totalPrice).toBeGreaterThan(0);
  });

  it("应该处理强制选项", () => {
    const totalPrice = runPipeline(testProducts, testMold, testForceOptions);
    expect(totalPrice).toBeGreaterThan(0);
  });

  it("应该处理单个产品的情况", () => {
    const singleProduct = [testProducts[0]!];
    const totalPrice = runPipeline(singleProduct, testMold);
    expect(totalPrice).toBeGreaterThan(0);
  });

  it("应该处理极端尺寸的产品", () => {
    const smallProduct = {
      ...testProducts[0]!,
      dimensions: { width: 1, depth: 1, height: 1 },
    };
    const largeProduct = {
      ...testProducts[1]!,
      dimensions: { width: 1000, depth: 300, height: 210 }, // 深度设为300是为了防止重量溢出
    };

    const smallPrice = runPipeline([smallProduct], testMold);
    const largePrice = runPipeline([largeProduct], testMold);

    expect(smallPrice).toBeGreaterThan(0);
    expect(largePrice).toBeGreaterThan(0);
    expect(largePrice).toBeGreaterThan(smallPrice);
  });

  it("应该处理不同材料的产品", () => {
    const materials = ["ABS", "PC", "PP"];
    const products = materials.map((material) => ({
      ...testProducts[0]!,
      materialName: material,
    }));

    const totalPrice = runPipeline(products, testMold);
    expect(totalPrice).toBeGreaterThan(0);
  });

  it("应该抛出错误当产品数量为负数", () => {
    const invalidProduct = { ...testProducts[0]!, quantity: -1 };
    expect(() => runPipeline([invalidProduct], testMold)).toThrow();
  });

  it("应该处理零数量的产品", () => {
    const zeroQuantityProduct = { ...testProducts[0]!, quantity: 0 };
    const totalPrice = runPipeline([zeroQuantityProduct], testMold);
    expect(totalPrice).toBeGreaterThanOrEqual(0);
  });
});
