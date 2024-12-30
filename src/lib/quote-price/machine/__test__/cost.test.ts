import { describe, expect, it } from "vitest";
import { getTotalMachineProcessingFee } from "../cost";
import type { MachineConfig } from "../../core";

describe("机器费用计算", () => {
  const testConfig: MachineConfig = {
    costPerShots: 1.5,
    smallBatch: {
      threshold: 1000,
      rate: 0.5,
    },
  } as MachineConfig;

  it("当模次数大于等于小批量阈值时，只计算基础费用", () => {
    const totalShots = 1200;
    const fee = getTotalMachineProcessingFee(totalShots, testConfig);
    // 计算：1200 * 1.5 + 0 = 1800
    expect(fee).toBe(1800);
  });

  it("当模次数小于小批量阈值时，计算基础费用和小批量费用", () => {
    const totalShots = 800;
    const fee = getTotalMachineProcessingFee(totalShots, testConfig);
    // 计算：800 * 1.5 + (1000-800)*0.5 = 1200 + 100 = 1300
    expect(fee).toBe(1300);
  });

  it("边界情况：模次数刚好等于小批量阈值", () => {
    const totalShots = 1000;
    const fee = getTotalMachineProcessingFee(totalShots, testConfig);
    // 计算：1000 * 1.5 + 0 = 1500
    expect(fee).toBe(1500);
  });

  it("极端情况：模次数为0时，只计算小批量费用", () => {
    const totalShots = 0;
    const fee = getTotalMachineProcessingFee(totalShots, testConfig);
    // 计算：0 * 1.5 + (1000-0)*0.5 = 0 + 500 = 500
    expect(fee).toBe(500);
  });

  it("验证费用计算的正确性", () => {
    const testCases = [
      { shots: 500, expected: 500 * 1.5 + (1000 - 500) * 0.5 },
      { shots: 1500, expected: 1500 * 1.5 },
      { shots: 2000, expected: 2000 * 1.5 },
    ];

    testCases.forEach(({ shots, expected }) => {
      const fee = getTotalMachineProcessingFee(shots, testConfig);
      expect(fee).toBe(expected);
    });
  });
});
