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

      expect(tonnage).toBe(300);
    });

    it("计算小型模具的机器吨位", () => {
      const tonnage = determineMachineTonnage(100, 150, 80, 100);

      expect(tonnage).toBe(120);
    });

    it("计算大型模具的机器吨位", () => {
      const tonnage = determineMachineTonnage(800, 1000, 400, 2000);

      expect(tonnage).toBe(800);
    });

    it("处理异常输入", () => {
      expect(() => determineMachineTonnage(-300, 400, 200, 500)).toThrow(
        "模具尺寸不能为零跟负数",
      );
      expect(() => determineMachineTonnage(300, -400, 200, 500)).toThrow(
        "模具尺寸不能为零跟负数",
      );
      expect(() => determineMachineTonnage(300, 400, -200, 500)).toThrow(
        "模具尺寸不能为零跟负数",
      );
      expect(() => determineMachineTonnage(300, 400, 200, -500)).toThrow(
        "注胶量不能为零跟负数",
      );

      expect(() => determineMachineTonnage(0, 400, 200, 500)).toThrow(
        "模具尺寸不能为零跟负数",
      );
      expect(() => determineMachineTonnage(300, 0, 200, 500)).toThrow(
        "模具尺寸不能为零跟负数",
      );
      expect(() => determineMachineTonnage(300, 400, 0, 500)).toThrow(
        "模具尺寸不能为零跟负数",
      );
      expect(() => determineMachineTonnage(300, 400, 200, 0)).toThrow(
        "注胶量不能为零跟负数",
      );
    });
  });
});
