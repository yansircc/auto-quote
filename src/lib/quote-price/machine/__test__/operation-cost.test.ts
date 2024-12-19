import { calculateOperationCostPerShot } from "../operation-cost";
import { describe, it, expect } from "vitest";

describe("机器运行成本计算", () => {
  describe("calculateOperationCostPerShot", () => {
    it("计算小型机器的每模次成本", () => {
      const tonnage = 50; // 50吨
      const cost = calculateOperationCostPerShot(tonnage);

      // 假设成本计算公式：
      // 基础成本 = 2元/模次
      // 吨位系数 = 吨位 / 100
      // 最终成本 = 基础成本 * (1 + 吨位系数)
      // 2 * (1 + 50/100) = 3元/模次
      expect(cost).toBe(3);
    });

    it("计算中型机器的每模次成本", () => {
      const tonnage = 500; // 500吨
      const cost = calculateOperationCostPerShot(tonnage);
      // 2 * (1 + 500/100) = 12元/模次
      expect(cost).toBe(12);
    });

    it("计算大型机器的每模次成本", () => {
      const tonnage = 2000; // 2000吨
      const cost = calculateOperationCostPerShot(tonnage);
      // 2 * (1 + 2000/100) = 42元/模次
      expect(cost).toBe(42);
    });

    it("处理异常输入", () => {
      expect(() => calculateOperationCostPerShot(-50)).toThrow(
        "机器吨位不能为负数",
      );
      expect(() => calculateOperationCostPerShot(0)).toThrow(
        "机器吨位不能为零",
      );
    });

    it("处理精确计算", () => {
      const tonnage = 123.45;
      const cost = calculateOperationCostPerShot(tonnage);
      // 2 * (1 + 123.45/100) = 4.469元/模次
      // 四舍五入到2位小数
      expect(cost).toBe(4.47);
    });
  });
});
