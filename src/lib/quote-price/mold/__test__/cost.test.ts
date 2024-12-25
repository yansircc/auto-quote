import {
  calculateMoldMaterialCost,
  calculateMaintenanceFee,
  calculateGrossProfit,
  calculateProcessingFee,
  calculateTotalMoldCost,
} from "../cost";
import {
  defaultMoldMaterialDensity,
  moldMaterialPerPrice,
} from "src/lib/constants/price-constant";
import { describe, it, expect } from "vitest";
import type { Mold, MoldConfig } from "../types";

describe("模具成本计算", () => {
  // 创建一个基础的模具配置对象
  const mockConfig: MoldConfig = {
    maintenanceFee: {
      threshold: 100,
      lowerRate: 0.1,
      higherRate: 0.2,
    },
    grossProfit: {
      weightThresholds: [100, 200],
      rates: [0.1, 0.2],
    },
    processingFees: {
      "1": 100,
    },
  };

  // 创建一个基础的模具对象
  const mockMold: Mold = {
    dimensions: {
      width: 100, // mm
      height: 100, // mm
      depth: 100, // mm
    },
    weight: 10, // kg
    material: {
      name: "718H", // 确保这个名字在 moldPriceDifferList 中存在
      density: defaultMoldMaterialDensity,
      pricePerKg: moldMaterialPerPrice,
      id: "1",
    },
    cavityCount: 1,
  };

  describe("calculateMoldMaterialCost", () => {
    it("正确计算基本材料成本", () => {
      const cost = calculateMoldMaterialCost(mockMold);
      // 体积: 100 * 100 * 100 = 1,000,000 mm³ = 1,000 cm³
      // 重量: 1,000 * defaultMoldMaterialDensity
      // 成本: max(重量, minSalesWeight) * moldMaterialPerPrice
      expect(cost).toBeGreaterThan(0);
    });

    it("处理非法尺寸", () => {
      const invalidMold = {
        ...mockMold,
        dimensions: { width: -1, height: 100, depth: 100 },
      };
      expect(() => calculateMoldMaterialCost(invalidMold)).toThrow(
        "模具尺寸不能为负数或0",
      );
    });
  });

  describe("calculateMaintenanceFee", () => {
    it("计算小重量模具的运维费", () => {
      const fee = calculateMaintenanceFee(5, mockConfig);
      expect(fee).toBeGreaterThan(0);
    });

    it("处理非法重量", () => {
      expect(() => calculateMaintenanceFee(-1, mockConfig)).toThrow(
        "模具重量不能为负数或0",
      );
    });

    it("处理超重模具", () => {
      expect(() => calculateMaintenanceFee(100000, mockConfig)).toThrow(
        "模具重量超过阈值",
      );
    });
  });

  describe("calculateGrossProfit", () => {
    it("计算正常重量的毛利", () => {
      const profit = calculateGrossProfit(10, mockConfig);
      expect(profit).toBeGreaterThan(0);
    });

    it("处理非法重量", () => {
      expect(() => calculateGrossProfit(-1, mockConfig)).toThrow(
        "模具重量不能为负数或0",
      );
    });
  });

  describe("calculateProcessingFee", () => {
    it("计算正常加工费", () => {
      const fee = calculateProcessingFee(mockMold, mockConfig);
      expect(fee).toBeGreaterThan(0);
    });

    it("处理非法重量", () => {
      const invalidMold = { ...mockMold, weight: -1 };
      expect(() => calculateProcessingFee(invalidMold, mockConfig)).toThrow(
        "模具重量不能为负数或0",
      );
    });

    it("处理未知材料", () => {
      const unknownMaterialMold = {
        ...mockMold,
        material: { ...mockMold.material, name: "未知材料" },
      };
      expect(() =>
        calculateProcessingFee(unknownMaterialMold, mockConfig),
      ).toThrow("模具材料不存在");
    });
  });

  describe("calculateTotalMoldCost", () => {
    it("计算总成本", () => {
      const totalCost = calculateTotalMoldCost(100, 50, 30, 20);
      expect(totalCost).toBe(170); // 100 + 50 + 20 (不包含毛利)
    });

    it("处理非法成本", () => {
      expect(() => calculateTotalMoldCost(-1, 50, 30, 20)).toThrow(
        "成本不能为负数或0",
      );
      expect(() => calculateTotalMoldCost(100, -1, 30, 20)).toThrow(
        "成本不能为负数或0",
      );
      expect(() => calculateTotalMoldCost(100, 50, 30, -1)).toThrow(
        "成本不能为负数或0",
      );
    });
  });
});
