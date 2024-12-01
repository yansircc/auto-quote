import { describe, expect, test } from 'vitest';
import { calculateDetailedFlowScore } from '../index';
import type { Rectangle, Point2D, Product } from '@/types/geometry';

const createTestProduct = (
  id: number,
  dimensions = { length: 50, width: 50, height: 10 },
  weight = 1,
  volume = 1000,
  surfaceArea = 600,
  flowLength?: number
): Product => {
  const cadData = {
    volume,
    surfaceArea,
    boundingBox: {
      min: { x: 0, y: 0, z: 0 },
      max: { x: dimensions.length, y: dimensions.height, z: dimensions.width },
      dimensions: { x: dimensions.length, y: dimensions.height, z: dimensions.width }
    },
    centerOfMass: { 
      x: dimensions.length / 2,
      y: dimensions.height / 2,
      z: dimensions.width / 2
    }
  };

  return {
    id,
    weight,
    dimensions,
    cadData,
    flowLength
  };
};

describe('Flow Score Calculation', () => {
  // Basic Cases
  test('should handle empty layout', () => {
    const layout: Rectangle[] = [];
    const products: Product[] = [];
    const injectionPoint: Point2D = { x: 0, y: 0 };
    
    const score = calculateDetailedFlowScore(layout, products, injectionPoint);
    expect(score.overall).toBe(0);
  });

  test('should handle single product layout', () => {
    const layout: Rectangle[] = [
      { x: 0, y: 0, width: 50, height: 50 }
    ];
    
    const products: Product[] = [createTestProduct(1)];
    const injectionPoint: Point2D = { x: 0, y: 0 };
    
    const score = calculateDetailedFlowScore(layout, products, injectionPoint);
    expect(score.overall).toBeGreaterThan(90); // 单个产品应该获得高分
    expect(score.flowPathBalance).toBe(100);
  });

  // 对称布局测试
  test('should calculate horizontal symmetric layout score', () => {
    const layout: Rectangle[] = [
      { x: -100, y: 0, width: 50, height: 50 },
      { x: 100, y: 0, width: 50, height: 50 }
    ];
    
    const products: Product[] = [
      createTestProduct(1),
      createTestProduct(2)
    ];
    
    const injectionPoint: Point2D = { x: 0, y: 0 };
    
    const score = calculateDetailedFlowScore(layout, products, injectionPoint);
    expect(score.overall).toBeGreaterThan(80);
    expect(score.flowPathBalance).toBeGreaterThan(90);
  });

  test('should calculate vertical symmetric layout score', () => {
    const layout: Rectangle[] = [
      { x: 0, y: -100, width: 50, height: 50 },
      { x: 0, y: 100, width: 50, height: 50 }
    ];
    
    const products: Product[] = [
      createTestProduct(1),
      createTestProduct(2)
    ];
    
    const injectionPoint: Point2D = { x: 0, y: 0 };
    
    const score = calculateDetailedFlowScore(layout, products, injectionPoint);
    expect(score.overall).toBeGreaterThan(80);
    expect(score.flowPathBalance).toBeGreaterThan(90);
  });

  test('should calculate quad symmetric layout score', () => {
    const layout: Rectangle[] = [
      { x: -100, y: -100, width: 50, height: 50 },
      { x: 100, y: -100, width: 50, height: 50 },
      { x: -100, y: 100, width: 50, height: 50 },
      { x: 100, y: 100, width: 50, height: 50 }
    ];
    
    const products: Product[] = [
      createTestProduct(1),
      createTestProduct(2),
      createTestProduct(3),
      createTestProduct(4)
    ];
    
    const injectionPoint: Point2D = { x: 0, y: 0 };
    
    const score = calculateDetailedFlowScore(layout, products, injectionPoint);
    expect(score.overall).toBeGreaterThan(85); // 四重对称应该获得很高的分数
    expect(score.flowPathBalance).toBeGreaterThan(95);
  });

  // 渐进布局测试
  test('should calculate horizontal progressive layout score', () => {
    const layout: Rectangle[] = [
      { x: 0, y: 0, width: 50, height: 50 },
      { x: 60, y: 0, width: 50, height: 50 },
      { x: 120, y: 0, width: 50, height: 50 }
    ];
    
    const products: Product[] = [
      createTestProduct(1),
      createTestProduct(2),
      createTestProduct(3)
    ];
    
    const injectionPoint: Point2D = { x: 0, y: 0 };
    
    const score = calculateDetailedFlowScore(layout, products, injectionPoint);
    expect(score.overall).toBeGreaterThan(70);
    expect(score.flowPathBalance).toBeGreaterThan(80);
  });

  test('should calculate vertical progressive layout score', () => {
    const layout: Rectangle[] = [
      { x: 0, y: 0, width: 50, height: 50 },
      { x: 0, y: 60, width: 50, height: 50 },
      { x: 0, y: 120, width: 50, height: 50 }
    ];
    
    const products: Product[] = [
      createTestProduct(1),
      createTestProduct(2),
      createTestProduct(3)
    ];
    
    const injectionPoint: Point2D = { x: 0, y: 0 };
    
    const score = calculateDetailedFlowScore(layout, products, injectionPoint);
    expect(score.overall).toBeGreaterThan(70);
    expect(score.flowPathBalance).toBeGreaterThan(80);
  });

  test('should handle progressive layout with varying gaps', () => {
    const layout: Rectangle[] = [
      { x: 0, y: 0, width: 50, height: 50 },
      { x: 70, y: 0, width: 50, height: 50 },
      { x: 150, y: 0, width: 50, height: 50 }
    ];
    
    const products: Product[] = [
      createTestProduct(1),
      createTestProduct(2),
      createTestProduct(3)
    ];
    
    const injectionPoint: Point2D = { x: 0, y: 0 };
    
    const score = calculateDetailedFlowScore(layout, products, injectionPoint);
    expect(score.overall).toBeGreaterThan(65); // 由于间隙不均匀，分数应该略低
    expect(score.flowPathBalance).toBeGreaterThan(75);
  });

  // 复杂布局测试
  test('should handle mixed symmetric and progressive layout', () => {
    const layout: Rectangle[] = [
      { x: -120, y: 0, width: 50, height: 50 },
      { x: -60, y: 0, width: 50, height: 50 },
      { x: 60, y: 0, width: 50, height: 50 },
      { x: 120, y: 0, width: 50, height: 50 }
    ];
    
    const products: Product[] = [
      createTestProduct(1),
      createTestProduct(2),
      createTestProduct(3),
      createTestProduct(4)
    ];
    
    const injectionPoint: Point2D = { x: 0, y: 0 };
    
    const score = calculateDetailedFlowScore(layout, products, injectionPoint);
    expect(score.overall).toBeGreaterThan(70); // 应该同时检测到对称性和渐进性
  });

  test('should handle circular layout', () => {
    const radius = 100;
    const layout: Rectangle[] = Array.from({ length: 8 }, (_, i) => {
      const angle = (i * Math.PI * 2) / 8;
      return {
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
        width: 50,
        height: 50
      };
    });
    
    const products: Product[] = Array.from({ length: 8 }, (_, i) =>
      createTestProduct(i + 1)
    );
    
    const injectionPoint: Point2D = { x: 0, y: 0 };
    
    const score = calculateDetailedFlowScore(layout, products, injectionPoint);
    expect(score.overall).toBeGreaterThan(85); // 环形布局应该获得高分
    expect(score.flowPathBalance).toBeGreaterThan(90);
  });

  // Edge Cases and Error Handling
  test('should handle mismatched layout and products', () => {
    const layout: Rectangle[] = [
      { x: 0, y: 0, width: 50, height: 50 }
    ];
    
    const products: Product[] = [
      createTestProduct(1),
      createTestProduct(2)
    ];
    
    const injectionPoint: Point2D = { x: 0, y: 0 };
    
    const score = calculateDetailedFlowScore(layout, products, injectionPoint);
    expect(score.overall).toBe(0);
  });

  test('should handle products with predefined flow lengths', () => {
    const layout: Rectangle[] = [
      { x: -100, y: 0, width: 50, height: 50 },
      { x: 100, y: 0, width: 50, height: 50 }
    ];
    
    const products: Product[] = [
      createTestProduct(1, undefined, 1, 1000, 600, 100),
      createTestProduct(2, undefined, 1, 1000, 600, 100)
    ];
    
    const injectionPoint: Point2D = { x: 0, y: 0 };
    
    const score = calculateDetailedFlowScore(layout, products, injectionPoint);
    expect(score.overall).toBeGreaterThan(80); // 应该使用预定义的流动长度
  });

  test('should handle products with varying weights', () => {
    const layout: Rectangle[] = [
      { x: -100, y: 0, width: 50, height: 50 },
      { x: 100, y: 0, width: 50, height: 50 }
    ];
    
    const products: Product[] = [
      createTestProduct(1, undefined, 2), // 双重重量
      createTestProduct(2, undefined, 1)
    ];
    
    const injectionPoint: Point2D = { x: 0, y: 0 };
    
    const score = calculateDetailedFlowScore(layout, products, injectionPoint);
    expect(score.overall).toBeGreaterThan(70); // 应该处理重量差异
  });

  test('should handle products with varying dimensions', () => {
    const layout: Rectangle[] = [
      { x: -100, y: 0, width: 50, height: 50 },
      { x: 100, y: 0, width: 100, height: 100 } // 更大的产品
    ];
    
    const products: Product[] = [
      createTestProduct(1),
      createTestProduct(2, { length: 100, width: 100, height: 20 }, 1, 2000, 1200)
    ];
    
    const injectionPoint: Point2D = { x: 0, y: 0 };
    
    const score = calculateDetailedFlowScore(layout, products, injectionPoint);
    expect(score.overall).toBeGreaterThan(65); // 应该处理尺寸差异
  });

  test('should handle non-zero injection point', () => {
    const layout: Rectangle[] = [
      { x: 0, y: 0, width: 50, height: 50 },
      { x: 60, y: 0, width: 50, height: 50 }
    ];
    
    const products: Product[] = [
      createTestProduct(1),
      createTestProduct(2)
    ];
    
    const injectionPoint: Point2D = { x: 30, y: 30 };
    
    const score = calculateDetailedFlowScore(layout, products, injectionPoint);
    expect(score.overall).toBeGreaterThan(70); // 应该处理偏移注射点
  });
});