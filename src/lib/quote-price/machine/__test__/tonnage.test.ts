import { determineMachineTonnage } from "../tonnage";
import { describe, it, expect } from "vitest";

describe("机器吨位计算", () => {
  describe("determineMachineTonnage", () => {
    it("计算标准尺寸模具的机器吨位", () => {
      const moldWidth = 300; // 300mm
      const moldHeight = 400; // 400mm
      const moldDepth = 200; // 200mm
      const injectionVolume = 500; // 500cm³

      const tonnage = determineMachineTonnage(
        moldWidth,
        moldHeight,
        moldDepth,
        injectionVolume,
      );

      // 假设吨位计算公式：
      // 基础吨位 = 模具投影面积(cm²) * 每平方厘米压力(吨/cm²)
      // 300mm * 400mm = 120000mm² = 1200cm²
      // 1200cm² * 0.3吨/cm² = 360吨
      // 注胶系数 = 注胶量 / 100
      // 500cm³ / 100 = 5
      // 最终吨位 = 基础吨位 * (1 + 注胶系数 * 0.1)
      // 360 * (1 + 5 * 0.1) = 540吨
      expect(tonnage).toBe(540);
    });

    it("计算小型模具的机器吨位", () => {
      const tonnage = determineMachineTonnage(100, 150, 80, 100);
      // 100mm * 150mm = 15000mm² = 150cm²
      // 150cm² * 0.3吨/cm² = 45吨
      // 100cm³ / 100 = 1
      // 45 * (1 + 1 * 0.1) = 49.5吨
      expect(tonnage).toBe(49.5);
    });

    it("计算大型模具的机器吨位", () => {
      const tonnage = determineMachineTonnage(800, 1000, 400, 2000);
      // 800mm * 1000mm = 800000mm² = 8000cm²
      // 8000cm² * 0.3吨/cm² = 2400吨
      // 2000cm³ / 100 = 20
      // 2400 * (1 + 20 * 0.1) = 7200吨
      expect(tonnage).toBe(7200);
    });

    it("处理异常输入", () => {
      expect(() => determineMachineTonnage(-300, 400, 200, 500)).toThrow(
        "模具尺寸不能为负数",
      );
      expect(() => determineMachineTonnage(300, -400, 200, 500)).toThrow(
        "模具尺寸不能为负数",
      );
      expect(() => determineMachineTonnage(300, 400, -200, 500)).toThrow(
        "模具尺寸不能为负数",
      );
      expect(() => determineMachineTonnage(300, 400, 200, -500)).toThrow(
        "注胶量不能为负数",
      );

      expect(() => determineMachineTonnage(0, 400, 200, 500)).toThrow(
        "模具尺寸不能为零",
      );
      expect(() => determineMachineTonnage(300, 0, 200, 500)).toThrow(
        "模具尺寸不能为零",
      );
      expect(() => determineMachineTonnage(300, 400, 0, 500)).toThrow(
        "模具尺寸不能为零",
      );
      expect(() => determineMachineTonnage(300, 400, 200, 0)).toThrow(
        "注胶量不能为零",
      );
    });
  });
});
