import { describe, expect, it } from "vitest";
import { materialList } from "../materials";

describe("材料数据测试", () => {
  it("应该包含所有材料", () => {
    expect(materialList.length).toBeGreaterThan(0);
  });

  it("每个材料对象应包含正确的属性", () => {
    materialList.forEach((material) => {
      expect(material).toHaveProperty("name");
      expect(material).toHaveProperty("density");
      expect(material).toHaveProperty("pricePerKg");
      expect(material).toHaveProperty("lossRate");
      expect(material).toHaveProperty("grossProfit");
    });
  });

  it("密度应为正数", () => {
    materialList.forEach((material) => {
      expect(material.density).toBeGreaterThan(0);
    });
  });

  it("单价应为正数", () => {
    materialList.forEach((material) => {
      expect(material.pricePerKg).toBeGreaterThan(0);
    });
  });

  it("损耗率应在0到1之间", () => {
    materialList.forEach((material) => {
      expect(material.lossRate).toBeGreaterThanOrEqual(0);
      expect(material.lossRate).toBeLessThanOrEqual(1);
    });
  });

  it("毛利率应在0到1之间", () => {
    materialList.forEach((material) => {
      expect(material.grossProfit).toBeGreaterThanOrEqual(0);
      expect(material.grossProfit).toBeLessThanOrEqual(1);
    });
  });

  it("材料名称应为非空字符串", () => {
    materialList.forEach((material) => {
      expect(typeof material.name).toBe("string");
      expect(material.name.length).toBeGreaterThan(0);
    });
  });
});
