import { describe, it, expect } from 'vitest';
import { calculateBalanceScore } from '../score';
import type { Rectangle, Product, Point2D } from '@/lib/algorithm/types';
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
    expect(score.details.geometry).toBeGreaterThan(85);
    expect(score.details.flow).toBeGreaterThan(85);
  });

  // Test linear layout
  // 测试线性布局
  it('should give lower distribution score for linear layout', () => {
    const { layout, products, injectionPoint } = linearLayout;
    const score = calculateBalanceScore(layout, products, injectionPoint);
    
    // Linear layout should have poor distribution score
    // 线性布局应该有较低的分布分数
    expect(score.total).toBeLessThan(70);
    expect(score.details.distribution).toBeLessThan(60);
  });

  // Test asymmetric layout
  // 测试不对称布局
  it('should handle asymmetric weight distribution', () => {
    const { layout, products, injectionPoint } = asymmetricLayout;
    const score = calculateBalanceScore(layout, products, injectionPoint);
    
    // Asymmetric weights should affect geometry score
    // 不对称的重量应该影响几何分数
    expect(score.details.geometry).toBeLessThan(80);
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
    
    // Dense cluster should have good distribution score
    // 密集布局应该有好的分布分数
    expect(score.details.flow).toBeLessThan(80);
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
    
    // Z-shaped layout should have poor flow score
    // Z形布局应该有较低的流动分数
    expect(score.details.flow).toBeLessThan(75);
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
    expect(score.details.flow).toBeLessThan(85);
    expect(score.details.distribution).toBeGreaterThan(50);
  });

  // Test extreme aspect layout
  // 测试极端纵横比布局
  it('should handle extreme aspect ratios', () => {
    const { layout, products, injectionPoint } = extremeAspectLayout;
    const score = calculateBalanceScore(layout, products, injectionPoint);
    
    // Extreme aspect layout should affect total score more than geometry
    // 极端纵横比布局应该更多地影响总分而不是几何分数
    expect(score.total).toBeLessThan(75);
    expect(score.details.distribution).toBeLessThan(70);
  });

  // Test comparison between layouts
  // 测试布局之间的比较
  it('should rank layouts appropriately', () => {
    const layouts = [
      perfectSquareLayout,
      circularLayout,
      spiralLayout,
      zShapedLayout,
      linearLayout
    ];

    const scores = layouts.map(({ layout, products, injectionPoint }) => 
      calculateBalanceScore(layout, products, injectionPoint).total
    );

    // Verify all scores are defined and valid numbers
    // 验证所有分数都有定义且是有效数字
    expect(scores).toHaveLength(5);
    scores.forEach((score, _index) => {
      expect(score).toBeDefined();
      expect(typeof score).toBe('number');
      expect(Number.isFinite(score)).toBe(true);
    });

    // Compare scores in descending order of expected quality
    // 按预期质量降序比较分数
    for (let i = 0; i < scores.length - 1; i++) {
      const currentScore = scores[i];
      const nextScore = scores[i + 1];
      if (currentScore !== undefined && nextScore !== undefined) {
        expect(currentScore).toBeGreaterThan(nextScore);
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
    expect(score.details.geometry).toBe(0);
    expect(score.details.distribution).toBe(0);
  });
});