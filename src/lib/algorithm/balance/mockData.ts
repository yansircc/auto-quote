import type { Rectangle, Product, Point2D } from '@/types/geometry';
import { calculateMinArea } from '../min-area';

/**
 * Mock product data for testing
 * 测试用模拟产品数据
 */
export const mockProducts: Product[] = [
  { // 左上象限
    id: 1,
    weight: 100, 
    dimensions: {
      length: 30,
      width: 30,
      height: 20
    },
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
    dimensions: {
      length: 30,
      width: 30,
      height: 20
    },
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
    dimensions: {
      length: 30,
      width: 30,
      height: 20
    },
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
    dimensions: {
      length: 30,
      width: 30,
      height: 20
    },
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

// 使用 min-area 算法生成布局（现在可以直接使用 mockProducts）
const minAreaResult = calculateMinArea(mockProducts);

// 注入点位置（模具中心）
export const mockInjectionPoint: Point2D = { 
  x: minAreaResult.width / 2, 
  y: minAreaResult.length / 2 
};

// 布局结果 - 保持原始布局，不进行坐标转换
export const mockLayout: Rectangle[] = minAreaResult.layout;
