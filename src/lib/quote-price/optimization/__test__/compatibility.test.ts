import { describe, expect, it } from "vitest";
import { checkGroupCompatibility } from "../compatibility";
import type { ForceOptions } from "../../core";

describe("产品组合兼容性检查", () => {
  it("应该返回 true 当所有产品颜色和材料都相同", () => {
    const sameProducts = [
      { materialName: "ABS", color: "red" },
      { materialName: "ABS", color: "red" },
    ];
    expect(checkGroupCompatibility(sameProducts)).toBe(true);
  });

  it("应该返回 false 当产品颜色不同且未强制颜色兼容", () => {
    const differentColorProducts = [
      { materialName: "ABS", color: "red" },
      { materialName: "ABS", color: "blue" },
    ];
    expect(checkGroupCompatibility(differentColorProducts)).toBe(false);
  });

  it("应该返回 false 当产品材料不同且未强制材料兼容", () => {
    const differentMaterialProducts = [
      { materialName: "ABS", color: "red" },
      { materialName: "PC", color: "red" },
    ];
    expect(checkGroupCompatibility(differentMaterialProducts)).toBe(false);
  });

  it("应该返回 true 当强制颜色兼容且颜色不同", () => {
    const forceColorOptions: ForceOptions = {
      isForceColorSimultaneous: true,
      isForceMaterialSimultaneous: false,
    };
    const differentColorProducts = [
      { materialName: "ABS", color: "red" },
      { materialName: "ABS", color: "blue" },
    ];
    expect(
      checkGroupCompatibility(differentColorProducts, forceColorOptions),
    ).toBe(true);
  });

  it("应该返回 true 当强制材料兼容且材料不同", () => {
    const forceMaterialOptions: ForceOptions = {
      isForceColorSimultaneous: false,
      isForceMaterialSimultaneous: true,
    };
    const differentMaterialProducts = [
      { materialName: "ABS", color: "red" },
      { materialName: "PC", color: "red" },
    ];
    expect(
      checkGroupCompatibility(differentMaterialProducts, forceMaterialOptions),
    ).toBe(true);
  });

  it("应该抛出错误当产品列表为空", () => {
    expect(() => checkGroupCompatibility([])).toThrow("产品列表不能为空");
  });

  it("应该返回 true 当只有一个产品", () => {
    const singleProduct = [{ materialName: "ABS", color: "red" }];
    expect(checkGroupCompatibility(singleProduct)).toBe(true);
  });
});
