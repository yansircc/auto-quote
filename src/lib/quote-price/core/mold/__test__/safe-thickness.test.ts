import { describe, expect, it } from "vitest";
import {
  getSafeEdgeThickness,
  getSafeBottomThickness,
} from "../safe-thickness";

describe("模具安全厚度计算", () => {
  describe("边框厚度计算", () => {
    it("应该正确处理最小宽度", () => {
      expect(getSafeEdgeThickness(50)).toBe(60);
      expect(getSafeEdgeThickness(100)).toBe(60);
    });

    it("应该正确处理边界宽度", () => {
      expect(getSafeEdgeThickness(150)).toBe(60);
      expect(getSafeEdgeThickness(151)).toBe(65);
    });

    it("应该正确处理中间值", () => {
      expect(getSafeEdgeThickness(200)).toBe(65);
      expect(getSafeEdgeThickness(300)).toBe(75);
    });

    it("应该正确处理最大宽度", () => {
      expect(getSafeEdgeThickness(1000)).toBe(145);
    });

    it("应该抛出错误当宽度为负数", () => {
      expect(() => getSafeEdgeThickness(-1)).toThrow();
    });

    it("应该抛出错误当宽度超过最大阈值", () => {
      expect(() => getSafeEdgeThickness(1001)).toThrow();
    });
  });

  describe("底部厚度计算", () => {
    it("应该正确处理最小高度", () => {
      expect(getSafeBottomThickness(10)).toBe(210);
      expect(getSafeBottomThickness(50)).toBe(210);
    });

    it("应该正确处理边界高度", () => {
      expect(getSafeBottomThickness(50)).toBe(210);
      expect(getSafeBottomThickness(51)).toBe(230);
    });

    it("应该正确处理中间值", () => {
      expect(getSafeBottomThickness(100)).toBe(310);
      expect(getSafeBottomThickness(150)).toBe(390);
    });

    it("应该正确处理最大高度", () => {
      expect(getSafeBottomThickness(210)).toBe(510);
    });

    it("应该抛出错误当高度为负数", () => {
      expect(() => getSafeBottomThickness(-1)).toThrow();
    });

    it("应该抛出错误当高度超过最大阈值", () => {
      expect(() => getSafeBottomThickness(211)).toThrow();
    });
  });
});
