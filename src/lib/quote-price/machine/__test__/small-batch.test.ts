import { describe, expect, it } from "vitest";
import { calculateTotalSmallBatchFee } from "../small-batch";
import type { MachineConfig } from "../../core";

describe("小批量费用计算", () => {
  const testConfig: MachineConfig = {
    smallBatch: {
      threshold: 1000,
      rate: 0.5,
    },
    // 其他配置省略
  } as MachineConfig;

  it("当模次数大于等于阈值时，不收取小批量费用", () => {
    const shots = [1000, 1200, 1500];
    const fee = calculateTotalSmallBatchFee(shots, testConfig);
    expect(fee).toBe(0);
  });

  it("当模次数小于阈值时，正确计算小批量费用", () => {
    const shots = [800, 900, 950];
    const fee = calculateTotalSmallBatchFee(shots, testConfig);
    // 计算：(1000-800)*0.5 + (1000-900)*0.5 + (1000-950)*0.5 = 175
    expect(fee).toBe(175);
  });

  it("当模次数组为空时，抛出错误", () => {
    expect(() => calculateTotalSmallBatchFee([], testConfig)).toThrow(
      "模次数组不能为空",
    );
  });

  it("混合情况：部分模次大于阈值，部分小于阈值", () => {
    const shots = [1200, 800, 1500, 900];
    const fee = calculateTotalSmallBatchFee(shots, testConfig);
    // 计算：(1000-800)*0.5 + (1000-900)*0.5 = 150
    expect(fee).toBe(150);
  });

  it("边界情况：模次数刚好等于阈值", () => {
    const shots = [1000, 1000, 1000];
    const fee = calculateTotalSmallBatchFee(shots, testConfig);
    expect(fee).toBe(0);
  });

  it("极端情况：所有模次数都远小于阈值", () => {
    const shots = [100, 200, 300];
    const fee = calculateTotalSmallBatchFee(shots, testConfig);
    // 计算：(1000-100)*0.5 + (1000-200)*0.5 + (1000-300)*0.5 = 1200
    expect(fee).toBe(1200);
  });
});
