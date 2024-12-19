import { calculateWasteCost } from "../waste";
import { describe, it, expect } from "vitest";

describe("材料损耗计算", () => {
  describe("calculateWasteCost - 计算损耗成本", () => {
    it("计算标准损耗成本", () => {
      const productMaterialCost = 1000; // 材料成本（元）
      const wasteRate = 0.1; // 损耗率 10%

      const wasteCost = calculateWasteCost(productMaterialCost, wasteRate);

      // 损耗成本 = 材料成本 * 损耗率
      // 1000 * 0.1 = 100 元
      expect(wasteCost).toBe(100);
    });

    it("处理高损耗率", () => {
      const wasteCost = calculateWasteCost(1000, 0.2);
      // 1000 * 0.2 = 200 元
      expect(wasteCost).toBe(200);
    });

    it("处理零损耗率", () => {
      const wasteCost = calculateWasteCost(1000, 0);
      expect(wasteCost).toBe(0);
    });

    it("处理异常输入", () => {
      expect(() => calculateWasteCost(-1000, 0.1)).toThrow(
        "材料成本不能为负数",
      );
      expect(() => calculateWasteCost(1000, -0.1)).toThrow("损耗率不能为负数");
      expect(() => calculateWasteCost(1000, 1.5)).toThrow("损耗率不能超过100%");
    });

    it("处理精确计算", () => {
      const wasteCost = calculateWasteCost(1234.56, 0.15);
      // 1234.56 * 0.15 = 185.184 元
      expect(wasteCost).toBe(185.18); // 四舍五入到2位小数
    });
  });
});
