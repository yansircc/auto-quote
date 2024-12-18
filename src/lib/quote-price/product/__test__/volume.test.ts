import { calculateProductNetVolume, calculateProductBoundingVolume } from '../volume';
import { describe, it, expect } from 'vitest';

describe('产品体积计算', () => {
  describe('calculateProductNetVolume - 产品净体积', () => {
    it('根据产品尺寸计算体积', () => {
      const dimensions = {
        width: 10,   // 厘米
        height: 5,   // 厘米
        depth: 2     // 厘米
      };

      const volume = calculateProductNetVolume(dimensions);

      // 10cm * 5cm * 2cm = 100 立方厘米
      expect(volume).toBe(100);
    });

    it('处理小数尺寸', () => {
      const dimensions = {
        width: 10.5,
        height: 5.2,
        depth: 2.1
      };
      const volume = calculateProductNetVolume(dimensions);
      // 10.5 * 5.2 * 2.1 = 114.66 立方厘米
      expect(volume).toBe(114.66);
    });

    it('处理零尺寸', () => {
      expect(() => calculateProductNetVolume({ width: 0, height: 5, depth: 2 }))
        .toThrow('产品尺寸不能为零');
      expect(() => calculateProductNetVolume({ width: 10, height: 0, depth: 2 }))
        .toThrow('产品尺寸不能为零');
      expect(() => calculateProductNetVolume({ width: 10, height: 5, depth: 0 }))
        .toThrow('产品尺寸不能为零');
    });

    it('处理负数尺寸', () => {
      expect(() => calculateProductNetVolume({ width: -10, height: 5, depth: 2 }))
        .toThrow('产品尺寸不能为负数');
      expect(() => calculateProductNetVolume({ width: 10, height: -5, depth: 2 }))
        .toThrow('产品尺寸不能为负数');
      expect(() => calculateProductNetVolume({ width: 10, height: 5, depth: -2 }))
        .toThrow('产品尺寸不能为负数');
    });
  });

  describe('calculateProductBoundingVolume - 产品包络体积', () => {
    it('计算包络体积（考虑产品外形）', () => {
      const dimensions = {
        width: 10,
        height: 5,
        depth: 2
      };

      const boundingVolume = calculateProductBoundingVolume(dimensions);

      // 假设包络体积比实际体积大20%
      // 100 * 1.2 = 120 立方厘米
      expect(boundingVolume).toBe(120);
    });

    it('处理复杂形状', () => {
      const dimensions = {
        width: 10.5,
        height: 5.2,
        depth: 2.1
      };
      const boundingVolume = calculateProductBoundingVolume(dimensions);
      // 114.66 * 1.2 = 137.592 ≈ 137.59 立方厘米
      expect(boundingVolume).toBe(137.59);
    });

    it('处理异常输入', () => {
      expect(() => calculateProductBoundingVolume({ width: -10, height: 5, depth: 2 }))
        .toThrow('产品尺寸不能为负数');
      expect(() => calculateProductBoundingVolume({ width: 0, height: 5, depth: 2 }))
        .toThrow('产品尺寸不能为零');
    });
  });
});
