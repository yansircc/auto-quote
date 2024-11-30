import type { Rectangle, Product } from '@/types/geometry';
import type { DetailedGeometryScore } from '@/types/balance';
import { calculateWeightedVariance, weightedAverage } from '../../utils/math';

/**
 * Calculate geometry balance score
 * 计算几何平衡分数
 */
export function calculateGeometryScore(
  layout: Rectangle[],
  products: Product[]
): number {
  const detailedScore = calculateDetailedGeometryScore(layout, products);
  return detailedScore.overall;
}

/**
 * Calculate detailed geometry balance score
 * 计算详细的几何平衡分数
 */
export function calculateDetailedGeometryScore(
  layout: Rectangle[],
  products: Product[]
): DetailedGeometryScore {
  if (!layout.length || !products.length) {
    return {
      radialBalance: 0,
      quadrantBalance: 0,
      centerOffset: 0,
      overall: 0
    };
  }

  // Calculate weighted center of mass
  // 计算加权质心
  const totalWeight = products.reduce((sum, p) => sum + (p.weight ?? 0), 0);
  if (totalWeight === 0) {
    return {
      radialBalance: 0,
      quadrantBalance: 0,
      centerOffset: 0,
      overall: 0
    };
  }

  const centerOfMass = {
    x: products.reduce((sum, p, i) => {
      const product = products[i];
      const rect = layout[i];
      if (!product || !rect) return sum;
      return sum + ((product.weight ?? 0) * rect.x);
    }, 0) / totalWeight,
    y: products.reduce((sum, p, i) => {
      const product = products[i];
      const rect = layout[i];
      if (!product || !rect) return sum;
      return sum + ((product.weight ?? 0) * rect.y);
    }, 0) / totalWeight,
  };

  // Calculate radial balance
  // 计算径向平衡性
  const radialDistances = layout.map((rect, i) => {
    const product = products[i];
    if (!product || !rect) {
      throw new Error(`Invalid product or layout data at index ${i}`);
    }
    const dx = rect.x - centerOfMass.x;
    const dy = rect.y - centerOfMass.y;
    return {
      distance: Math.sqrt(dx * dx + dy * dy),
      weight: product.weight ?? 0,
    };
  });

  // 归一化方差，确保分数在0-100之间
  const variance = calculateWeightedVariance(
    radialDistances.map(d => d.distance),
    radialDistances.map(d => d.weight)
  );
  const maxDistance = Math.max(...radialDistances.map(d => d.distance));
  const normalizedVariance = variance / (maxDistance * maxDistance); // 归一化到0-1范围
  const radialBalance = Math.max(0, Math.min(100, 100 * (1 - normalizedVariance)));

  // Calculate quadrant balance
  // 计算象限平衡性
  const quadrants = [0, 0, 0, 0];
  layout.forEach((rect, i) => {
    const product = products[i];
    if (!product || !rect) {
      throw new Error(`Invalid product or layout data at index ${i}`);
    }
    const dx = rect.x - centerOfMass.x;
    const dy = rect.y - centerOfMass.y;
    const quadrant = (dx >= 0 ? (dy >= 0 ? 0 : 3) : (dy >= 0 ? 1 : 2));
    quadrants[quadrant]! += product.weight ?? 0;
  });

  // 使用相对差异计算象限平衡分数
  const maxQuadrant = Math.max(...quadrants);
  const minQuadrant = Math.min(...quadrants);
  const avgQuadrant = totalWeight / 4;
  const maxDeviation = Math.max(
    Math.abs(maxQuadrant - avgQuadrant),
    Math.abs(minQuadrant - avgQuadrant)
  );
  const quadrantBalance = Math.max(0, Math.min(100, 100 * (1 - maxDeviation / avgQuadrant)));

  // Calculate center offset
  // 计算中心偏移
  const centerDistance = Math.sqrt(centerOfMass.x * centerOfMass.x + centerOfMass.y * centerOfMass.y);
  const centerOffset = maxDistance === 0 ? 100 : 
    Math.max(0, Math.min(100, 100 * (1 - centerDistance / maxDistance)));

  // Calculate overall score as weighted average
  // 使用加权平均计算总体得分
  const overall = weightedAverage([
    [radialBalance, 0.4],     // 径向平衡权重 40%
    [quadrantBalance, 0.4],   // 象限平衡权重 40%
    [centerOffset, 0.2]       // 中心偏移权重 20%
  ]);

  return {
    radialBalance,
    quadrantBalance,
    centerOffset,
    overall
  };
}
