import type { Rectangle, Point2D } from '@/types/core/geometry';
import type { Product } from '@/types/domain/product';
import { calculateInjectionPoint, calculateDistance, calculateRectCenter } from '@/lib/algorithm/balance/utils/geometry';

// Helper function to calculate flow lengths based on injection point
// 辅助函数：基于注胶点计算流长
function calculateFlowLengths(layout: Rectangle[], injectionPoint: Point2D): number[] {
  return layout.map(rect => {
    const center = calculateRectCenter(rect);
    return calculateDistance(injectionPoint, center);
  });
}

// Test Case 1: Perfectly balanced square layout
// 测试用例1：完美平衡的正方形布局
export const perfectSquareLayout = (() => {
  const layout = [
    { x: -50, y: -50, width: 100, height: 100 },
    { x: 50, y: -50, width: 100, height: 100 },
    { x: -50, y: 50, width: 100, height: 100 },
    { x: 50, y: 50, width: 100, height: 100 }
  ] as Rectangle[];
  
  const injectionPoint = calculateInjectionPoint(layout);
  const flowLengths = calculateFlowLengths(layout, injectionPoint);
  
  return {
    layout,
    products: layout.map((_, i) => ({
      id: i,
      weight: 100,
      flowLength: flowLengths[i]
    })) as Product[],
    injectionPoint,
    description: 'Perfect square layout with equal weights and balanced flow lengths'
  };
})();

// Test Case 2: Linear layout (extreme case for distribution)
// 测试用例2：线性布局（分布的极端情况）
export const linearLayout = (() => {
  const layout = [
    { x: 0, y: 0, width: 10, height: 10 },
    { x: 20, y: 0, width: 10, height: 10 },
    { x: 40, y: 0, width: 10, height: 10 },
    { x: 60, y: 0, width: 10, height: 10 }
  ] as Rectangle[];
  
  const injectionPoint = calculateInjectionPoint(layout);
  const flowLengths = calculateFlowLengths(layout, injectionPoint);
  
  return {
    layout,
    products: layout.map((_, i) => ({
      id: i,
      weight: 100,
      flowLength: flowLengths[i]
    })) as Product[],
    injectionPoint,
    description: 'Linear layout with increasing flow lengths'
  };
})();

// Test Case 3: Asymmetric weight distribution
// 测试用例3：不对称重量分布
export const asymmetricLayout = (() => {
  const layout = [
    { x: -30, y: -30, width: 60, height: 60 },
    { x: 30, y: -30, width: 30, height: 30 },
    { x: -30, y: 30, width: 30, height: 30 },
    { x: 30, y: 30, width: 60, height: 60 }
  ] as Rectangle[];
  
  const injectionPoint = calculateInjectionPoint(layout);
  const flowLengths = calculateFlowLengths(layout, injectionPoint);
  
  return {
    layout,
    products: layout.map((_, i) => ({
      id: i,
      weight: i === 0 || i === 3 ? 200 : 50,
      flowLength: flowLengths[i]
    })) as Product[],
    injectionPoint,
    description: 'Asymmetric layout with varying weights but equal flow lengths'
  };
})();

// Test Case 4: Extreme size differences
// 测试用例4：极端尺寸差异
export const extremeSizeLayout = (() => {
  const layout = [
    { x: -100, y: -100, width: 200, height: 200 }, // Very large
    { x: 110, y: -5, width: 10, height: 10 },     // Very small
    { x: -5, y: 110, width: 10, height: 10 },     // Very small
    { x: 110, y: 110, width: 10, height: 10 }     // Very small
  ] as Rectangle[];
  
  const injectionPoint = calculateInjectionPoint(layout);
  const flowLengths = calculateFlowLengths(layout, injectionPoint);
  
  return {
    layout,
    products: layout.map((_, i) => ({
      id: i,
      weight: i === 0 ? 1000 : 10,
      flowLength: flowLengths[i]
    })) as Product[],
    injectionPoint,
    description: 'Layout with extreme size and weight differences'
  };
})();

// Test Case 5: Dense cluster with offset injection point
// 测试用例5：密集布局，注胶点位于产品群中心
export const denseClusterLayout = (() => {
  const layout = [
    { x: 100, y: 100, width: 20, height: 20 },
    { x: 120, y: 100, width: 20, height: 20 },
    { x: 100, y: 120, width: 20, height: 20 },
    { x: 120, y: 120, width: 20, height: 20 }
  ] as Rectangle[];
  
  const injectionPoint = calculateInjectionPoint(layout);
  const flowLengths = calculateFlowLengths(layout, injectionPoint);
  
  return {
    layout,
    products: layout.map((_, i) => ({
      id: i,
      weight: 100,
      flowLength: flowLengths[i]
    })) as Product[],
    injectionPoint,
    description: 'Dense cluster layout with centered injection point'
  };
})();

