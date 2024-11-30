import type { Rectangle, Product, Point2D } from '@/types/geometry';

// Test Case 1: Perfectly balanced square layout
// 测试用例1：完美平衡的正方形布局
export const perfectSquareLayout = {
  layout: [
    { x: -50, y: -50, width: 100, height: 100 },
    { x: 50, y: -50, width: 100, height: 100 },
    { x: -50, y: 50, width: 100, height: 100 },
    { x: 50, y: 50, width: 100, height: 100 }
  ] as Rectangle[],
  products: [
    { id: 0, weight: 100, flowLength: 70.71 }, // sqrt(50^2 + 50^2)
    { id: 1, weight: 100, flowLength: 70.71 },
    { id: 2, weight: 100, flowLength: 70.71 },
    { id: 3, weight: 100, flowLength: 70.71 }
  ] as Product[],
  injectionPoint: { x: 0, y: 0 } as Point2D,
  description: 'Perfect square layout with equal weights and balanced flow lengths'
};

// Test Case 2: Linear layout (extreme case for distribution)
// 测试用例2：线性布局（分布的极端情况）
export const linearLayout = {
  layout: [
    { x: 0, y: 0, width: 10, height: 10 },
    { x: 20, y: 0, width: 10, height: 10 },
    { x: 40, y: 0, width: 10, height: 10 },
    { x: 60, y: 0, width: 10, height: 10 }
  ] as Rectangle[],
  products: [
    { id: 0, weight: 100, flowLength: 5 },
    { id: 1, weight: 100, flowLength: 25 },
    { id: 2, weight: 100, flowLength: 45 },
    { id: 3, weight: 100, flowLength: 65 }
  ] as Product[],
  injectionPoint: { x: 0, y: 0 } as Point2D,
  description: 'Linear layout with increasing flow lengths'
};

// Test Case 3: Asymmetric weight distribution
// 测试用例3：不对称重量分布
export const asymmetricLayout = {
  layout: [
    { x: -30, y: -30, width: 60, height: 60 },
    { x: 30, y: -30, width: 30, height: 30 },
    { x: -30, y: 30, width: 30, height: 30 },
    { x: 30, y: 30, width: 60, height: 60 }
  ] as Rectangle[],
  products: [
    { id: 0, weight: 200, flowLength: 42.43 }, // Heavy product
    { id: 1, weight: 50, flowLength: 42.43 },  // Light product
    { id: 2, weight: 50, flowLength: 42.43 },  // Light product
    { id: 3, weight: 200, flowLength: 42.43 }  // Heavy product
  ] as Product[],
  injectionPoint: { x: 0, y: 0 } as Point2D,
  description: 'Asymmetric layout with varying weights but equal flow lengths'
};

// Test Case 4: Extreme size differences
// 测试用例4：极端尺寸差异
export const extremeSizeLayout = {
  layout: [
    { x: -100, y: -100, width: 200, height: 200 }, // Very large
    { x: 110, y: -5, width: 10, height: 10 },     // Very small
    { x: -5, y: 110, width: 10, height: 10 },     // Very small
    { x: 110, y: 110, width: 10, height: 10 }     // Very small
  ] as Rectangle[],
  products: [
    { id: 0, weight: 1000, flowLength: 141.42 }, // Heavy large product
    { id: 1, weight: 10, flowLength: 110.11 },   // Light small product
    { id: 2, weight: 10, flowLength: 110.11 },   // Light small product
    { id: 3, weight: 10, flowLength: 155.56 }    // Light small product
  ] as Product[],
  injectionPoint: { x: 0, y: 0 } as Point2D,
  description: 'Layout with extreme size and weight differences'
};

// Test Case 5: Dense cluster with offset injection point
// 测试用例5：偏移注塑点的密集布局
export const denseClusterLayout = {
  layout: [
    { x: 100, y: 100, width: 20, height: 20 },
    { x: 120, y: 100, width: 20, height: 20 },
    { x: 100, y: 120, width: 20, height: 20 },
    { x: 120, y: 120, width: 20, height: 20 }
  ] as Rectangle[],
  products: [
    { id: 0, weight: 100, flowLength: 141.42 },
    { id: 1, weight: 100, flowLength: 156.52 },
    { id: 2, weight: 100, flowLength: 156.52 },
    { id: 3, weight: 100, flowLength: 169.71 }
  ] as Product[],
  injectionPoint: { x: 0, y: 0 } as Point2D,
  description: 'Dense cluster layout with offset injection point'
};

