import type { Rectangle, Point2D, Product } from '@/types/geometry';
import { calculateRectCenter } from '../../utils/geometry';
import { calculateWeightedVariance } from '../../utils/math';

/**
 * Calculate distribution balance score
 * 计算分布平衡分数
 */
export function calculateDistributionScore(
  layout: Rectangle[],
  products: Product[]
): number {
  if (!layout.length || !products.length) return 0;

  const positions = layout.map(calculateRectCenter);
  const weights = products.map(p => p.weight ?? 0);

  return calculateSpatialDistributionScore(positions, weights);
}

/**
 * Calculate spatial distribution score
 * 计算空间分布得分
 */
function calculateSpatialDistributionScore(
  positions: Point2D[],
  weights: number[]
): number {
  if (!positions.length || !weights.length) return 0;

  // Calculate weighted center
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  if (totalWeight === 0) return 0;

  const weightedCenter = {
    x: positions.reduce((sum, pos, i) => sum + pos.x * weights[i]!, 0) / totalWeight,
    y: positions.reduce((sum, pos, i) => sum + pos.y * weights[i]!, 0) / totalWeight
  };

  // Calculate distances from center
  const distances = positions.map(pos => {
    const dx = pos.x - weightedCenter.x;
    const dy = pos.y - weightedCenter.y;
    return Math.sqrt(dx * dx + dy * dy);
  });

  // Calculate weighted variance of distances
  const variance = calculateWeightedVariance(distances, weights);

  // Calculate max distance for normalization
  const maxDistance = Math.max(...distances);
  if (maxDistance === 0) return 100;

  // Normalize variance and convert to score
  const normalizedVariance = variance / (maxDistance * maxDistance);
  return Math.max(0, Math.min(100, 100 * (1 - normalizedVariance)));
}
