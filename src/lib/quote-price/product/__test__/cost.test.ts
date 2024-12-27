import {
  calculateProductMaterialCost,
  calculateTotalMaterialCost,
  calculateMaterialWastage,
  calculateProcessingFee,
  calculateProductTotalPrice,
  calculateRiskAdjustedCost,
} from "../cost";
import { describe, it, expect } from "vitest";
import type { Product } from "../types";

describe("产品成本计算", () => {
  describe("calculateProductMaterialCost - 单件产品材料成本", () => {
    const mockProduct: Product = {
      netVolume: 100, // cm³
      material: {
        density: 0.91, // g/cm³
        price: 15, // 元/kg
        name: "PP",
        shrinkageRate: 0.02,
        processingTemp: 180,
      },
      dimensions: {
        width: 10,
        depth: 5,
        height: 3,
      },
      quantity: 1000,
      id: "1",
      name: "产品1",
      color: "红色",
      envelopeVolume: 150,
    };

    it("正确计算单件产品的材料成本", () => {
      const cost = calculateProductMaterialCost(mockProduct);

      expect(cost).toBe(1365);
    });

    it("处理无效输入", () => {
      const invalidProduct = { ...mockProduct, netVolume: 0 };
      expect(() => calculateProductMaterialCost(invalidProduct)).toThrow(
        "产品净体积、材料密度或材料单价不能为空",
      );
    });
  });

  describe("calculateTotalMaterialCost - 总材料成本", () => {
    const mockProducts: Product[] = [
      {
        netVolume: 100,
        material: {
          density: 0.91,
          price: 15,
          name: "PP",
          shrinkageRate: 0.02,
          processingTemp: 180,
        },
        dimensions: {
          width: 10,
          depth: 5,
          height: 3,
        },
        quantity: 1000,
        id: "1",
        name: "产品1",
        color: "红色",
        envelopeVolume: 150,
      },
      {
        netVolume: 200,
        material: {
          density: 0.91,
          price: 15,
          name: "PP",
          shrinkageRate: 0.02,
          processingTemp: 180,
        },
        dimensions: {
          width: 10,
          depth: 5,
          height: 3,
        },
        quantity: 500,
        id: "2",
        name: "产品2",
        color: "蓝色",
        envelopeVolume: 150,
      },
    ];

    it("正确计算多个产品的总材料成本", () => {
      const totalCost = calculateTotalMaterialCost(mockProducts);

      expect(totalCost).toBe(2730000);
    });
  });

  describe("calculateMaterialWastage - 材料损耗", () => {
    it("正确计算材料损耗费用", () => {
      const totalMaterialCost = 1000;
      const wastageRate = 0.1;
      const wastage = calculateMaterialWastage(totalMaterialCost, wastageRate);
      expect(wastage).toBe(100);
    });

    it("处理无效损耗率", () => {
      expect(() => calculateMaterialWastage(1000, -0.1)).toThrow(
        "损耗系数必须在0到1之间",
      );
      expect(() => calculateMaterialWastage(1000, 1.1)).toThrow(
        "损耗系数必须在0到1之间",
      );
    });
  });

  describe("calculateProcessingFee - 加工费用", () => {
    it("正确计算正常批量的加工费", () => {
      const fee = calculateProcessingFee(100, 1000, 500, 2);
      expect(fee).toBeGreaterThan(0);
    });

    it("正确计算小批量的加工费", () => {
      const fee = calculateProcessingFee(100, 200, 500, 2);
      const normalFee = calculateProcessingFee(100, 1000, 500, 2);
      expect(fee).toBeGreaterThan(normalFee / 5); // 小批量费用应该相对较高
    });

    it("处理无效输入", () => {
      expect(() => calculateProcessingFee(-100, 1000, 500, 2)).toThrow(
        "机器吨位不能为零或负数",
      );
      expect(() => calculateProcessingFee(100, -1000, 500, 2)).toThrow(
        "参数不能为负数或0",
      );
    });
  });

  describe("calculateProductTotalPrice - 产品总售价", () => {
    it("正确计算产品总售价", () => {
      const totalPrice = calculateProductTotalPrice(1000, 100, 200, 
        0.2);

      expect(totalPrice).toBeGreaterThan(0);
    });

    it("处理无效输入", () => {
      expect(() => calculateProductTotalPrice(-1000, 100, 200, 0.2)).toThrow(
        "成本不能为负数或0",
      );
    });
  });

  
  describe("calculateRiskAdjustedCost - 风险调整", () => {
    it("正确计算低风险调整（0-30分）", () => {
      const cost = calculateRiskAdjustedCost(1000, 25);
      expect(cost).toBe(1000); // 无需调整
    });

    it("正确计算中等风险调整（31-60分）", () => {
      const cost = calculateRiskAdjustedCost(1000, 45);
      expect(cost).toBe(1100); // 1000 * (1 + 0.1)
    });

    it("正确计算高风险调整（61-80分）", () => {
      const cost = calculateRiskAdjustedCost(1000, 70);
      expect(cost).toBe(1200); // 1000 * (1 + 0.2)
    });

    it("正确计算极高风险调整（>80分）", () => {
      const cost = calculateRiskAdjustedCost(1000, 85);
      expect(cost).toBe(1300); // 1000 * (1 + 0.3)
    });

    it("处理无效输入", () => {
      expect(() => calculateRiskAdjustedCost(-1000, 50)).toThrow(
        "成本跟风险评分不能为负数或0",
      );
      expect(() => calculateRiskAdjustedCost(1000, -50)).toThrow(
        "成本跟风险评分不能为负数或0",
      );
    });
  });
});
