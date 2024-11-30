import { describe, it, expect } from 'vitest';
import { calculateBalanceScore } from '../score';
import type { Rectangle, Product } from '@/lib/algorithm/types';

describe('Balance Score Calculations', () => {
  // Test data
  // 测试数据
  const mockLayout: Rectangle[] = [
    { x: 0, y: 0, width: 10, height: 10 },
    { x: 20, y: 0, width: 10, height: 10 },
    { x: 10, y: 15, width: 10, height: 10 }
  ];

  const mockProducts: Product[] = [
    {
      id: 0,
      weight: 100,
      dimensions: { length: 10, width: 10, height: 5 },
      cadData: {
        volume: 500,
        surfaceArea: 300,
        boundingBox: {
          min: { x: 0, y: 0, z: 0 },
          max: { x: 10, y: 10, z: 5 },
          dimensions: { x: 10, y: 10, z: 5 }
        },
        centerOfMass: { x: 5, y: 5, z: 2.5 }
      }
    },
    {
      id: 1,
      weight: 150,
      dimensions: { length: 10, width: 10, height: 7 },
      cadData: {
        volume: 700,
        surfaceArea: 400,
        boundingBox: {
          min: { x: 0, y: 0, z: 0 },
          max: { x: 10, y: 10, z: 7 },
          dimensions: { x: 10, y: 10, z: 7 }
        },
        centerOfMass: { x: 5, y: 5, z: 3.5 }
      }
    },
    {
      id: 2,
      weight: 120,
      dimensions: { length: 10, width: 10, height: 6 },
      cadData: {
        volume: 600,
        surfaceArea: 350,
        boundingBox: {
          min: { x: 0, y: 0, z: 0 },
          max: { x: 10, y: 10, z: 6 },
          dimensions: { x: 10, y: 10, z: 6 }
        },
        centerOfMass: { x: 5, y: 5, z: 3 }
      }
    }
  ];

  it('should return perfect score for perfectly balanced layout', () => {
    const layout: Rectangle[] = [
      { x: -50, y: -50, width: 100, height: 100 },
      { x: 50, y: -50, width: 100, height: 100 },
      { x: -50, y: 50, width: 100, height: 100 },
      { x: 50, y: 50, width: 100, height: 100 }
    ];
    
    const products: Product[] = layout.map((_, index) => ({
      id: index,
      weight: 100,
      dimensions: { length: 100, width: 100, height: 10 }
    }));

    const score = calculateBalanceScore(layout, products);
    expect(score.total).toBeGreaterThan(90); // Should be close to 100 for perfect balance
    expect(score.details.geometry).toBeGreaterThan(90);
    expect(score.details.distribution).toBeGreaterThan(90);
  });

  it('should handle unbalanced layout with varying weights', () => {
    const layout: Rectangle[] = [
      { x: -100, y: 0, width: 100, height: 100 },
      { x: 100, y: 0, width: 100, height: 100 }
    ];
    
    const products: Product[] = [
      {
        id: 0,
        weight: 100,
        dimensions: { length: 100, width: 100, height: 10 }
      },
      {
        id: 1,
        weight: 300, // Much heavier on one side
        dimensions: { length: 100, width: 100, height: 10 }
      }
    ];

    const score = calculateBalanceScore(layout, products);
    expect(score.total).toBeLessThan(50); // Should be low score due to imbalance
    expect(score.details.geometry).toBeLessThan(50);
    expect(score.details.distribution).toBeLessThan(50);
  });

  it('should handle layout with CAD data', () => {
    const layout: Rectangle[] = [
      { x: 0, y: -50, width: 100, height: 100 },
      { x: 0, y: 50, width: 100, height: 100 }
    ];
    
    const products: Product[] = [
      {
        id: 0,
        weight: 100,
        dimensions: { length: 100, width: 100, height: 10 },
        cadData: {
          volume: 100000,
          surfaceArea: 10000,
          boundingBox: {
            min: { x: 0, y: 0, z: 0 },
            max: { x: 100, y: 100, z: 10 },
            dimensions: { x: 100, y: 100, z: 10 }
          },
          centerOfMass: { x: 0, y: 0, z: 0 }
        }
      },
      {
        id: 1,
        weight: 100,
        dimensions: { length: 100, width: 100, height: 10 },
        cadData: {
          volume: 100000,
          surfaceArea: 10000,
          boundingBox: {
            min: { x: 0, y: 0, z: 0 },
            max: { x: 100, y: 100, z: 10 },
            dimensions: { x: 100, y: 100, z: 10 }
          },
          centerOfMass: { x: 0, y: 0, z: 0 }
        }
      }
    ];

    const score = calculateBalanceScore(layout, products);
    expect(score.total).toBeGreaterThan(80); // Should be high score for balanced CAD layout
    expect(score.confidence).toBe(1); // Full confidence with CAD data
  });

  it('should handle missing product data gracefully', () => {
    const layout: Rectangle[] = [
      { x: -50, y: 0, width: 100, height: 100 },
      { x: 50, y: 0, width: 100, height: 100 }
    ];
    
    const products: Product[] = [
      {
        id: 0,
        weight: 100,
        dimensions: { length: 100, width: 100, height: 10 }
      },
      {
        id: 1,
        weight: 100,
        dimensions: { length: 100, width: 100, height: 10 }
      }
    ];

    const score = calculateBalanceScore(layout, products);
    expect(score.total).toBeGreaterThanOrEqual(0); // Should not crash and return valid score
    expect(score.total).toBeLessThanOrEqual(100);
    expect(score.confidence).toBe(0); // No confidence without CAD data
  });

  it('should calculate balance score for perfect layout', () => {
    const balancedScore = calculateBalanceScore(mockLayout, mockProducts);
    
    // Check overall score
    // 检查总分
    expect(balancedScore.total).toBeGreaterThan(0);
    expect(balancedScore.total).toBeLessThanOrEqual(100);

    // Check detail scores
    // 检查详细分数
    expect(balancedScore.details.geometry).toBeGreaterThan(0);
    expect(balancedScore.details.flow).toBeGreaterThan(0);
    expect(balancedScore.details.distribution).toBeGreaterThan(0);
    expect(balancedScore.details.volume).toBeGreaterThan(0);
    
    // Check confidence
    // 检查置信度
    expect(balancedScore.confidence).toBe(1); // All products have CAD data
  });

  it('should handle products without CAD data', () => {
    const productsWithoutCAD = mockProducts.map(p => ({
      ...p,
      cadData: undefined
    }));
    
    const score = calculateBalanceScore(mockLayout, productsWithoutCAD);
    
    expect(score.confidence).toBe(0);
  });

  it('should penalize unbalanced layouts', () => {
    const unbalancedLayout: Rectangle[] = [
      { x: 0, y: 0, width: 10, height: 10 },
      { x: 50, y: 0, width: 10, height: 10 },
      { x: 100, y: 0, width: 10, height: 10 }
    ];
    
    const unbalancedScore = calculateBalanceScore(unbalancedLayout, mockProducts);
    const balancedScore = calculateBalanceScore(mockLayout, mockProducts);
    
    expect(unbalancedScore.total).toBeLessThan(balancedScore.total);
  });
});

// bun test src/lib/algorithm/balance/__tests__/score.test.ts