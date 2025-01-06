import { describe, expect, it } from "vitest";
import { getExtraProcessFee } from "../extra-process-fee";

describe("额外加工费计算", () => {
  it("应该正确处理 P20 材料", () => {
    expect(getExtraProcessFee("P20")).toBe(0);
  });

  it("应该正确处理 NAK80 材料", () => {
    expect(getExtraProcessFee("NAK80")).toBe(15);
  });

  it("应该正确处理 718H 材料", () => {
    expect(getExtraProcessFee("718H")).toBe(5);
  });

  it("应该正确处理 H13 材料", () => {
    expect(getExtraProcessFee("H13")).toBe(25);
  });

  it("应该正确处理 S136 材料", () => {
    expect(getExtraProcessFee("S136")).toBe(25);
  });

  it("应该抛出错误当材料不存在", () => {
    expect(() => getExtraProcessFee("UNKNOWN")).toThrow("材料 UNKNOWN 不存在");
  });

  it("应该正确处理所有定义的材料", () => {
    const materials = ["P20", "NAK80", "718H", "H13", "S136"];
    materials.forEach((material) => {
      expect(() => getExtraProcessFee(material)).not.toThrow();
    });
  });
});
