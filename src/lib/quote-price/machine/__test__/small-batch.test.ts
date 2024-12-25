import { describe, it, expect } from "vitest";
import {
  calculateSmallBatchFee,
  calculateTotalSmallBatchFee,
} from "../small-batch";
import type { MachineConfig } from "../types";
import { getMachineByTonnage } from "../common";

describe("小批量费用计算", () => {
  const mockConfig: MachineConfig = {
    smallBatchThreshold: 1000,
    maxInjectionVolume: 1000,
    tonnageRange: [50, 1500],
    tonnageRates: [1.0, 1.2, 1.5],
    tonnageThresholds: [50, 100, 200],
    smallBatchRates: [0.8, 1.0, 1.2],
    safetyFactor: 0.8,
  };

  describe("calculateSmallBatchFee", () => {
    it("当模次数大于等于阈值时，不收取小批量费用", () => {
      const result = calculateSmallBatchFee(1000, 100, mockConfig);
      expect(result).toBe(0);
    });

    it("当模次数小于阈值时，应收取小批量费用", () => {
      const shots = 800;
      const tonnage = 200;
      const machine = getMachineByTonnage(tonnage);
      if (!machine) throw new Error("测试数据错误：未找到对应吨位的机器");

      const expectedFee =
        (mockConfig.smallBatchThreshold - shots) * (machine.machiningFee ?? 0);
      const result = calculateSmallBatchFee(shots, tonnage, mockConfig);

      expect(result).toBe(expectedFee);
    });

    it("当找不到对应吨位的机器时应抛出错误", () => {
      expect(() => {
        calculateSmallBatchFee(800, 999999, mockConfig);
      }).toThrow("没有找到对应的机器");
    });
  });

  describe("calculateTotalSmallBatchFee", () => {
    it("应正确计算多趟生产的小批量费用总和", () => {
      const batchShots = [800, 900, 1000];
      const tonnage = 200;
      const expectedTotal = batchShots.reduce((sum, shots) => {
        return sum + calculateSmallBatchFee(shots, tonnage, mockConfig);
      }, 0);

      const result = calculateTotalSmallBatchFee(
        batchShots,
        tonnage,
        mockConfig,
      );
      expect(result).toBe(expectedTotal);
    });

    it("当模次数组为空时应抛出错误", () => {
      expect(() => {
        calculateTotalSmallBatchFee([], 100, mockConfig);
      }).toThrow("模次数组不能为空");
    });
  });
});
