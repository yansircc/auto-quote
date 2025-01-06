import { describe, expect, it } from "vitest";
import { getProductGrossProfit } from "../gross-profit";

describe("产品毛利计算", () => {
  it("应该正确获取 ABS 的毛利", () => {
    expect(getProductGrossProfit("ABS")).toBe(0.5);
  });

  it("应该正确获取 PC 的毛利", () => {
    expect(getProductGrossProfit("PC")).toBe(0.5);
  });

  it("应该抛出错误当材料不存在时", () => {
    expect(() => getProductGrossProfit("UnknownMaterial")).toThrow(
      "没有找到产品材料: UnknownMaterial",
    );
  });
});
