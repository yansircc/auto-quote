import { describe, expect, it } from "vitest";
import { getMoldMaterial, moldMaterialList } from "../materials";

describe("模具材料信息获取", () => {
  it("应该正确获取 NAK80 材料信息", () => {
    const material = getMoldMaterial("NAK80");
    expect(material.name).toBe("NAK80");
    expect(material.density).toBe(0.00000785);
    expect(material.pricePerKg).toBe(0.013);
  });

  it("应该正确获取 718H 材料信息", () => {
    const material = getMoldMaterial("718H");
    expect(material.name).toBe("718H");
    expect(material.density).toBe(0.00000785);
    expect(material.pricePerKg).toBe(0.013);
  });

  it("应该正确获取 P20 材料信息", () => {
    const material = getMoldMaterial("P20");
    expect(material.name).toBe("P20");
    expect(material.density).toBe(0.00000785);
    expect(material.pricePerKg).toBe(0.013);
  });

  it("应该正确获取 H13 材料信息", () => {
    const material = getMoldMaterial("H13");
    expect(material.name).toBe("H13");
    expect(material.density).toBe(0.00000785);
    expect(material.pricePerKg).toBe(0.013);
  });

  it("应该正确获取 S136 材料信息", () => {
    const material = getMoldMaterial("S136");
    expect(material.name).toBe("S136");
    expect(material.density).toBe(0.00000785);
    expect(material.pricePerKg).toBe(0.013);
  });

  it("应该抛出错误当材料不存在", () => {
    expect(() => getMoldMaterial("UNKNOWN")).toThrow(
      "没有找到模具材料: UNKNOWN",
    );
  });

  it("应该正确处理所有定义的材料", () => {
    moldMaterialList.forEach((material) => {
      expect(() => getMoldMaterial(material.name)).not.toThrow();
    });
  });
});
