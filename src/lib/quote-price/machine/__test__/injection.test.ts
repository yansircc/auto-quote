import { describe, it, expect } from "vitest";
import { calculateInjectionVolume, calculateSafeInjectionVolume } from "../injection";
import type { Product } from "../../product/types";
import type { MachineConfig } from "../types";

describe('注胶量计算', () => {
  const mockProduct: Product = {
    id: '1',
    name: '测试产品',
    material: {
      name: '测试材料',
      density: 1.5,
      price: 10,
      shrinkageRate: 0.02,
      processingTemp: 200,
    },
    color: 'red',
    dimensions: {
      width: 100,
      height: 100,
      depth: 100,
    },
    quantity: 1000,
    envelopeVolume: 1000,
    netVolume: 1000,
  };

  const mockMachineConfig: MachineConfig = {
    maxInjectionVolume: 1000,
    smallBatchThreshold: 1000,
    tonnageRange: [50, 1500],
    tonnageRates: [0.5, 1.0, 1.5],
    tonnageThresholds: [50, 100, 200],
    smallBatchRates: [0.8, 1.0, 1.2],
    safetyFactor: 0.8,
  };

  describe('calculateInjectionVolume', () => {
    it('应正确计算单个产品的注胶量', () => {
      const products = [mockProduct];
      const cavities = [4];
      const expectedVolume = mockProduct.envelopeVolume * mockProduct.material.density * (cavities[0] ?? 1);
      
      const result = calculateInjectionVolume(products, cavities);
      expect(result).toBe(expectedVolume);
    });

    it('应正确计算多个产品的总注胶量', () => {
      const products = [mockProduct, { ...mockProduct, netVolume: 200 }];
      const cavities = [4, 2];
      
      const expectedVolume = products.reduce((sum, product, index) => {
        return sum + (product.netVolume * product.material.density * (cavities[index] ?? 1));
      }, 0);

      const result = calculateInjectionVolume(products, cavities);
      expect(result).toBe(expectedVolume);
    });

    it('当产品数量与穴数数量不一致时应抛出错误', () => {
      const products = [mockProduct];
      const cavities = [4, 2];

      expect(() => {
        calculateInjectionVolume(products, cavities);
      }).toThrow('产品和穴数数量不一致');
    });
  });

  describe('calculateSafeInjectionVolume', () => {
    it('应正确计算安全注胶量', () => {
      const volume = 500;
      
      const result = calculateSafeInjectionVolume(volume, mockMachineConfig);
      expect(result).toBe(625);
    });

    it('当安全注胶量超过机器容量时应抛出错误', () => {
      const volume = 1500; // 1500 * 0.8 > 1000
      
      expect(() => {
        calculateSafeInjectionVolume(volume, mockMachineConfig);
      }).toThrow('注胶量超过机器最大容量');
    });
  });
}); 