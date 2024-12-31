import { describe, expect, it } from "vitest";
import { getCheapestMachine } from "../tonnage";
import type { Dimensions } from "../../core";

describe("吨位计算", () => {
  const testDimension: Dimensions = { width: 500, height: 300, depth: 400 };
  const testInjectionWeight = 1000;

  it("应当返回最便宜的机器", () => {
    const machine = getCheapestMachine(testDimension, testInjectionWeight);
    expect(machine).toBeDefined();
    expect(machine.costPerShots).toBeGreaterThan(0);
  });

  it("当注胶量无效时应当抛出错误", () => {
    expect(() => getCheapestMachine(testDimension, 0)).toThrow(
      "注胶量不能小于等于0",
    );
    expect(() => getCheapestMachine(testDimension, -100)).toThrow(
      "注胶量不能小于等于0",
    );
  });

  it("当模具尺寸无效时应当抛出错误", () => {
    const invalidDimensions = [
      { width: 0, height: 300, depth: 400 },
      { width: 500, height: 0, depth: 400 },
      { width: 500, height: 300, depth: 0 },
    ];

    invalidDimensions.forEach((dimension) => {
      expect(() => getCheapestMachine(dimension, testInjectionWeight)).toThrow(
        "模具尺寸不能小于等于0",
      );
    });
  });

  it("当没有合适的机器时应当抛出错误", () => {
    const oversizeDimension: Dimensions = {
      width: 5000,
      height: 3000,
      depth: 4000,
    };
    const oversizeWeight = 1000000;

    expect(() => getCheapestMachine(oversizeDimension, oversizeWeight)).toThrow(
      "无法找到最小费率的机器",
    );
  });

  it("应当返回费率最低的机器", () => {
    const machines = [
      getCheapestMachine({ width: 100, height: 100, depth: 100 }, 500),
      getCheapestMachine({ width: 200, height: 200, depth: 200 }, 1000),
      getCheapestMachine({ width: 300, height: 300, depth: 300 }, 1500),
    ];

    // 检查返回的机器费率是否递增
    for (let i = 1; i < machines.length; i++) {
      expect(machines[i]?.costPerShots).toBeGreaterThanOrEqual(
        machines[i - 1]?.costPerShots ?? 0,
      );
    }
  });
});
