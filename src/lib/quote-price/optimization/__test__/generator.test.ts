import { describe, it, expect } from "vitest";
import { generateGrouping } from "../group-generator";

interface ProductProps {
  materialName: string;
  color: string;
}

interface ForceOptions {
  isForceColorSimultaneous: boolean;
  isForceMaterialSimultaneous: boolean;
}

describe("分组算法测试", () => {
  // 测试用例 1: 空数组
  it("当输入为空时，返回空数组", () => {
    const products: ProductProps[] = [];
    const result = generateGrouping(products);
    expect(result).toEqual([[]]);
  });

  // 测试用例 2: 单个产品
  it("当输入为单个产品时，返回单个分组", () => {
    const products = [{ materialName: "wood", color: "red" }];
    const result = generateGrouping(products);
    expect(result).toEqual([[[products[0]]]]);
  });

  // 测试用例 3: 两个完全相同的产品
  it("当输入为两个完全相同的产品时，返回两个分组", () => {
    const products = [
      { materialName: "wood", color: "red" },
      { materialName: "wood", color: "red" },
    ];
    const result = generateGrouping(products);
    expect(result).toEqual([
      [[products[0], products[1]]],
      [[products[0]], [products[1]]],
    ]);
  });

  // 测试用例 4: 两个不同材料的产品
  it("当输入为两个不同材料的产品时，返回两个分组", () => {
    const products = [
      { materialName: "wood", color: "red" },
      { materialName: "metal", color: "red" },
    ];
    const result = generateGrouping(products);
    expect(result).toEqual([[[products[0]], [products[1]]]]);
  });

  // 测试用例 5: 强制颜色相同的情况
  it("当强制颜色相同时，返回两个分组", () => {
    const products = [
      { materialName: "wood", color: "red" },
      { materialName: "wood", color: "blue" },
    ];
    const forceOptions: ForceOptions = {
      isForceColorSimultaneous: true,
      isForceMaterialSimultaneous: false,
    };
    const result = generateGrouping(products, forceOptions);
    expect(result).toEqual([
      [[products[0], products[1]]],
      [[products[0]], [products[1]]],
    ]);
  });

  // 测试用例 6: 强制材料相同的情况
  it("当强制材料相同时，返回两个分组", () => {
    const products = [
      { materialName: "wood", color: "red" },
      { materialName: "metal", color: "red" },
    ];
    const forceOptions: ForceOptions = {
      isForceMaterialSimultaneous: true,
      isForceColorSimultaneous: false,
    };
    const result = generateGrouping(products, forceOptions);
    expect(result).toEqual([
      [[products[0], products[1]]],
      [[products[0]], [products[1]]],
    ]);
  });

  // 测试用例 7: 三个产品的复杂情况
  it("当输入为三个产品时，返回三个分组", () => {
    const products: ProductProps[] = [
      { materialName: "wood", color: "red" },
      { materialName: "wood", color: "blue" },
      { materialName: "metal", color: "red" },
    ];
    const result = generateGrouping(products);
    expect(result).toEqual([[[products[0]], [products[1]], [products[2]]]]);
  });
});
