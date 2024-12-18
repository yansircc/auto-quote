import { calculateMoldCost } from '../cost';
import { describe, it, expect } from 'vitest';

describe('calculateMoldCost', () => {
  it('根据体积、密度和单价计算模具成本', () => {
    // 测试用的模拟值
    const mockVolume = 1000; // 立方厘米
    const mockDensity = 7.85; // 克/立方厘米（示例：钢的密度）
    const mockUnitPrice = 50; // 元/千克

    const cost = calculateMoldCost(mockVolume, mockDensity, mockUnitPrice);
    
    // 具体的预期值计算：
    // 1000 cm³ * 7.85 g/cm³ = 7850g = 7.85kg
    // 7.85kg * 50 元/kg = 392.5 元
    expect(cost).toBe(392.5);
  });

  it('处理体积为零的情况', () => {
    const cost = calculateMoldCost(0, 7.85, 50);
    expect(cost).toBe(0);
  });

  it('处理边界情况', () => {
    // 测试非常大的数值
    const largeVolume = 1000000; // 1m³
    const largeCost = calculateMoldCost(largeVolume, 7.85, 50);
    // 1,000,000 cm³ * 7.85 g/cm³ = 7,850,000g = 7,850kg
    // 7,850kg * 50 元/kg = 392,500 元
    expect(largeCost).toBe(392500);

    // 测试非常小的数值
    const smallVolume = 0.001;
    const smallCost = calculateMoldCost(smallVolume, 7.85, 50);
    // 0.001 cm³ * 7.85 g/cm³ = 0.00785g = 0.00000785kg
    // 0.00000785kg * 50 元/kg = 0.0003925 元
    expect(smallCost).toBe(0.0003925);
  });

  it('处理负数输入', () => {
    expect(() => calculateMoldCost(-100, 7.85, 50)).toThrow('体积不能为负数');
    expect(() => calculateMoldCost(100, -7.85, 50)).toThrow('密度不能为负数');
    expect(() => calculateMoldCost(100, 7.85, -50)).toThrow('单价不能为负数');
  });
});
