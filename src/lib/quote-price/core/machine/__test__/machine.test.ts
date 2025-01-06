import { describe, expect, it } from "vitest";
import { machineList } from "../index";

describe("机器配置测试", () => {
  it("应该包含所有机器配置", () => {
    expect(machineList.length).toBeGreaterThan(0);
  });

  it("每个机器对象应包含正确的属性", () => {
    machineList.forEach((machine) => {
      expect(machine).toHaveProperty("name");
      expect(machine).toHaveProperty("costPerShots");
      expect(machine).toHaveProperty("injection");
      expect(machine).toHaveProperty("mold");
      expect(machine).toHaveProperty("smallBatch");
    });
  });

  it("每次注射成本应为正数", () => {
    machineList.forEach((machine) => {
      expect(machine.costPerShots).toBeGreaterThan(0);
    });
  });

  it("注射配置应包含最大重量和安全系数", () => {
    machineList.forEach((machine) => {
      expect(machine.injection).toHaveProperty("maxWeight");
      expect(machine.injection).toHaveProperty("safetyFactor");
      expect(machine.injection.maxWeight).toBeGreaterThan(0);
      expect(machine.injection.safetyFactor).toBeGreaterThan(0);
    });
  });

  it("模具配置应包含最大宽度和高度", () => {
    machineList.forEach((machine) => {
      expect(machine.mold).toHaveProperty("maxWidth");
      expect(machine.mold).toHaveProperty("maxHeight");
      expect(machine.mold.maxWidth).toBeGreaterThan(0);
      expect(machine.mold.maxHeight).toBeGreaterThan(0);
    });
  });

  it("小批量生产配置应包含阈值和费率", () => {
    machineList.forEach((machine) => {
      expect(machine.smallBatch).toHaveProperty("threshold");
      expect(machine.smallBatch).toHaveProperty("rate");
      expect(machine.smallBatch.threshold).toBeGreaterThan(0);
      expect(machine.smallBatch.rate).toBeGreaterThan(0);
    });
  });
});
