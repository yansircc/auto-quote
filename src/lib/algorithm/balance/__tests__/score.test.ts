import { describe, it, expect } from 'vitest';
import { calculateBalanceScore } from '../score';
import type { Rectangle, Point2D } from '@/types/core/geometry';
import type { Product } from '@/types/domain/product';
import {
  perfectSquareLayout,
  linearLayout,
  asymmetricLayout,
  extremeSizeLayout,
  denseClusterLayout,
  circularLayout,
  zShapedLayout,
  mixedVolumeLayout,
  spiralLayout,
  extremeAspectLayout
} from './testData';

describe('Balance Score Calculations', () => {
  // Test perfect square layout
  // 测试完美正方形布局
  it('should give perfect score for balanced square layout', () => {
    const { layout, products, injectionPoint } = perfectSquareLayout;
    const score = calculateBalanceScore(layout, products, injectionPoint);
    
    // Perfect layout should have high scores in all aspects
    // 完美布局应该在所有方面都有很高的分数
    expect(score.total).toBeGreaterThan(90);
    expect(score.details.flow).toBeGreaterThan(85);
    expect(score.details.distribution).toBeGreaterThan(85);
  });

  // Test linear layout
  // 测试线性布局
  it('should give lower distribution score for linear layout', () => {
    const { layout, products, injectionPoint } = linearLayout;
    const score = calculateBalanceScore(layout, products, injectionPoint);
    
    // Linear layout should have poor distribution score
    // 线性布局应该有较低的分布分数
    expect(score.details.distribution).toBeLessThan(60);
  });

  // Test asymmetric layout
  // 测试不对称布局
  it('should handle asymmetric weight distribution', () => {
    const { layout, products, injectionPoint } = asymmetricLayout;
    const score = calculateBalanceScore(layout, products, injectionPoint);
    
    // Asymmetric weights should affect distribution score
    // 不对称的重量应该影响分布分数
    expect(score.details.distribution).toBeLessThan(80);
  });

  // Test extreme size differences
  // 测试极端尺寸差异
  it('should handle extreme size and weight differences', () => {
    const { layout, products, injectionPoint } = extremeSizeLayout;
    const score = calculateBalanceScore(layout, products, injectionPoint);
    
    // Extreme differences should result in lower scores
    // 极端差异应该导致较低的分数
    expect(score.total).toBeLessThan(70);
    expect(score.details.distribution).toBeLessThan(60);
  });

  // Test dense cluster with offset injection
  // 测试偏移注塑点的密集布局
  it('should evaluate dense cluster with offset injection point', () => {
    const { layout, products, injectionPoint } = denseClusterLayout;
    const score = calculateBalanceScore(layout, products, injectionPoint);
    
    // Dense cluster should have excellent flow score due to compact layout
    // 密集布局应该有很好的流动分数，因为布局紧凑
    expect(score.details.flow).toBeGreaterThan(90);
    expect(score.details.distribution).toBeGreaterThan(70);
  });

  // Test circular layout
  // 测试圆形布局
  it('should evaluate circular layout balance', () => {
    const { layout, products, injectionPoint } = circularLayout;
    const score = calculateBalanceScore(layout, products, injectionPoint);
    
    // Circular layout should have good balance score
    // 圆形布局应该有好的平衡分数
    expect(score.total).toBeGreaterThan(75);
    expect(score.details.flow).toBeGreaterThan(80);
    expect(score.details.distribution).toBeGreaterThan(70);
  });

  // Test Z-shaped layout
  // 测试Z形布局
  it('should handle Z-shaped layout', () => {
    const { layout, products, injectionPoint } = zShapedLayout;
    const score = calculateBalanceScore(layout, products, injectionPoint);
    
    // Z-shaped layout should have moderate flow score due to progressive distances
    // Z形布局应该有中等的流动分数，因为距离是渐进的
    expect(score.details.flow).toBeGreaterThan(30);
    expect(score.details.flow).toBeLessThan(50);
    expect(score.details.distribution).toBeLessThan(70);
  });

  // Test mixed volume layout
  // 测试混合体积布局
  it('should consider volume variations', () => {
    const { layout, products, injectionPoint } = mixedVolumeLayout;
    const score = calculateBalanceScore(layout, products, injectionPoint);
    
    // Mixed volume layout should have volume score
    // 混合体积布局应该有体积分数
    expect(score.details.volume).toBeDefined();
    expect(score.details.volume).toBeLessThan(80);
  });

  // Test spiral layout
  // 测试螺旋布局
  it('should evaluate spiral layout flow balance', () => {
    const { layout, products, injectionPoint } = spiralLayout;
    const score = calculateBalanceScore(layout, products, injectionPoint);
    
    // Spiral layout should have moderate flow balance score
    // 螺旋布局应该有中等的流动平衡分数
    expect(score.details.flow).toBeGreaterThan(60);
    expect(score.details.flow).toBeLessThan(85);
    expect(score.details.distribution).toBeGreaterThan(50);
  });

  // Test extreme aspect layout
  // 测试极端纵横比布局
  it('should handle extreme aspect ratios', () => {
    const { layout, products, injectionPoint } = extremeAspectLayout;
    const score = calculateBalanceScore(layout, products, injectionPoint);
    
    // Extreme aspect layout should affect total score significantly
    // 极端纵横比布局应该显著影响总分
    expect(score.total).toBeLessThan(80);
    expect(score.details.distribution).toBeLessThan(70);
  });

  // Test comparison between layouts
  // 测试布局之间的比较
  it('should rank layouts appropriately', () => {
    const layouts = [
      perfectSquareLayout,  // 最理想布局：完美对称，流长一致
      circularLayout,       // 次优布局：环形分布，流长较为均匀
      denseClusterLayout,   // 第三档：紧凑布局，流长差异可控
      zShapedLayout,       // 次差布局：Z形分布，流长差异较大
      linearLayout         // 最差布局：线性分布，流长差异极大
    ];

    const layoutScores = layouts.map((layout, index) => {
      const score = calculateBalanceScore(layout.layout, layout.products, layout.injectionPoint);
      const layoutNames = ['Perfect Square', 'Circular', 'Dense Cluster', 'Z-shaped', 'Linear'];
      return {
        name: layoutNames[index],
        total: score.total,
        flow: score.details.flow,
        distribution: score.details.distribution
      };
    });

    // Print detailed scores for debugging
    console.log('\nLayout Scores:');
    layoutScores.forEach(score => {
      console.log(`${score.name}:`, {
        total: score.total.toFixed(2),
        flow: score.flow.toFixed(2),
        distribution: score.distribution.toFixed(2)
      });
    });

    const scores = layoutScores.map(s => s.total);

    // Verify all scores are defined and valid numbers
    expect(scores).toHaveLength(5);
    scores.forEach((score, index) => {
      expect(score).toBeDefined();
      expect(typeof score).toBe('number');
      expect(Number.isFinite(score)).toBe(true);
      
      // Add score range expectations based on layout type
      switch(index) {
        case 0: // perfectSquareLayout
          expect(score).toBeGreaterThan(90); // 完美布局 > 90
          break;
        case 1: // circularLayout
          expect(score).toBeGreaterThan(85); // 环形布局 > 85
          break;
        case 2: // denseClusterLayout
          expect(score).toBeGreaterThan(85); // 密集布局 > 85
          break;
        case 3: // zShapedLayout
          expect(score).toBeGreaterThan(50); // Z形布局 > 50
          break;
        case 4: // linearLayout
          expect(score).toBeGreaterThan(40); // 线性布局 > 40
          expect(score).toBeLessThan(60);    // 但不应超过60
          break;
      }
    });

    // Check for reasonable score differences between adjacent layouts
    // 检查相邻布局之间的分数差异是否合理
    for (let i = 0; i < scores.length - 1; i++) {
      const currentScore = scores[i]!;
      const nextScore = scores[i + 1]!;
      const scoreDiff = currentScore - nextScore;
      
      // 相邻布局的分数差异应该在合理范围内
      if (i < 2) {
        // 前三个布局（完美方形、圆形、密集）之间的差异应该较小
        expect(scoreDiff).toBeLessThan(10);
      } else {
        // 其他布局之间的差异可以稍大
        expect(scoreDiff).toBeLessThan(40);
      }
    }
  });

  // Test edge cases
  // 测试边界情况
  it('should handle empty layout', () => {
    const emptyLayout: Rectangle[] = [];
    const emptyProducts: Product[] = [];
    const injectionPoint: Point2D = { x: 0, y: 0 };

    const score = calculateBalanceScore(emptyLayout, emptyProducts, injectionPoint);
    expect(score.total).toBe(0);
    expect(score.details.flow).toBe(0);
    expect(score.details.distribution).toBe(0);
    expect(score.details.volume).toBe(0);
  });
});

// bun test src/lib/algorithm/balance/__tests__/score.test.ts