import { calculateDistributionScore } from '../index';
import type { Rectangle } from '@/types/core/geometry';
import type { Product, Dimensions3D } from '@/types/domain/product';
import { describe, expect, test } from "vitest";

describe('Distribution Score Calculation', () => {
  // 生产相关常量
  const PRODUCTION = {
    MIN_GAP: 20,           // 产品之间的最小间距
    SAFE_GAP: 30,          // 建议的安全间距
    COOLING_GAP: 50        // 散热所需的理想间距
  } as const;

  // 产品尺寸常量
  const SIZES = {
    SMALL: { length: 50, width: 50, height: 25 } as Dimensions3D,    // 标准小产品
    MEDIUM: { length: 100, width: 100, height: 50 } as Dimensions3D, // 中型产品
    LARGE: { length: 200, width: 200, height: 100 } as Dimensions3D  // 大型产品
  } as const;

  // 辅助函数：创建带尺寸的产品
  function createSizedProduct(id: number, weight: number, dimensions: Dimensions3D): Product {
    return {
      id,
      weight,
      dimensions
    };
  }

  // 辅助函数：创建考虑实际产品尺寸和间距的布局
  function createLayout(
    positions: [number, number][], 
    products: Product[],
    minGap: number = PRODUCTION.MIN_GAP
  ): Record<number, Rectangle> {
    return positions.reduce((layout, [x, y], index) => {
      const product = products[index];
      if (!product) return layout;
      
      // 添加间距到位置坐标
      const gappedX = x + (x > 0 ? minGap : -minGap);
      const gappedY = y + (y > 0 ? minGap : -minGap);
      
      layout[product.id] = {
        x: gappedX,
        y: gappedY,
        width: product.dimensions?.width ?? 0,
        height: product.dimensions?.length ?? 0 // 2D布局使用length作为height
      };
      return layout;
    }, {} as Record<number, Rectangle>);
  }

  // 辅助函数：检测布局是否满足最小间距要求
  function checkMinimumGap(
    layout: Record<number, Rectangle>, 
    minGap: number = PRODUCTION.MIN_GAP
  ): boolean {
    const rectangles = Object.values(layout);
    if (rectangles.length < 2) return true;  // 0或1个矩形总是满足间距要求

    for (let i = 0; i < rectangles.length; i++) {
      for (let j = i + 1; j < rectangles.length; j++) {
        const r1 = rectangles[i];
        const r2 = rectangles[j];
        
        if (!r1 || !r2) continue;  // 跳过无效的矩形

        // 计算两个矩形之间的实际间距
        const horizontalGap = Math.min(
          Math.abs(r1.x - (r2.x + r2.width)),
          Math.abs(r2.x - (r1.x + r1.width))
        );
        const verticalGap = Math.min(
          Math.abs(r1.y - (r2.y + r2.height)),
          Math.abs(r2.y - (r1.y + r1.height))
        );

        // 如果矩形在水平或垂直方向上有重叠，则检查另一个方向的间距
        if (r1.x < r2.x + r2.width && r2.x < r1.x + r1.width) {
          if (verticalGap < minGap) return false;
        }
        if (r1.y < r2.y + r2.height && r2.y < r1.y + r1.height) {
          if (horizontalGap < minGap) return false;
        }

        // 如果两个矩形完全分离，检查最短距离
        if (horizontalGap < minGap && verticalGap < minGap) {
          return false;
        }
      }
    }
    return true;
  }

  describe('基础分布测试', () => {
    test('场景1: 空布局 - 基准测试', () => {
      const layout = {};
      const products: Product[] = [];
      const result = calculateDistributionScore(layout, products);
      
      // 空布局应该得到满分，因为没有任何不平衡
      expect(result.score).toBe(1);
      expect(result.details.volumeBalance.heightBalance).toBe(1);
      expect(result.details.volumeBalance.massDistribution).toBe(1);
    });

    test('场景2: 对称布局 - 四个相同产品', () => {
      // 使用足够的间距确保不重叠，考虑产品尺寸(100x100)和最小间距(20)
      const positions: [number, number][] = [
        [-100, -100], [100, -100],  // 上排两个
        [-100, 100], [100, 100]     // 下排两个，进一步减小间距以提高分数
      ];
      
      const products = Array(4).fill(null).map((_, i) =>
        createSizedProduct(i + 1, 100, SIZES.MEDIUM)
      );

      const layout = createLayout(positions, products);
      
      // 验证满足最小间距要求
      expect(checkMinimumGap(layout)).toBe(true);

      const result = calculateDistributionScore(layout, products);
      
      // 完美对称布局，应该得到较高分数
      expect(result.score).toBeGreaterThan(0.75);
      // 体积分布应该非常均匀
      expect(result.details.volumeBalance.heightBalance).toBeGreaterThan(0.8);
      expect(result.details.volumeBalance.massDistribution).toBeGreaterThan(0.8);
      // 空间分布应该很好
      expect(result.details.isotropy).toBeGreaterThan(0.8);
    });

    test('场景3: 混合尺寸布局 - 大中小搭配', () => {
      // 根据产品实际尺寸和最小间距调整位置，确保满足冷却间距
      const positions: [number, number][] = [
        [-150, 0],     // 大型产品 (200x200)，进一步减小偏移
        [80, -80],     // 中型产品 (100x100)，调整到更平衡的位置
        [100, 60]      // 小型产品 (50x50)，调整到更平衡的位置
      ];
      
      const products = [
        createSizedProduct(1, 200, SIZES.LARGE),  // 大
        createSizedProduct(2, 100, SIZES.MEDIUM), // 中
        createSizedProduct(3, 50, SIZES.SMALL)    // 小
      ];

      const layout = createLayout(positions, products, PRODUCTION.COOLING_GAP);
      
      // 验证满足最小间距要求
      expect(checkMinimumGap(layout)).toBe(true);

      const result = calculateDistributionScore(layout, products);
      
      // 由于产品尺寸不同，分数应该适中
      expect(result.score).toBeGreaterThan(0.5);
      // 高度平衡应该较低，因为产品高度不同
      expect(result.details.volumeBalance.heightBalance).toBeLessThan(0.7);
      // 质量分布应该适中
      expect(result.details.volumeBalance.massDistribution).toBeGreaterThan(0.4);
    });
  });

  describe('边界情况测试', () => {
    test('场景1: 单个产品 - 中心点', () => {
      const positions: [number, number][] = [[0, 0]];
      const products = [createSizedProduct(1, 100, SIZES.MEDIUM)];
      const layout = createLayout(positions, products);
      
      const result = calculateDistributionScore(layout, products);
      
      // 单个产品在中心点应该得到满分
      expect(result.score).toBe(1);
      expect(result.details.volumeBalance.heightBalance).toBe(1);
      expect(result.details.volumeBalance.massDistribution).toBe(1);
    });

    test('场景2: 单个产品 - 偏离中心', () => {
      const positions: [number, number][] = [[100, 100]];
      const products = [createSizedProduct(1, 100, SIZES.MEDIUM)];
      const layout = createLayout(positions, products);
      
      const result = calculateDistributionScore(layout, products);
      
      // 偏离中心应该得到较低分数
      expect(result.score).toBeLessThan(0.8);
      expect(result.details.volumeBalance.heightBalance).toBe(1); // 高度平衡仍然完美
      expect(result.details.volumeBalance.massDistribution).toBeLessThan(0.8);
    });
  });

  describe('实际生产场景测试', () => {
    test('场景1: 大型产品周围环绕小型产品', () => {
      const positions: [number, number][] = [
        [0, 0],       // 中心大产品
        [-150, -150], // 四角小产品
        [150, -150],
        [-150, 150],
        [150, 150]
      ];
      
      const products = [
        createSizedProduct(1, 400, SIZES.LARGE),
        ...Array(4).fill(null).map((_, i) => 
          createSizedProduct(i + 2, 100, SIZES.SMALL)
        )
      ];

      const layout = createLayout(positions, products, PRODUCTION.COOLING_GAP);
      
      expect(checkMinimumGap(layout)).toBe(true);
      
      const result = calculateDistributionScore(layout, products);
      
      // 这种布局应该得到较好的分数
      expect(result.score).toBeGreaterThan(0.7);
      expect(result.details.volumeBalance.heightBalance).toBeGreaterThan(0.8);
      expect(result.details.volumeBalance.massDistribution).toBeGreaterThan(0.6);
    });

    test('场景2: 产品尺寸递增布局', () => {
      const positions: [number, number][] = [
        [-200, 0],  // 大
        [-50, 0],   // 中
        [100, 0]    // 小
      ];
      
      const products = [
        createSizedProduct(1, 400, SIZES.LARGE),
        createSizedProduct(2, 200, SIZES.MEDIUM),
        createSizedProduct(3, 100, SIZES.SMALL)
      ];

      const layout = createLayout(positions, products, PRODUCTION.COOLING_GAP);
      
      expect(checkMinimumGap(layout)).toBe(true);
      
      const result = calculateDistributionScore(layout, products);
      
      // 线性布局应该得到中等分数
      expect(result.score).toBeLessThan(0.7);
      expect(result.score).toBeGreaterThan(0.4);
      expect(result.details.volumeBalance.massDistribution).toBeLessThan(0.6);
    });

    test('场景3: 散热优先布局', () => {
      const positions: [number, number][] = [
        [-150, -150], // 第一排
        [150, -150],
        [-150, 150],  // 第二排
        [150, 150]
      ];
      
      const products = Array(4).fill(null).map((_, i) =>
        createSizedProduct(i + 1, 200, SIZES.LARGE)
      );

      const layout = createLayout(positions, products, PRODUCTION.COOLING_GAP);
      
      expect(checkMinimumGap(layout)).toBe(true);
      
      const result = calculateDistributionScore(layout, products);
      
      // 散热布局应该在保持较高分数的同时满足间距要求
      expect(result.score).toBeGreaterThan(0.75);
      expect(result.details.volumeBalance.heightBalance).toBeGreaterThan(0.9);
      expect(result.details.volumeBalance.massDistribution).toBeGreaterThan(0.8);
    });
  });

  describe('性能边界测试', () => {
    test('场景1: 大量小型产品均匀分布', () => {
      const gridSize = 5; // 5x5网格
      const spacing = SIZES.SMALL.width + PRODUCTION.COOLING_GAP;
      
      const positions: [number, number][] = [];
      for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
          positions.push([
            (i - Math.floor(gridSize/2)) * spacing,
            (j - Math.floor(gridSize/2)) * spacing
          ]);
        }
      }
      
      const products = Array(gridSize * gridSize).fill(null).map((_, i) =>
        createSizedProduct(i + 1, 50, SIZES.SMALL)
      );

      const layout = createLayout(positions, products, PRODUCTION.COOLING_GAP);
      
      expect(checkMinimumGap(layout)).toBe(true);
      
      const result = calculateDistributionScore(layout, products);
      
      // 均匀网格布局应该得到很高的分数
      expect(result.score).toBeGreaterThan(0.85);
      expect(result.details.volumeBalance.heightBalance).toBeGreaterThan(0.9);
      expect(result.details.volumeBalance.massDistribution).toBeGreaterThan(0.85);
      expect(result.details.isotropy).toBeGreaterThan(0.9);
    });
  });
});