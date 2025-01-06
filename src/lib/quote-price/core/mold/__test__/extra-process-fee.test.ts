import { describe, expect, it } from "vitest";
import { getExtraProcessFeeMultiple } from "../extra-process-fee";

describe("额外加工费计算", () => {
  it("应该正确处理 P20 材料", () => {
    expect(getExtraProcessFeeMultiple("P20")).toBe(0);
  });

  it("应该正确处理 NAK80 材料", () => {
    expect(getExtraProcessFeeMultiple("NAK80")).toBe(1.5);
  });

  it("应该正确处理 718H 材料", () => {
    expect(getExtraProcessFeeMultiple("718H")).toBe(0.5);
  });

  it("应该正确处理 H13 材料", () => {
    expect(getExtraProcessFeeMultiple("H13")).toBe(2.5);
  });

  it("应该正确处理 S136 材料", () => {
    expect(getExtraProcessFeeMultiple("S136")).toBe(2.5);
  });

  it("应该抛出错误当材料不存在", () => {
    expect(() => getExtraProcessFeeMultiple("UNKNOWN")).toThrow(
      "材料 UNKNOWN 不存在",
    );
  });

  it("应该正确处理所有定义的材料", () => {
    const materials = ["P20", "NAK80", "718H", "H13", "S136"];
    materials.forEach((material) => {
      expect(() => getExtraProcessFeeMultiple(material)).not.toThrow();
    });
  });
});
