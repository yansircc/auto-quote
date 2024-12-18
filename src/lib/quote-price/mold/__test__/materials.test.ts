import { getMaterialDensity, getMaterialUnitPrice } from '../materials/material-types';
import { describe, it, expect } from 'vitest';

describe('材料属性测试', () => {
  describe('getMaterialDensity', () => {
    it('获取钢材的密度', () => {
      const density = getMaterialDensity('steel');
      // 钢材密度约为 7.85 g/cm³
      expect(density).toBe(7.85);
    });

    it('获取铝材的密度', () => {
      const density = getMaterialDensity('aluminum');
      // 铝材密度约为 2.7 g/cm³
      expect(density).toBe(2.7);
    });

    it('获取铜材的密度', () => {
      const density = getMaterialDensity('copper');
      // 铜材密度约为 8.96 g/cm³
      expect(density).toBe(8.96);
    });

    it('处理未知材料类型', () => {
      expect(() => getMaterialDensity('unknown_material'))
        .toThrow('未知的材料类型');
    });
  });

  describe('getMaterialUnitPrice', () => {
    it('获取钢材的单价', () => {
      const price = getMaterialUnitPrice('steel');
      // 假设钢材单价为 50 元/kg
      expect(price).toBe(50);
    });

    it('获取铝材的单价', () => {
      const price = getMaterialUnitPrice('aluminum');
      // 假设铝材单价为 80 元/kg
      expect(price).toBe(80);
    });

    it('获取铜材的单价', () => {
      const price = getMaterialUnitPrice('copper');
      // 假设铜材单价为 120 元/kg
      expect(price).toBe(120);
    });

    it('处理未知材料类型', () => {
      expect(() => getMaterialUnitPrice('unknown_material'))
        .toThrow('未知的材料类型');
    });
  });
});
