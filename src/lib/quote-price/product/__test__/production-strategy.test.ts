import { RiskLevel } from '../../risk/types';
import {
  determineProductionStrategy,
  calculateProductionShots,
  calculateColorChanges,
  generateProductionBatches
} from '../production-strategy';
import { ProductionStrategy } from '../types';
import type { Product, ProductGroup } from '../types';
import { describe, it, expect } from 'vitest';
describe('Production Strategy', () => {
  const mockProduct1: Product = {
    id: '1',
    material: {
      name: 'ABS',
      density: 1.05,
      price: 100,
      shrinkageRate: 0.02,
      processingTemp: 200,
    },
    name: '产品1',
    color: '402C',
    quantity: 1000,
    dimensions: {
      width: 100,
      height: 100,
      depth: 100,
    },
    netVolume: 1000,
    envelopeVolume: 1200,
  };

  const mockProduct2: Product = {
    id: '2',
    material: {
      name: 'ABS',
      density: 1.05,
      price: 100,
      shrinkageRate: 0.02,
      processingTemp: 200,
    },
    name: '产品2',
    color: '402C',
    quantity: 2000,
    dimensions: {
      width: 100,
      height: 100,
      depth: 100,
    },
    netVolume: 2000,
    envelopeVolume: 2400,
  };

  const mockProduct3: Product = {
    id: '3',
    name: '产品3',
    material: {
      name: 'ABS',
      density: 1.05,
      price: 100,
      shrinkageRate: 0.02,
      processingTemp: 200,
    },
    color: '805C',
    quantity: 1500,
    dimensions: {
      width: 100,
      height: 100,
      depth: 100,
    },
    netVolume: 1500,
    envelopeVolume: 1800,
  };

  const mockProduct4: Product = {
    id: '4',
    name: '产品4',
    material: {
      name: 'PP',
      density: 0.9,
      price: 100,
      shrinkageRate: 0.02,
      processingTemp: 200,
    },
    color: '402C',
    quantity: 1200,
    dimensions: {
      width: 100,
      height: 100,
      depth: 100,
    },
    netVolume: 1200,
    envelopeVolume: 1440,
  };

  describe('determineProductionStrategy', () => {
    it('应该在产品列表为空时抛出错误', () => {
      expect(() => determineProductionStrategy([])).toThrow('产品列表不能为空');
    });

    it('应该在产品颜色相同且材料相同时返回同时生产策略', () => {
      const result = determineProductionStrategy([mockProduct1, mockProduct2]);
      expect(result).toBe(ProductionStrategy.SIMULTANEOUS);
    });

    it('应该在产品颜色不同时返回分批生产策略', () => {
      const result = determineProductionStrategy([mockProduct1, mockProduct3]);
      expect(result).toBe(ProductionStrategy.SEQUENTIAL);
    });

    it('应该在产品材料不同时返回分批生产策略', () => {
      const result = determineProductionStrategy([mockProduct1, mockProduct4]);
      expect(result).toBe(ProductionStrategy.SEQUENTIAL);
    });
  });

  describe('calculateProductionShots', () => {
    const mockGroup: ProductGroup = {
      products: [mockProduct1, mockProduct2],
      cavities: [4, 4],
      totalShots: 1000,
      riskScore: 0,
      riskLevel: RiskLevel.LOW,
    };

    it('应该在产品组为空时抛出错误', () => {
      expect(() => calculateProductionShots({ products: [], cavities: [] }))
        .toThrow('产品组不能为空');
    });

    it('应该在穴数信息不完整时抛出错误', () => {
      expect(() => calculateProductionShots({ products: [mockProduct1], cavities: [] }))
        .toThrow('穴数信息不完整或不匹配');
    });

    it('应该正确计算同时生产的模次', () => {
      const shots = calculateProductionShots(mockGroup);
      // mockProduct2 的需求量最大：2000/4 = 500（向上取整）
      expect(shots).toBe(500);
    });

    it('应该正确计算分批生产的模次', () => {
      const sequentialGroup: ProductGroup = {
        products: [mockProduct1, mockProduct3],
        cavities: [4, 4],
        totalShots: 1000,
        riskScore: 0,
        riskLevel: RiskLevel.LOW,
      };
      const shots = calculateProductionShots(sequentialGroup);
      // mockProduct1: 1000/4 = 250, mockProduct3: 1500/4 = 375, 总和 = 625
      expect(shots).toBe(625);
    });
  });

  describe('calculateColorChanges', () => {
    it('应该在产品列表为空时抛出错误', () => {
      expect(() => calculateColorChanges([])).toThrow('产品列表不能为空');
    });

    it('应该正确计算换色次数', () => {
      const products = [mockProduct1, mockProduct2, mockProduct3];
      const changes = calculateColorChanges(products);
      expect(changes).toBe(1); // 两种颜色，需要换色一次
    });

    it('应该在所有产品颜色相同时返回0', () => {
      const products = [mockProduct1, mockProduct2];
      const changes = calculateColorChanges(products);
      expect(changes).toBe(0);
    });
  });

  describe('generateProductionBatches', () => {
    it('应该在产品组为空时抛出错误', () => {
      expect(() => generateProductionBatches({ products: [], cavities: [] }))
        .toThrow('产品组不能为空');
    });

    it('应该为同时生产策略生成单个批次', () => {
      const group: ProductGroup = {
        products: [mockProduct1, mockProduct2],
        cavities: [4, 4],
        totalShots: 1000,
        riskScore: 0,
        riskLevel: RiskLevel.LOW,
      };
      const batches = generateProductionBatches(group);
      expect(batches).toHaveLength(1);
      expect(batches[0]).toHaveLength(2);
    });

    it('应该为分批生产策略按颜色生成多个批次', () => {
      const group: ProductGroup = {
        products: [mockProduct1, mockProduct2, mockProduct3],
        cavities: [4, 4, 4],
        totalShots: 1000,
        riskScore: 0,
        riskLevel: RiskLevel.LOW,
      };
      const batches = generateProductionBatches(group);
      expect(batches).toHaveLength(2); // 两种颜色，两个批次
      expect(batches.flat()).toHaveLength(3); // 总共3个产品
    });
  });
});
