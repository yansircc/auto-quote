import { findOptimalCavityCount } from '../cavity-selection';
import { describe, it, expect } from 'vitest';

describe('穴数优化', () => {
  describe('findOptimalCavityCount', () => {
    it('小批量产品的穴数优化', () => {
      const quantity = 1000;
      const cavityCount = findOptimalCavityCount(quantity);
      
      // 小批量生产（1000件以下）通常使用1-4穴模具
      expect(cavityCount).toBeGreaterThanOrEqual(1);
      expect(cavityCount).toBeLessThanOrEqual(4);
      // 假设1000件最优穴数为2
      expect(cavityCount).toBe(2);
    });

    it('中批量产品的穴数优化', () => {
      const quantity = 10000;
      const cavityCount = findOptimalCavityCount(quantity);
      
      // 中批量生产（1000-50000件）通常使用4-8穴模具
      expect(cavityCount).toBeGreaterThanOrEqual(4);
      expect(cavityCount).toBeLessThanOrEqual(8);
      // 假设10000件最优穴数为4
      expect(cavityCount).toBe(4);
    });

    it('大批量产品的穴数优化', () => {
      const quantity = 100000;
      const cavityCount = findOptimalCavityCount(quantity);
      
      // 大批量生产（50000件以上）通常使用8穴以上模具
      expect(cavityCount).toBeGreaterThanOrEqual(8);
      expect(cavityCount).toBeLessThanOrEqual(32);
      // 假设100000件最优穴数为16
      expect(cavityCount).toBe(16);
    });

    it('处理异常输入', () => {
      expect(() => findOptimalCavityCount(-1000))
        .toThrow('产品数量不能为负数');
      expect(() => findOptimalCavityCount(0))
        .toThrow('产品数量不能为零');
    });

    it('处理极限数量', () => {
      const maxQuantity = 1000000;
      const cavityCount = findOptimalCavityCount(maxQuantity);
      
      // 即使数量再大，穴数也要考虑实际工艺限制
      expect(cavityCount).toBeLessThanOrEqual(32);
      // 假设100万件最优穴数为32
      expect(cavityCount).toBe(32);
    });

    it('处理特殊数量', () => {
      // 边界情况：刚好在小批量和中批量的分界线
      expect(findOptimalCavityCount(1000)).toBe(2);
      // 边界情况：刚好在中批量和大批量的分界线
      expect(findOptimalCavityCount(50000)).toBe(8);
    });
  });
});
