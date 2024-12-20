import { 
  determineMachineTonnage,
  calculateRequiredTonnage,
  checkTonnageInRange,
  getTonnageRate,
  getSmallBatchMachiningFee,
  calculateOptimalTonnage
} from "../tonnage";
import { injectSafetyFactor, machineList } from "src/lib/constants/price-constant";
import { describe, it, expect } from "vitest";


describe("机器吨位计算", () => {
  describe("determineMachineTonnage", () => {
    it("计算标准尺寸模具的机器吨位", () => {
      const moldWidth = 400;
      const moldHeight = 50;
      const moldDepth = 50;
      const injectionVolume = 20;

      const tonnage = determineMachineTonnage(
        moldWidth,
        moldHeight,
        moldDepth,
        injectionVolume
      );

      const expectedMachine = machineList.find(m => 
        Math.min(moldWidth, moldDepth) <= m.moldWidth &&
        moldHeight <= m.moldHeight &&
        (injectionVolume / injectSafetyFactor) <= m.injectionVolume
      );
      
      expect(tonnage).toBe(parseInt(expectedMachine!.name.replace('T', '')));
    });

    it("处理异常输入", () => {
      expect(() => determineMachineTonnage(-300, 400, 200, 500)).toThrow(
        "模具尺寸不能为零跟负数"
      );
      expect(() => determineMachineTonnage(300, -400, 200, 500)).toThrow(
        "模具尺寸不能为零跟负数"
      );
      expect(() => determineMachineTonnage(300, 400, -200, 500)).toThrow(
        "模具尺寸不能为零跟负数"
      );
      expect(() => determineMachineTonnage(300, 400, 200, -500)).toThrow(
        "注胶量不能为零跟负数"
      );
    });
  });

  describe("calculateRequiredTonnage", () => {
    const mockConfig = { efficiency: 1, 
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

    // it("计算单个产品的所需吨位", () => {
    //   const tonnage = calculateRequiredTonnage(mockProducts, [1,1,1], mockConfig);
    //   console.log("单个产品的所需吨位:", tonnage);
    //   expect(typeof tonnage).toBe("number");
    //   expect(tonnage).toBeGreaterThan(0);
    // });

    it("处理空产品列表", () => {
      
      expect(() => calculateRequiredTonnage([], [], undefined)).toThrow();
    });
  });

  describe("checkTonnageInRange", () => {
    const mockConfig = { efficiency: 1, 
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

    it("检查吨位是否在范围内", () => {
      expect(checkTonnageInRange(150, mockConfig)).toBe(true);
      expect(checkTonnageInRange(50, mockConfig)).toBe(false);
      expect(checkTonnageInRange(250, mockConfig)).toBe(false);
    });
  });

  describe("getTonnageRate", () => {
    it("获取有效吨位的费率", () => {
      const tonnage = 120;
      const rate = getTonnageRate(tonnage, undefined);
      const expectedMachine = machineList.find(m => parseInt(m.name.replace('T', '')) >= tonnage);
      expect(rate).toBe(expectedMachine?.machiningFee);
    });

    it("处理无效吨位", () => {
      expect(() => getTonnageRate(2000, undefined)).toThrow("没有找到对应的机器");
    });
  });

  describe("getSmallBatchMachiningFee", () => {
    it("获取有效吨位的小批量加工费", () => {
      const tonnage = 120;
      const fee = getSmallBatchMachiningFee(tonnage, undefined);
      const expectedMachine = machineList.find(m => parseInt(m.name.replace('T', '')) >= tonnage);
      expect(fee).toBe(expectedMachine?.smallBatchMachiningFee);
    });

    it("处理无效吨位", () => {
      expect(() => getSmallBatchMachiningFee(2000, undefined)).toThrow("没有找到对应的机器");
    });
  });

  describe("calculateOptimalTonnage", () => {
    const mockConfig = { efficiency: 1, 
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

    it("计算最佳机器吨位", () => {
      const requiredTonnage = 120;
      const optimalTonnage = calculateOptimalTonnage(requiredTonnage, mockConfig);
      const expectedMachine = machineList.find(m => parseInt(m.name.replace('T', '')) >= requiredTonnage);
      expect(optimalTonnage).toBe(parseInt(expectedMachine!.name.replace('T', '')));
    });

    it("处理超出范围的吨位", () => {
      expect(() => calculateOptimalTonnage(2000, undefined)).toThrow("没有找到对应的机器");
    });
  });
});
