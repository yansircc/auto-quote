import { 
  calculateOperationCostPerShot, 
  calculateGroupProcessingFee,
  calculateProductionBatches 
} from "../operation-cost";
import { describe, it, expect } from "vitest";
import { machineList } from "src/lib/constants/price-constant";

describe("机器运行成本计算", () => {
  describe("calculateOperationCostPerShot", () => {
    it("计算小型机器的每模次成本", () => {
      const tonnage = 50;
      const cost = calculateOperationCostPerShot(tonnage);
      const expectedMachine = machineList.find(m => parseInt(m.name.replace('T', '')) >= tonnage);
      expect(cost).toBe(expectedMachine?.machiningFee);
    });

    it("处理异常输入", () => {
      expect(() => calculateOperationCostPerShot(-50)).toThrow(
        "机器吨位不能为零跟负数"
      );
      expect(() => calculateOperationCostPerShot(0)).toThrow(
        "机器吨位不能为零跟负数"
      );
    });

    it("处理超出范围的吨位", () => {
      expect(() => calculateOperationCostPerShot(2000)).toThrow(
        "没有找到对应的机器"
      );
    });
  });

  describe("calculateGroupProcessingFee", () => {
    const mockProducts = [
      {
        material: { name: "ABS", density: 1.05, price: 100, shrinkageRate: 0.02, processingTemp: 200 },
        color: "red",
        netVolume: 100,
        id: "1",
        name: "ABS",
        dimensions: { length: 100, width: 100, height: 100, depth: 100 },
        quantity: 1,
        envelopeVolume: 100
      },
      {
        material: { name: "ABS", density: 1.05, price: 100, shrinkageRate: 0.02, processingTemp: 200 },
        color: "red",
        netVolume: 150,
        id: "2",
        name: "ABS",
        dimensions: { length: 100, width: 100, height: 100, depth: 100 },
        quantity: 1,
        envelopeVolume: 100
      },
      {
        material: { name: "PP", density: 0.92, price: 100, shrinkageRate: 0.02, processingTemp: 200 },
        color: "blue",
        netVolume: 120,
        id: "3",
        name: "PP",
        dimensions: { length: 100, width: 100, height: 100, depth: 100 },
        quantity: 1,
        envelopeVolume: 100
      }
    ];

    it("计算相同材料和颜色的组合加工费", () => {
      const shots = [100, 100, 200];
      const tonnage = 100;
      const config = { efficiency: 1, 
        machineTonnage: 100, 
        tonnageRange: [100, 200] as [number, number], 
        tonnageRates: [1, 2], 
        tonnageThresholds: [100, 200], 
        smallBatchThreshold: 100, 
        smallBatchMachiningFee: 35,
        safetyFactor: 0.8,
        maxInjectionVolume: 1000,
        smallBatchRates: [1, 2]
      };
      
      const fee = calculateGroupProcessingFee(
        mockProducts,
        shots,
        tonnage,
        config
      );
      
      expect(fee).toBeGreaterThan(0);
      expect(typeof fee).toBe("number");
    });

    it("处理空产品列表", () => {
      
      expect(() => 
        calculateGroupProcessingFee([], [], 100, undefined)
      ).toThrow();
    });
  });

  describe("calculateProductionBatches", () => {
    const mockProducts = [
      {
        material: { name: "ABS", density: 1.05, price: 100, shrinkageRate: 0.02, processingTemp: 200 },
        color: "red",
        netVolume: 100,
        id: "1",
        name: "ABS",
        dimensions: { length: 100, width: 100, height: 100, depth: 100 },
        quantity: 1,
        envelopeVolume: 100
      },
      {
        material: { name: "ABS", density: 1.05, price: 100, shrinkageRate: 0.02, processingTemp: 200 },
        color: "red",
        netVolume: 150,
        id: "2",
        name: "ABS",
        dimensions: { length: 100, width: 100, height: 100, depth: 100 },
        quantity: 1,
        envelopeVolume: 100
      },
      {
        material: { name: "PP", density: 0.92, price: 100, shrinkageRate: 0.02, processingTemp: 200 },
        color: "blue",
        netVolume: 120,
        id: "3",
        name: "PP",
        dimensions: { length: 100, width: 100, height: 100, depth: 100 },
        quantity: 1,
        envelopeVolume: 100
      }
    ];

    it("正确分组相同材料和颜色的产品", () => {
      const batches = calculateProductionBatches(mockProducts);
      expect(batches).toHaveLength(2); // 应该有两个批次
      
      // 检查第一个批次（ABS-red）

      expect(batches[0]).toHaveLength(2);
      const batch0 = batches[0];
      if (!batch0) {
        throw new Error("Batch 0 is undefined");
      }
      expect(batch0[0]?.material?.name).toBe("ABS");
      expect(batch0[0]?.color).toBe("red");
      
      // 检查第二个批次（PP-blue）
      expect(batches[1]).toHaveLength(1);
      const batch1 = batches[1];
      if (!batch1) {
        throw new Error("Batch 1 is undefined");
      }
      expect(batch1[0]?.material?.name).toBe("PP");
      expect(batch1[0]?.color).toBe("blue");
    });

    it("处理空产品列表", () => {
      expect(() => calculateProductionBatches([])).toThrow("产品列表不能为空");
    });

    it("处理缺失材料信息的产品", () => {
      const invalidProducts = [
        { color: "red" }
      ] as any[];
      
      expect(() => calculateProductionBatches(invalidProducts)).toThrow(
        "产品材料信息不完整"
      );
    });

    it("处理缺失颜色信息的产品", () => {
      const invalidProducts = [
        { material: { name: "ABS" } }
      ] as any[];
      
      expect(() => calculateProductionBatches(invalidProducts)).toThrow(
        "产品颜色信息不完整"
      );
    });
  });
});