// Test Case 6: Circular layout with varying sizes
// 测试用例6：环形布局，不同尺寸
export const circularLayout = {
  layout: [
    { x: -50, y: 0, width: 30, height: 30 },
    { x: 0, y: -50, width: 40, height: 40 },
    { x: 50, y: 0, width: 30, height: 30 },
    { x: 0, y: 50, width: 40, height: 40 }
  ] as Rectangle[],
  products: [
    { id: 0, weight: 80, flowLength: 50 },
    { id: 1, weight: 120, flowLength: 50 },
    { id: 2, weight: 80, flowLength: 50 },
    { id: 3, weight: 120, flowLength: 50 }
  ] as Product[],
  injectionPoint: { x: 0, y: 0 } as Point2D,
  description: 'Circular layout with alternating product sizes and weights'
};

// Test Case 7: Z-shaped layout
// 测试用例7：Z形布局
export const zShapedLayout = {
  layout: [
    { x: -60, y: -60, width: 40, height: 40 },
    { x: 0, y: 0, width: 40, height: 40 },
    { x: 60, y: 60, width: 40, height: 40 }
  ] as Rectangle[],
  products: [
    { id: 0, weight: 100, flowLength: 84.85 },
    { id: 1, weight: 100, flowLength: 0 },
    { id: 2, weight: 100, flowLength: 84.85 }
  ] as Product[],
  injectionPoint: { x: 0, y: 0 } as Point2D,
  description: 'Z-shaped layout testing diagonal balance'
};

// Test Case 8: Mixed volume products
// 测试用例8：混合体积产品
export const mixedVolumeLayout = {
  layout: [
    { x: -40, y: -40, width: 80, height: 80 },
    { x: 50, y: -30, width: 40, height: 40 },
    { x: -30, y: 50, width: 40, height: 40 },
    { x: 50, y: 50, width: 40, height: 40 }
  ] as Rectangle[],
  products: [
    { 
      id: 0, 
      weight: 200, 
      flowLength: 56.57,
      cadData: { volume: 1000, surfaceArea: 2000 }
    },
    { 
      id: 1, 
      weight: 100, 
      flowLength: 58.31,
      cadData: { volume: 500, surfaceArea: 1000 }
    },
    { 
      id: 2, 
      weight: 100, 
      flowLength: 58.31,
      cadData: { volume: 500, surfaceArea: 1000 }
    },
    { 
      id: 3, 
      weight: 100, 
      flowLength: 70.71,
      cadData: { volume: 500, surfaceArea: 1000 }
    }
  ] as Product[],
  injectionPoint: { x: 0, y: 0 } as Point2D,
  description: 'Layout with varying volumes and surface areas'
};

// Test Case 9: Spiral layout
// 测试用例9：螺旋形布局
export const spiralLayout = {
  layout: [
    { x: -20, y: -20, width: 20, height: 20 },
    { x: 10, y: -30, width: 20, height: 20 },
    { x: 30, y: 0, width: 20, height: 20 },
    { x: 20, y: 30, width: 20, height: 20 },
    { x: -10, y: 40, width: 20, height: 20 }
  ] as Rectangle[],
  products: [
    { id: 0, weight: 100, flowLength: 28.28 },
    { id: 1, weight: 100, flowLength: 31.62 },
    { id: 2, weight: 100, flowLength: 30.00 },
    { id: 3, weight: 100, flowLength: 36.06 },
    { id: 4, weight: 100, flowLength: 41.23 }
  ] as Product[],
  injectionPoint: { x: 0, y: 0 } as Point2D,
  description: 'Spiral layout testing progressive flow lengths'
};

// Test Case 10: Extreme aspect ratio
// 测试用例10：极端宽高比
export const extremeAspectLayout = {
  layout: [
    { x: -100, y: -10, width: 200, height: 10 },  // Very wide
    { x: 110, y: -50, width: 10, height: 100 },   // Very tall
    { x: -50, y: 20, width: 10, height: 100 },    // Very tall
    { x: 50, y: 20, width: 200, height: 10 }      // Very wide
  ] as Rectangle[],
  products: [
    { id: 0, weight: 100, flowLength: 100.50 },
    { id: 1, weight: 100, flowLength: 120.42 },
    { id: 2, weight: 100, flowLength: 53.85 },
    { id: 3, weight: 100, flowLength: 53.85 }
  ] as Product[],
  injectionPoint: { x: 0, y: 0 } as Point2D,
  description: 'Layout with extreme aspect ratios'
};
