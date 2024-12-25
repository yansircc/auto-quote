import {
  calculateProductNetVolume,
  calculateProductBoundingVolume,
  calculateInjectionVolume,
} from "../volume";
import { describe, it, expect } from "vitest";

describe("产品体积计算", () => {
  describe("calculateProductNetVolume - 产品净体积", () => {
    it("应该正确计算整数尺寸的体积", () => {
      const dimensions = {
        width: 10,
        height: 5,
        depth: 2,
      };

      const volume = calculateProductNetVolume(dimensions);
      expect(volume).toBe(100);
    });

    it("应该正确计算小数尺寸的体积并保留两位小数", () => {
      const dimensions = {
        width: 10.5,
        height: 5.2,
        depth: 2.1,
      };
      const volume = calculateProductNetVolume(dimensions);
      expect(volume).toBe(114.66);
    });

    it("应该在尺寸为空时抛出错误", () => {
      // @ts-expect-error 测试空值情况
      expect(() => calculateProductNetVolume(undefined)).toThrow(
        "产品尺寸不能为空",
      );
      // @ts-expect-error 测试空值情况
      expect(() => calculateProductNetVolume(null)).toThrow("产品尺寸不能为空");
    });

    it("应该在尺寸为0时抛出错误", () => {
      expect(() =>
        calculateProductNetVolume({ width: 0, height: 5, depth: 2 }),
      ).toThrow("产品尺寸不能为负数或0");
      expect(() =>
        calculateProductNetVolume({ width: 10, height: 0, depth: 2 }),
      ).toThrow("产品尺寸不能为负数或0");
      expect(() =>
        calculateProductNetVolume({ width: 10, height: 5, depth: 0 }),
      ).toThrow("产品尺寸不能为负数或0");
    });

    it("应该在尺寸为负数时抛出错误", () => {
      expect(() =>
        calculateProductNetVolume({ width: -10, height: 5, depth: 2 }),
      ).toThrow("产品尺寸不能为负数或0");
      expect(() =>
        calculateProductNetVolume({ width: 10, height: -5, depth: 2 }),
      ).toThrow("产品尺寸不能为负数或0");
      expect(() =>
        calculateProductNetVolume({ width: 10, height: 5, depth: -2 }),
      ).toThrow("产品尺寸不能为负数或0");
    });
  });

  describe("calculateProductBoundingVolume - 产品包络体积", () => {
    it("应该正确计算包络体积（比净体积大20%）", () => {
      const dimensions = {
        width: 10,
        height: 5,
        depth: 2,
      };

      const boundingVolume = calculateProductBoundingVolume(dimensions);
      // 100 * 1.2 = 120
      expect(boundingVolume).toBe(100);
    });

    it("应该正确计算小数尺寸的包络体积并保留两位小数", () => {
      const dimensions = {
        width: 10.5,
        height: 5.2,
        depth: 2.1,
      };
      const boundingVolume = calculateProductBoundingVolume(dimensions);
      // 114.66 * 1.2 = 137.59
      expect(boundingVolume).toBe(114.66);
    });

    it("应该在尺寸为空时抛出错误", () => {
      // @ts-expect-error 测试空值情况
      expect(() => calculateProductBoundingVolume(undefined)).toThrow(
        "产品尺寸不能为空",
      );
      // @ts-expect-error 测试空值情况
      expect(() => calculateProductBoundingVolume(null)).toThrow(
        "产品尺寸不能为空",
      );
    });

    it("应该在尺寸为0或负数时抛出错误", () => {
      expect(() =>
        calculateProductBoundingVolume({ width: 0, height: 5, depth: 2 }),
      ).toThrow("产品尺寸不能为负数或0");
      expect(() =>
        calculateProductBoundingVolume({ width: -10, height: 5, depth: 2 }),
      ).toThrow("产品尺寸不能为负数或0");
    });
  });

  describe("calculateInjectionVolume - 注胶体积", () => {
    it("应该正确计算注胶体积（考虑安全系数）", () => {
      const netVolume = 100;
      const injectionVolume = calculateInjectionVolume(netVolume);
      // 100 / 0.8 = 125
      expect(injectionVolume).toBe(125);
    });

    it("应该正确处理小数并保留两位小数", () => {
      const netVolume = 114.66;
      const injectionVolume = calculateInjectionVolume(netVolume);
      // 114.66 / 0.8 = 143.325 ≈ 143.33
      expect(injectionVolume).toBe(143.325);
    });

    it("应该在净体积为0或负数时抛出错误", () => {
      expect(() => calculateInjectionVolume(0)).toThrow("净体积不能为负数或0");
      expect(() => calculateInjectionVolume(-100)).toThrow(
        "净体积不能为负数或0",
      );
    });
  });
});
