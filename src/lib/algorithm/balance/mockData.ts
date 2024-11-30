import type { Rectangle, Product, Point2D } from '../types';

/**
 * Mock product data for testing
 * 测试用模拟产品数据
 */
export const mockProducts: Product[] = [
  { // 左上象限
    id: 1,
    weight: 100, 
    cadData: { 
      volume: 100, 
      surfaceArea: 200,
      boundingBox: {
        min: { x: 10, y: 10, z: 0 },
        max: { x: 40, y: 40, z: 20 },
        dimensions: { x: 30, y: 30, z: 20 }
      },
      centerOfMass: { x: 25, y: 25, z: 10 }
    } 
  },
  { // 右上象限
    id: 2,
    weight: 100, 
    cadData: { 
      volume: 100, 
      surfaceArea: 200,
      boundingBox: {
        min: { x: 60, y: 10, z: 0 },
        max: { x: 90, y: 40, z: 20 },
        dimensions: { x: 30, y: 30, z: 20 }
      },
      centerOfMass: { x: 75, y: 25, z: 10 }
    } 
  },
  { // 左下象限
    id: 3,
    weight: 100, 
    cadData: { 
      volume: 100, 
      surfaceArea: 200,
      boundingBox: {
        min: { x: 10, y: 60, z: 0 },
        max: { x: 40, y: 90, z: 20 },
        dimensions: { x: 30, y: 30, z: 20 }
      },
      centerOfMass: { x: 25, y: 75, z: 10 }
    } 
  },
  { // 右下象限
    id: 4,
    weight: 100, 
    cadData: { 
      volume: 100, 
      surfaceArea: 200,
      boundingBox: {
        min: { x: 60, y: 60, z: 0 },
        max: { x: 90, y: 90, z: 20 },
        dimensions: { x: 30, y: 30, z: 20 }
      },
      centerOfMass: { x: 75, y: 75, z: 10 }
    } 
  }
];

/**
 * Mock layout data for testing
 * 测试用模拟布局数据
 */
export const mockLayout: Rectangle[] = [
  // 左上象限
  { x: 10, y: 10, width: 30, height: 30 },
  // 右上象限
  { x: 60, y: 10, width: 30, height: 30 },
  // 左下象限
  { x: 10, y: 60, width: 30, height: 30 },
  // 右下象限
  { x: 60, y: 60, width: 30, height: 30 },
];

/**
 * Mock injection point for testing
 * 测试用模拟注塑点数据
 */
export const mockInjectionPoint: Point2D = { x: 50, y: 50 };