// Test Case 6: Circular layout with varying sizes
// 测试用例6：环形布局，不同尺寸
export const circularLayout = (() => {
  const layout = [
    { x: -50, y: 0, width: 30, height: 30 },
    { x: 0, y: -50, width: 40, height: 40 },
    { x: 50, y: 0, width: 30, height: 30 },
    { x: 0, y: 50, width: 40, height: 40 }
  ] as Rectangle[];
  
  const injectionPoint = calculateInjectionPoint(layout);
  const flowLengths = calculateFlowLengths(layout, injectionPoint);
  
  return {
    layout,
    products: layout.map((_, i) => ({
      id: i,
      weight: i % 2 === 0 ? 80 : 120,
      flowLength: flowLengths[i]
    })) as Product[],
    injectionPoint,
    description: 'Circular layout with alternating product sizes and weights'
  };
})();

// Test Case 7: Z-shaped layout
// 测试用例7：Z形布局
export const zShapedLayout = (() => {
  const layout = [
    { x: -60, y: -60, width: 40, height: 40 },
    { x: 0, y: 0, width: 40, height: 40 },
    { x: 60, y: 60, width: 40, height: 40 }
  ] as Rectangle[];
  
  const injectionPoint = calculateInjectionPoint(layout);
  const flowLengths = calculateFlowLengths(layout, injectionPoint);
  
  return {
    layout,
    products: layout.map((_, i) => ({
      id: i,
      weight: 100,
      flowLength: flowLengths[i]
    })) as Product[],
    injectionPoint,
    description: 'Z-shaped layout with center of mass injection point'
  };
})();

// Test Case 8: Mixed volume products
// 测试用例8：混合体积产品
export const mixedVolumeLayout = (() => {
  const layout = [
    { x: -40, y: -40, width: 80, height: 80 },
    { x: 50, y: -30, width: 40, height: 40 },
    { x: -30, y: 50, width: 40, height: 40 },
    { x: 50, y: 50, width: 40, height: 40 }
  ] as Rectangle[];
  
  const injectionPoint = calculateInjectionPoint(layout);
  const flowLengths = calculateFlowLengths(layout, injectionPoint);
  
  return {
    layout,
    products: layout.map((_, i) => ({
      id: i,
      weight: i === 0 ? 200 : 100,
      flowLength: flowLengths[i],
      cadData: { volume: i === 0 ? 1000 : 500, surfaceArea: i === 0 ? 2000 : 1000 }
    })) as Product[],
    injectionPoint,
    description: 'Layout with varying volumes and surface areas'
  };
})();

// Test Case 9: Spiral layout
// 测试用例9：螺旋形布局
export const spiralLayout = (() => {
  const layout = [
    { x: 0, y: 0, width: 30, height: 30 },
    { x: 40, y: 0, width: 30, height: 30 },
    { x: 40, y: 40, width: 30, height: 30 },
    { x: 0, y: 40, width: 30, height: 30 },
    { x: -20, y: 20, width: 30, height: 30 }
  ] as Rectangle[];
  
  const injectionPoint = calculateInjectionPoint(layout);
  const flowLengths = calculateFlowLengths(layout, injectionPoint);
  
  return {
    layout,
    products: layout.map((_, i) => ({
      id: i,
      weight: 100,
      flowLength: flowLengths[i],
      cadData: {
        volume: 1000,
        surfaceArea: 900
      }
    })) as Product[],
    injectionPoint,
    description: 'Spiral layout with progressive flow lengths'
  };
})();

// Test Case 10: Extreme aspect ratio
// 测试用例10：极端宽高比
export const extremeAspectLayout = (() => {
  const layout = [
    { x: -100, y: -10, width: 200, height: 10 },  // Very wide
    { x: 110, y: -50, width: 10, height: 100 },   // Very tall
    { x: -50, y: 20, width: 10, height: 100 },    // Very tall
    { x: 50, y: 20, width: 200, height: 10 }      // Very wide
  ] as Rectangle[];
  
  const injectionPoint = calculateInjectionPoint(layout);
  const flowLengths = calculateFlowLengths(layout, injectionPoint);
  
  return {
    layout,
    products: layout.map((_, i) => ({
      id: i,
      weight: 100,
      flowLength: flowLengths[i]
    })) as Product[],
    injectionPoint,
    description: 'Layout with extreme aspect ratios'
  };
})();
